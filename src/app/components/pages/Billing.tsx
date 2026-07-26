import { useState } from "react";
import { Check, Sparkles, Loader2, BadgeCheck } from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { useAuth } from "../../auth";
import { useSubscription } from "../../subscription";
import { SERVER_URL } from "../../supabaseClient";
import { toast } from "sonner";

const features = [
  "Unlimited contacts, companies & deals",
  "AI lead scoring & deal probability",
  "AI-drafted emails & call summaries",
  "Calendar, tasks, documents & forms",
  "Campaign tracking & analytics",
  "Priority support",
];

const plans = [
  { id: "monthly" as const, name: "Monthly", price: 25, per: "/month", note: "Billed monthly · cancel anytime" },
  { id: "yearly" as const, name: "Yearly", price: 200, per: "/year", note: "Billed annually · $16.67/mo", badge: "Best value · save $100/year" },
];

const statusLabel: Record<string, string> = {
  trialing: "Free trial",
  active: "Active subscription",
  expired: "Trial expired",
  canceled: "Subscription canceled",
};

export function Billing() {
  const { accessToken } = useAuth();
  const { status, daysLeft, planType, currentPeriodEnd, refresh } = useSubscription();
  const [busy, setBusy] = useState<string | null>(null);

  async function upgrade(plan: "monthly" | "yearly") {
    setBusy(plan);
    try {
      const res = await fetch(`${SERVER_URL}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ plan, origin: window.location.origin }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Checkout failed");
      if (body.url) {
        window.location.href = body.url; // Stripe Checkout
      } else if (body.simulated) {
        await refresh();
        toast.success("Subscription activated (simulated — add Stripe keys for live checkout).");
      }
    } catch (err: any) {
      console.log("Checkout error:", err);
      toast.error(err.message ?? "Could not start checkout");
    } finally {
      setBusy(null);
    }
  }

  const isActive = status === "active";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1>Billing & Plans</h1>
        <p className="text-sm text-muted-foreground">Simple pricing powered by Stripe · upgrade any time</p>
      </div>

      {/* Current status */}
      <div className="glass-surface flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/10 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current status</span>
            <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-brand-foreground shadow-sm">{statusLabel[status] ?? status}</span>
          </div>
          <p className="mt-1 text-lg" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {isActive
              ? `${planType === "yearly" ? "Yearly" : "Monthly"} plan${currentPeriodEnd ? ` · renews ${new Date(currentPeriodEnd).toLocaleDateString()}` : ""}`
              : status === "trialing"
                ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left in your free trial`
                : "Upgrade to restore full access"}
          </p>
        </div>
        {isActive && <BadgeCheck className="size-8 text-[var(--brand)]" />}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {plans.map((p) => {
          const current = isActive && planType === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                "glass-surface relative flex flex-col rounded-xl border border-white/10 dark:border-white/5 p-6 shadow-sm transition-all",
                p.badge && "border-[var(--brand)] shadow-lg shadow-brand/10 bg-brand/5",
              )}
            >
              {p.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-brand to-brand/80 px-3 py-0.5 text-xs text-brand-foreground shadow-[0_0_10px_rgba(109,40,217,0.3)]" style={{ fontWeight: 500 }}>
                  {p.badge}
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3>{p.name}</h3>
                {p.id === "yearly" && <Sparkles className="size-4 text-[var(--brand)]" />}
              </div>
              <div className="mt-3">
                <span className="text-4xl" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>${p.price}</span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--success)]" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" disabled={current || busy !== null} onClick={() => upgrade(p.id)}>
                {busy === p.id ? <Loader2 className="size-4 animate-spin" /> : current ? "Current plan" : `Choose ${p.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Secure checkout via Stripe. Your payment details are never stored by FreeCRMpRO.
      </p>
    </div>
  );
}
