import { SERVER_URL } from "./supabaseClient";

// Thrown when the server rejects an AI call because the trial has ended and
// there is no active subscription. UI catches this to open the upgrade modal.
export class TrialExpiredError extends Error {
  code: string;
  constructor(code = "TRIAL_EXPIRED") {
    super("Your free trial has ended. Upgrade to keep using AI features.");
    this.name = "TrialExpiredError";
    this.code = code;
  }
}

export interface AiResponse<T> {
  result: T;
  source: "gemini" | "fallback";
}

// POST to a gated /ai/* route. On 403 the trial gate fired → throw
// TrialExpiredError. On any other failure the caller is expected to fall back
// to local deterministic logic, so we surface the error to let it decide.
export async function callAI<T>(path: string, body: unknown, accessToken: string | null): Promise<AiResponse<T>> {
  const res = await fetch(`${SERVER_URL}/ai/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken ?? ""}` },
    body: JSON.stringify(body),
  });
  if (res.status === 403) {
    const b = await res.json().catch(() => ({}));
    throw new TrialExpiredError((b as any).code ?? "TRIAL_EXPIRED");
  }
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error((b as any).error ?? `AI request failed (${res.status})`);
  }
  return (await res.json()) as AiResponse<T>;
}
