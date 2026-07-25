# Fix "Failed to fetch" on Sign Up

## Context
Clicking **Create account** shows `Failed to fetch`. Investigation confirmed the frontend URL, route prefix (`/make-server-ac29d601`), and CORS are all correct — so this is a browser network-level `TypeError`, not an HTTP error response. For a freshly connected Supabase project this means the **edge function has not been deployed yet**, so the browser cannot reach `https://<projectId>.supabase.co/functions/v1/make-server-ac29d601/signup`.

There is also a UX gap: `auth.tsx` has no try/catch around the raw `fetch`, so a network failure surfaces the cryptic native `Failed to fetch` message with no guidance.

Chosen approach (option A): **deploy the function** (primary fix, user action) + **make the error clear and actionable** (small code change). No offline/local fallback.

## Primary fix (user action — no code)
Deploy the edge function from the **Make settings page**. Edge-function code in `supabase/functions/server/index.tsx` only goes live after deployment; until then `/signup` and `/workspace` are unreachable and every request fails with `Failed to fetch`.

## Code change — clearer error messaging
File: `src/app/auth.tsx`

1. In `signUp`, wrap the `fetch(`${SERVER_URL}/signup`, …)` call in a try/catch. If the fetch itself throws (network `TypeError`), rethrow a friendly message, e.g.:
   > "Can't reach the server. If you just connected Supabase, deploy the edge function from the Make settings page and try again."
   Keep the existing `!res.ok` handling for real HTTP errors (validation, duplicate email) so those still show the server's message.
2. In `signIn`, `supabase.auth.signInWithPassword` throws its own error; if `error.message` is `Failed to fetch` (or similar network error), map it to the same friendly message so sign-in failures caused by an unreachable project are also understandable.

No other files change. `AuthScreen.tsx` already renders `err.message` in its error slot, so improved messages appear automatically. The reusable pattern is: distinguish a thrown network `TypeError` from an HTTP-level `!res.ok` error and give the network case an actionable deploy hint.

## Verification
1. **Before deploy:** attempt sign-up — instead of `Failed to fetch`, the form should now show the friendly "Can't reach the server… deploy the edge function…" message.
2. **Deploy** the edge function from Make settings.
3. **After deploy:** create an account → should succeed, land in the workspace; reload → session restored; add a contact → persists (survives reload), confirming the server round-trip works.
4. Sign out and sign back in to confirm `signIn` works and loads the same workspace.
