# FreeCRMpRO — 14-Day Trial, Subscriptions, Secure Gemini AI

## Context

FreeCRMpRO needs a monetization + AI layer: a 14-day free trial that grants full
access, a server-enforced gate that blocks paid features (especially AI) once the
trial expires without an active subscription, Stripe checkout for Monthly ($25/mo)
and Yearly ($200/yr) plans, and secure server-side Gemini calls for the app's AI
features. Today the billing page is static (hardcoded tiers, no logic), all "AI" is
deterministic local template logic in `store.tsx`, and there is no notion of
subscription state anywhere.

### Environment realities (spec adapted, not followed literally)

This is **React + Vite**, not Next.js, with a **Hono Supabase Edge Function**
(`supabase/functions/server/index.tsx`) and a **single KV table** as the only
datastore. Therefore:

- **No `organizations` Postgres table and no SQL migration** are possible (the Make
  platform forbids DDL). We model **one user = one org** and store subscription
  state as a KV record `subscription:${userId}`. The field set matches the spec
  (trial_start_date, trial_end_date, subscription_status, plan_type,
  stripe_customer_id, stripe_subscription_id, current_period_end).
- **No Next.js middleware.** Access control is a shared server-side helper in the
  edge function, applied to every protected/AI route.
- **Gemini/Stripe keys** live only as Edge Function secrets (`create_supabase_secret`
  tool). Client never talks to Gemini/Stripe directly. Both integrations **fall back
  gracefully** when their keys are absent (Gemini → existing local templates; Stripe
  → simulated checkout that still flips the subscription to active for testing).
- **Gating scope (per user):** AI routes are **hard-blocked** server-side on expiry.
  UI is **soft-locked** — Dashboard shows an upgrade state, other pages remain
  viewable, Billing is always reachable, Upgrade button always visible.

---

## Deliverable 1 — Subscription record (replaces "SQL migration")

KV shape written at signup and updated by webhooks. Represent timestamps as epoch ms.

```
subscription:${userId} = {
  trial_start_date: number,
  trial_end_date: number,          // trial_start + 14*86_400_000
  subscription_status: "trialing" | "active" | "expired" | "canceled",
  plan_type: "monthly" | "yearly" | null,
  stripe_customer_id: string | null,
  stripe_subscription_id: string | null,
  current_period_end: number | null,
}
```

- **`supabase/functions/server/index.tsx`** — in the existing `/signup` route
  (after `kv.set(workspace...)`), also `kv.set(subscription:${userId}, {...trialing})`.
- Add a `getSubscription(userId)` helper that returns the record, **lazily
  backfilling** a trialing record for pre-existing users who signed up before this
  feature (so old accounts get a trial starting now rather than being locked out).

---

## Deliverable 2 — Access-control helper (server-side)

In `index.tsx`, add:

```
function accessState(sub): { allowed: boolean; status; trialEndsAt; daysLeft }
// allowed = status === "active" || (status === "trialing" && Date.now() < trial_end_date)
async function requireAccess(c): { user } | Response(403, { error, code })
// resolves user via existing getUser(c); loads subscription; if !allowed →
//   403 { code: "TRIAL_EXPIRED" | "SUBSCRIPTION_REQUIRED" }
```

Reuse the existing `getUser(c)` (already in `index.tsx`). Apply `requireAccess` to
all AI routes (Deliverable 3). **Do not** gate `GET/PUT /workspace` (soft-lock keeps
data reachable so Billing works and the UI can self-lock); the expensive/valuable
operations (AI) are the server-enforced boundary.

New public read route: `GET /subscription` (auth required, no access gate) → returns
`{ status, trialEndsAt, daysLeft, plan_type, current_period_end }` for the frontend.

---

## Deliverable 3 — Secure Gemini AI routes (gated) + graceful fallback

Add a `callGemini(prompt, systemInstruction?)` helper using
`GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")` against the Gemini REST endpoint
(`v1beta/models/gemini-2.0-flash:generateContent`). If the key is missing or the call
errors, the route returns a `{ result, source: "fallback" }` computed by porting the
existing deterministic logic; on success `source: "gemini"`.

Routes (all wrapped by `requireAccess`, all under the `/make-server-ac29d601` prefix):

| Route | Body | Fallback source (from `store.tsx`) |
|-------|------|-------------------------------------|
| `POST /ai/score-lead` | contact fields | `scoreContact` logic |
| `POST /ai/draft-email` | contactName, purpose, context | `draftEmail` |
| `POST /ai/summarize-call` | outcome, durationSec, notes, contactName | `generateCallSummary` |
| `POST /ai/deal-probability` | deal + linked contact | `dealProbability` |
| `POST /ai/task-suggestions` | contacts/deals summary | new heuristic (stale contacts, open high-score leads) |

Frontend wiring — add `src/app/ai.ts` with a `callAI(path, body, accessToken)` helper
that POSTs to `${SERVER_URL}/ai/...`. On `403 TRIAL_EXPIRED` it throws a typed error
the UI catches to open the upgrade modal. Update call sites to try the server first
and fall back to the local `store.tsx` function on any non-403 error (keeps the app
fully functional offline / without keys):

- **`Email.tsx`** ("AI draft" button, ~line 31) → `/ai/draft-email`.
- **`Calls.tsx`** (regenerate, ~line 27) and **`forms.tsx`** `CallDialog` (~line 550)
  → `/ai/summarize-call`.
- **Lead scoring / deal probability / smart tasks**: keep the synchronous local
  `scoreContact`/`dealProbability` for instant list rendering (they power sorting in
  Contacts/Dashboard/Pipeline and must stay sync), and add an **explicit "AI refresh"
  affordance** (Contacts detail, Pipeline card, new Tasks "Smart suggestions" panel)
  that calls the gated server route — this is what satisfies "AI calls rejected on
  expiry" without breaking base rendering. The local functions remain the fallback.

`store.tsx` keeps `scoreContact`, `scoreTrend`, `dealProbability`, `draftEmail`,
`generateCallSummary` unchanged (now doubling as the fallback implementations).

---

## Deliverable 4 — Stripe Checkout + webhooks (with fallback)

Use `npm:stripe`. Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Prices are
created inline via `price_data` (amounts $25/mo, $200/yr) so no dashboard price IDs
are required.

- `POST /billing/checkout` (auth) — body `{ plan: "monthly" | "yearly" }`.
  - If `STRIPE_SECRET_KEY` set: create/reuse a customer, create a Checkout Session
    (subscription mode, inline price_data), `success_url`/`cancel_url` back to the app
    with `?upgrade=success|cancel`; return `{ url }`.
  - **Fallback (no key):** immediately mark `subscription:${userId}` active with the
    chosen plan and a +30/+365-day `current_period_end`; return
    `{ url: null, simulated: true }` so the UI can show the success state directly.
- `POST /billing/webhook` — raw-body signature verify with `STRIPE_WEBHOOK_SECRET`
  (register this path **before** any body-parsing; read `c.req.raw`). Handle:
  - `checkout.session.completed` → status `active`, set plan_type, stripe ids,
    current_period_end.
  - `invoice.paid` → refresh current_period_end.
  - `customer.subscription.deleted` / payment failure → status `canceled`/`expired`.
  - Map Stripe customer/subscription id back to the user (store a reverse KV key
    `stripe_customer:${customerId} = userId` at checkout time).

CORS already allows POST; the webhook route must skip the JSON logger body read — it
uses the raw request for signature verification.

---

## Deliverable 5 — Frontend components

New context **`src/app/subscription.tsx`** — `SubscriptionProvider` fetches
`GET /subscription` after auth, exposes `{ status, daysLeft, trialEndsAt, isLocked,
refresh() }` where `isLocked = status !== "active" && !(status === "trialing" &&
daysLeft > 0)`. Wrap `<Workspace>` in `App.tsx` inside it (alongside `StoreProvider`).

- **Trial countdown badge** — in `Layout.tsx` topbar (next to the segment dropdown):
  shows `"{daysLeft} days left in your free trial"` only while `status === "trialing"`.
- **Persistent Upgrade button** — in `Layout.tsx` topbar, always rendered, routes to
  `setPage("billing")`. (Sidebar already has a Billing item.)
- **Billing/Upgrade page** — rewrite `src/app/components/pages/Billing.tsx` to two
  live plan cards: Monthly $25/mo and Yearly $200/yr (badge "Best value · save
  $100/year"). Buttons call `/billing/checkout`; if `{ url }` → `window.location =
  url`, if `simulated` → toast + `refresh()` + success state. Show current status
  (trialing/active/expired) and `current_period_end` from context. Keep existing
  design tokens/card style.
- **Trial-expired state** — new `src/app/components/pages/UpgradeState.tsx`. Rendered
  by `Dashboard` when `isLocked` (soft lock): full-card upgrade wall with CTA to
  Billing. Other pages stay viewable. Also, the AI upgrade **modal** (shared small
  component) opens whenever any `callAI` throws `TRIAL_EXPIRED`.
- **Post-upgrade success** — on `?upgrade=success` (Stripe redirect) or simulated
  upgrade, `App.tsx` reads the query param, calls `subscription.refresh()`, routes to
  Dashboard, and shows a success toast.

---

## Critical files

- `supabase/functions/server/index.tsx` — subscription record, `requireAccess`,
  `/subscription`, `/ai/*`, `/billing/checkout`, `/billing/webhook`, Gemini + Stripe
  helpers.
- `src/app/store.tsx` — unchanged AI functions reused as fallbacks (no edits needed
  beyond possible re-export).
- `src/app/ai.ts` *(new)*, `src/app/subscription.tsx` *(new)*.
- `src/app/App.tsx` — wrap in `SubscriptionProvider`, handle `?upgrade=` param.
- `src/app/components/Layout.tsx` — countdown badge + persistent Upgrade button.
- `src/app/components/pages/Billing.tsx` — rewrite to Monthly/Yearly + checkout.
- `src/app/components/pages/Dashboard.tsx` — soft-lock upgrade state.
- `src/app/components/pages/UpgradeState.tsx` *(new)*, AI upgrade modal *(new, small)*.
- Call-site edits: `Email.tsx`, `Calls.tsx`, `forms.tsx`, plus AI-refresh affordances
  in `Contacts.tsx` / `Pipeline.tsx` / `Tasks.tsx`.
- Secrets via `create_supabase_secret`: `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`.

## Verification

1. **Trial start:** sign up a fresh user → `GET /subscription` returns
   `status:"trialing"`, `daysLeft:14`; topbar shows countdown; all features + AI work.
2. **AI live/fallback:** click "AI draft" in Email and "Regenerate" in Calls — with no
   `GEMINI_API_KEY` the response is `source:"fallback"` and still populates; after
   setting the secret + redeploy it returns `source:"gemini"`.
3. **Expiry gate (server):** temporarily set a test user's `trial_end_date` to the
   past via a throwaway KV write, then call an `/ai/*` route → expect `403
   TRIAL_EXPIRED`; UI opens the upgrade modal; Dashboard shows the upgrade wall while
   other pages stay viewable.
4. **Checkout fallback:** on Billing choose Monthly/Yearly with no Stripe key →
   `simulated:true`, status flips to `active`, Dashboard unlocks, success toast shows.
5. **Checkout live + webhook:** with Stripe test keys, complete Checkout; confirm
   `checkout.session.completed` sets `active`/plan/ids/period end; simulate
   `customer.subscription.deleted` → status `canceled` and the gate re-engages.
6. **Persistent upgrade:** confirm the Upgrade button is present in the topbar in
   trialing, active, and expired states.

> Note: the edge function must be deployed from Make settings for any server route
> (signup, subscription, AI, billing) to work — same prerequisite as existing auth.
