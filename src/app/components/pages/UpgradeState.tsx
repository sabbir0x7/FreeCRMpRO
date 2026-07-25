import { Lock, Check, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useSubscription } from "../../subscription";
import type { Page } from "../Layout";

const perks = [
  "AI lead scoring & deal probability",
  "AI-drafted emails & call summaries",
  "Full dashboard, analytics & insights",
  "Unlimited contacts, deals & campaigns",
];

// Soft-lock state shown on the Dashboard when a trial has expired without an
// active subscription. Other pages remain viewable; AI is blocked server-side.
export function UpgradeState({ setPage }: { setPage: (p: Page) => void }) {
  const { status } = useSubscription();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
        <Lock className="size-7" />
      </div>
      <h1>{status === "canceled" ? "Your subscription was canceled" : "Your free trial has ended"}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Upgrade to unlock your dashboard and AI features again. Your data is safe and waiting — nothing was lost.
      </p>

      <ul className="mt-6 space-y-2 text-left">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-[var(--success)]" /> {p}
          </li>
        ))}
      </ul>

      <Button className="mt-7" onClick={() => setPage("billing")}>
        <Sparkles className="size-4" /> View plans & upgrade
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">Monthly $25/mo · Yearly $200/yr (save $100)</p>
    </div>
  );
}
