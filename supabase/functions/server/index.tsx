import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PREFIX = "/make-server-ac29d601";
const EMPTY = {
  contacts: [],
  deals: [],
  tasks: [],
  properties: [],
  companies: [],
  events: [],
  calls: [],
  documents: [],
  emails: [],
  campaigns: [],
  forms: [],
  submissions: [],
};

app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// Resolve the authenticated user from the bearer token.
async function getUser(c: any) {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];
  if (!accessToken) return { error: "Missing Authorization token" };
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data?.user?.id) {
    return { error: `Auth error: ${error?.message ?? "invalid token"}` };
  }
  return { user: data.user };
}

// ---------------------------------------------------------------------------
// Subscription / trial state (KV — one user == one org in this environment)
// ---------------------------------------------------------------------------
const DAY_MS = 86_400_000;
const TRIAL_DAYS = 14;

type SubStatus = "trialing" | "active" | "expired" | "canceled";
interface Subscription {
  trial_start_date: number;
  trial_end_date: number;
  subscription_status: SubStatus;
  plan_type: "monthly" | "yearly" | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: number | null;
}

function newTrial(start = Date.now()): Subscription {
  return {
    trial_start_date: start,
    trial_end_date: start + TRIAL_DAYS * DAY_MS,
    subscription_status: "trialing",
    plan_type: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    current_period_end: null,
  };
}

// Load the subscription, lazily backfilling a trial for users created before
// this feature existed (so they aren't locked out immediately).
async function getSubscription(userId: string): Promise<Subscription> {
  const existing = (await kv.get(`subscription:${userId}`)) as Subscription | null;
  if (existing) return existing;
  const fresh = newTrial();
  await kv.set(`subscription:${userId}`, fresh);
  return fresh;
}

function accessState(sub: Subscription) {
  const now = Date.now();
  const trialing = sub.subscription_status === "trialing" && now < sub.trial_end_date;
  const allowed = sub.subscription_status === "active" || trialing;
  const daysLeft = Math.max(0, Math.ceil((sub.trial_end_date - now) / DAY_MS));
  return { allowed, status: sub.subscription_status, trialEndsAt: sub.trial_end_date, daysLeft };
}

// Gate for paid/AI routes. Returns { user, sub } when allowed, else a Response.
async function requireAccess(c: any): Promise<{ user: any; sub: Subscription } | Response> {
  const { user, error } = await getUser(c);
  if (error) return c.json({ error, code: "UNAUTHORIZED" }, 401);
  const sub = await getSubscription(user.id);
  const state = accessState(sub);
  if (!state.allowed) {
    const code = sub.subscription_status === "trialing" ? "TRIAL_EXPIRED" : "SUBSCRIPTION_REQUIRED";
    return c.json({ error: "Your free trial has ended. Upgrade to continue using AI features.", code }, 403);
  }
  return { user, sub };
}

// ---------------------------------------------------------------------------
// Gemini — server-side only. Falls back to deterministic templates without a key.
// ---------------------------------------------------------------------------
async function callGemini(prompt: string, system?: string): Promise<string | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      },
    );
    if (!res.ok) {
      console.log(`Gemini API error ${res.status}: ${await res.text()}`);
      return null;
    }
    const body = await res.json();
    const text = body?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
    return text.trim() || null;
  } catch (err) {
    console.log(`Gemini call exception: ${err}`);
    return null;
  }
}

// Deterministic fallbacks (mirror src/app/store.tsx so behaviour is identical
// when GEMINI_API_KEY is unset).
function fallbackCallSummary(o: string, durationSec: number, notes: string, who = "the prospect"): string {
  const mins = Math.max(1, Math.round(durationSec / 60));
  if (o === "no-answer") return `No answer with ${who}. Recommend a follow-up email and a retry in 24h.`;
  if (o === "voicemail") return `Left a voicemail with ${who}. Suggest a follow-up email summarizing next steps.`;
  const topic = notes.trim() ? notes.trim().split(/[.\n]/)[0] : "general discovery";
  return `${mins}-min connected call with ${who}. Key topic: ${topic}. Positive engagement — recommend sending a proposal and booking a follow-up.`;
}

function fallbackEmail(name: string, purpose: string): { subject: string; body: string } {
  const first = (name || "there").split(" ")[0];
  return {
    subject: purpose || `Following up, ${first}`,
    body: `Hi ${first},\n\nThanks for your time. ${purpose ? `I wanted to follow up regarding ${purpose.toLowerCase()}.` : "I wanted to follow up on our recent conversation."} I'd love to find a time to discuss the next steps and answer any questions you might have.\n\nAre you available for a quick call this week?\n\nBest regards`,
  };
}

// ---------------------------------------------------------------------------
// Stripe — server-side only. Simulates checkout without a key so the flow is
// testable in this environment.
// ---------------------------------------------------------------------------
const PLAN_AMOUNTS = { monthly: 2500, yearly: 20000 } as const; // cents
const PLAN_PERIOD_MS = { monthly: 30 * DAY_MS, yearly: 365 * DAY_MS } as const;

async function getStripe() {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) return null;
  const { default: Stripe } = await import("npm:stripe@17");
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" });
}

// Sign up — creates a confirmed user (no email server configured).
app.post(`${PREFIX}/signup`, async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name ?? "" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });
    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    await kv.set(`workspace:${data.user.id}`, EMPTY);
    await kv.set(`subscription:${data.user.id}`, newTrial());
    return c.json({ ok: true, userId: data.user.id });
  } catch (err) {
    console.log(`Signup exception: ${err}`);
    return c.json({ error: `Signup failed: ${err}` }, 500);
  }
});

// Load the authenticated user's workspace.
app.get(`${PREFIX}/workspace`, async (c) => {
  const { user, error } = await getUser(c);
  if (error) return c.json({ error }, 401);
  try {
    const data = await kv.get(`workspace:${user.id}`);
    return c.json({ workspace: data ?? EMPTY });
  } catch (err) {
    console.log(`Load workspace error for ${user.id}: ${err}`);
    return c.json({ error: `Failed to load workspace: ${err}` }, 500);
  }
});

// Persist the authenticated user's workspace.
app.put(`${PREFIX}/workspace`, async (c) => {
  const { user, error } = await getUser(c);
  if (error) return c.json({ error }, 401);
  try {
    const body = await c.req.json();
    await kv.set(`workspace:${user.id}`, body?.workspace ?? EMPTY);
    return c.json({ ok: true });
  } catch (err) {
    console.log(`Save workspace error for ${user.id}: ${err}`);
    return c.json({ error: `Failed to save workspace: ${err}` }, 500);
  }
});

// ---------------------------------------------------------------------------
// Subscription status (auth required, NOT access-gated — needed on the lock screen)
// ---------------------------------------------------------------------------
app.get(`${PREFIX}/subscription`, async (c) => {
  const { user, error } = await getUser(c);
  if (error) return c.json({ error }, 401);
  try {
    const sub = await getSubscription(user.id);
    const state = accessState(sub);
    return c.json({
      status: state.status,
      trialEndsAt: state.trialEndsAt,
      daysLeft: state.daysLeft,
      allowed: state.allowed,
      plan_type: sub.plan_type,
      current_period_end: sub.current_period_end,
    });
  } catch (err) {
    console.log(`Subscription load error for ${user.id}: ${err}`);
    return c.json({ error: `Failed to load subscription: ${err}` }, 500);
  }
});

// ---------------------------------------------------------------------------
// AI routes — all access-gated; each degrades to a deterministic fallback.
// ---------------------------------------------------------------------------
app.post(`${PREFIX}/ai/draft-email`, async (c) => {
  const gate = await requireAccess(c);
  if (gate instanceof Response) return gate;
  try {
    const { contactName = "", purpose = "", context = "" } = await c.req.json();
    const text = await callGemini(
      `Write a concise, friendly sales follow-up email to ${contactName || "a prospect"}.` +
        (purpose ? ` Purpose: ${purpose}.` : "") +
        (context ? ` Context: ${context}.` : "") +
        ` Return the subject line on the first line prefixed "Subject:", then a blank line, then the body.`,
      "You are a helpful CRM assistant writing professional but warm sales emails. Keep it under 120 words.",
    );
    if (text) {
      const m = text.match(/subject:\s*(.*)/i);
      const subject = m ? m[1].trim() : purpose || `Following up, ${contactName.split(" ")[0] || "there"}`;
      const body = text.replace(/subject:\s*.*(\n)?/i, "").trim();
      return c.json({ result: { subject, body }, source: "gemini" });
    }
    return c.json({ result: fallbackEmail(contactName, purpose), source: "fallback" });
  } catch (err) {
    console.log(`AI draft-email error: ${err}`);
    return c.json({ error: `AI draft failed: ${err}` }, 500);
  }
});

app.post(`${PREFIX}/ai/summarize-call`, async (c) => {
  const gate = await requireAccess(c);
  if (gate instanceof Response) return gate;
  try {
    const { outcome = "connected", durationSec = 0, notes = "", contactName = "" } = await c.req.json();
    const who = contactName || "the prospect";
    const text = await callGemini(
      `Summarize this sales call in 1-2 sentences and recommend a next step.` +
        ` Outcome: ${outcome}. Duration: ${Math.round(durationSec / 60)} min. Contact: ${who}.` +
        (notes ? ` Notes: ${notes}` : ""),
      "You are a CRM assistant summarizing sales calls concisely and suggesting a next action.",
    );
    return c.json({
      result: text ?? fallbackCallSummary(outcome, durationSec, notes, who),
      source: text ? "gemini" : "fallback",
    });
  } catch (err) {
    console.log(`AI summarize-call error: ${err}`);
    return c.json({ error: `AI summary failed: ${err}` }, 500);
  }
});

app.post(`${PREFIX}/ai/task-suggestions`, async (c) => {
  const gate = await requireAccess(c);
  if (gate instanceof Response) return gate;
  try {
    const { summary = "" } = await c.req.json();
    const text = await callGemini(
      `Given this CRM snapshot, suggest 3 short, actionable follow-up tasks (one per line, no numbering). Snapshot: ${summary}`,
      "You are a CRM assistant. Return exactly 3 concise task lines.",
    );
    const suggestions = text
      ? text.split("\n").map((l) => l.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 3)
      : [
          "Follow up with your highest-scoring lead that isn't yet a customer",
          "Re-engage a contact with no activity in the last two weeks",
          "Send a proposal for a deal sitting in the Proposal stage",
        ];
    return c.json({ result: suggestions, source: text ? "gemini" : "fallback" });
  } catch (err) {
    console.log(`AI task-suggestions error: ${err}`);
    return c.json({ error: `AI suggestions failed: ${err}` }, 500);
  }
});

// ---------------------------------------------------------------------------
// Billing — Stripe checkout (simulated without a key) + webhook
// ---------------------------------------------------------------------------
app.post(`${PREFIX}/billing/checkout`, async (c) => {
  const { user, error } = await getUser(c);
  if (error) return c.json({ error }, 401);
  try {
    const { plan, origin } = await c.req.json();
    if (plan !== "monthly" && plan !== "yearly") return c.json({ error: "Invalid plan" }, 400);
    const stripe = await getStripe();

    if (!stripe) {
      // Fallback: activate immediately so the flow is testable without Stripe keys.
      const sub = await getSubscription(user.id);
      const updated: Subscription = {
        ...sub,
        subscription_status: "active",
        plan_type: plan,
        current_period_end: Date.now() + PLAN_PERIOD_MS[plan],
      };
      await kv.set(`subscription:${user.id}`, updated);
      return c.json({ url: null, simulated: true });
    }

    const sub = await getSubscription(user.id);
    let customerId = sub.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = customer.id;
      await kv.set(`subscription:${user.id}`, { ...sub, stripe_customer_id: customerId });
      await kv.set(`stripe_customer:${customerId}`, user.id);
    }
    const base = origin || "https://app.freecrmpro.app";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PLAN_AMOUNTS[plan],
            recurring: { interval: plan === "monthly" ? "month" : "year" },
            product_data: { name: `FreeCRMpRO ${plan === "monthly" ? "Monthly" : "Yearly"}` },
          },
        },
      ],
      metadata: { userId: user.id, plan },
      success_url: `${base}/?upgrade=success`,
      cancel_url: `${base}/?upgrade=cancel`,
    });
    return c.json({ url: session.url });
  } catch (err) {
    console.log(`Checkout error for ${user.id}: ${err}`);
    return c.json({ error: `Checkout failed: ${err}` }, 500);
  }
});

app.post(`${PREFIX}/billing/webhook`, async (c) => {
  const stripe = await getStripe();
  const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripe || !whSecret) return c.json({ error: "Stripe not configured" }, 400);
  try {
    const sig = c.req.header("stripe-signature") ?? "";
    const raw = await c.req.text(); // raw body required for signature verification
    const event = await stripe.webhooks.constructEventAsync(raw, sig, whSecret);

    async function userIdFromCustomer(customerId: string): Promise<string | null> {
      return ((await kv.get(`stripe_customer:${customerId}`)) as string | null) ?? null;
    }
    async function patch(userId: string, patch: Partial<Subscription>) {
      const sub = await getSubscription(userId);
      await kv.set(`subscription:${userId}`, { ...sub, ...patch });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as any;
        const userId = s.metadata?.userId ?? (await userIdFromCustomer(s.customer));
        if (userId) {
          await patch(userId, {
            subscription_status: "active",
            plan_type: s.metadata?.plan ?? "monthly",
            stripe_customer_id: s.customer,
            stripe_subscription_id: s.subscription,
            current_period_end: Date.now() + PLAN_PERIOD_MS[(s.metadata?.plan as "monthly" | "yearly") ?? "monthly"],
          });
          if (s.customer) await kv.set(`stripe_customer:${s.customer}`, userId);
        }
        break;
      }
      case "invoice.paid": {
        const inv = event.data.object as any;
        const userId = await userIdFromCustomer(inv.customer);
        if (userId && inv.lines?.data?.[0]?.period?.end) {
          await patch(userId, { subscription_status: "active", current_period_end: inv.lines.data[0].period.end * 1000 });
        }
        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object as any;
        const userId = await userIdFromCustomer(obj.customer);
        if (userId) await patch(userId, { subscription_status: event.type === "invoice.payment_failed" ? "expired" : "canceled" });
        break;
      }
    }
    return c.json({ received: true });
  } catch (err) {
    console.log(`Webhook error: ${err}`);
    return c.json({ error: `Webhook failed: ${err}` }, 400);
  }
});

Deno.serve(app.fetch);
