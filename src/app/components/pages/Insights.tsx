import { Sparkles, TrendingUp, AlertTriangle, Zap, LineChart, ArrowRight } from "lucide-react";
import { EmptyState } from "../forms";
import {
  useStore,
  scoreContact,
  stages,
  dealProbability,
  currency,
  relativeTime,
  type Segment,
} from "../../store";

export interface Insight {
  id: string;
  type: "opportunity" | "risk" | "action" | "forecast";
  title: string;
  detail: string;
  confidence: number;
}

// Derive insights from the user's real data — heuristic analytics, no fake content.
export function buildInsights(store: { contacts: any[]; deals: any[] }): Insight[] {
  const out: Insight[] = [];
  const { contacts, deals } = store;

  // Opportunity: high-scoring leads not yet customers
  const hot = contacts
    .filter((c) => scoreContact(c) >= 70 && c.status !== "Customer")
    .sort((a, b) => scoreContact(b) - scoreContact(a));
  if (hot.length) {
    out.push({
      id: "opp",
      type: "opportunity",
      title: `${hot.length} high-intent lead${hot.length > 1 ? "s" : ""} ready to convert`,
      detail: `${hot.slice(0, 3).map((c) => c.name).join(", ")}${hot.length > 3 ? ` and ${hot.length - 3} more` : ""} score above 70. Prioritize outreach to maximize close rate.`,
      confidence: Math.min(95, 60 + hot.length * 4),
    });
  }

  // Risk: stale contacts (no activity > 14 days) or churned
  const stale = contacts.filter((c) => (Date.now() - c.lastActivityAt) / 86_400_000 > 14 && c.status !== "Churned" && c.status !== "Customer");
  if (stale.length) {
    out.push({
      id: "risk",
      type: "risk",
      title: `${stale.length} lead${stale.length > 1 ? "s" : ""} going cold`,
      detail: `${stale[0].name} hasn't been touched in ${relativeTime(stale[0].lastActivityAt).replace(" ago", "")}. Re-engage before these opportunities slip away.`,
      confidence: 74,
    });
  }

  // Forecast: weighted open pipeline
  const wonStage = stages[stages.length - 1].id;
  const open = deals.filter((d) => d.stageId !== wonStage);
  if (open.length) {
    const weighted = open.reduce((s, d) => s + d.value * (dealProbability(d, contacts) / 100), 0);
    out.push({
      id: "forecast",
      type: "forecast",
      title: `Weighted pipeline forecast: ${currency(weighted)}`,
      detail: `Across ${open.length} open deal${open.length > 1 ? "s" : ""} worth ${currency(open.reduce((s, d) => s + d.value, 0))} total, probability-weighted expected value is ${currency(weighted)}.`,
      confidence: 82,
    });
  }

  // Action: contacts with no logged activity beyond creation
  const noTouch = contacts.filter((c) => c.activities.length <= 1);
  if (noTouch.length) {
    out.push({
      id: "action",
      type: "action",
      title: `Follow up with ${noTouch.length} untouched contact${noTouch.length > 1 ? "s" : ""}`,
      detail: `${noTouch.length} contact${noTouch.length > 1 ? "s have" : " has"} no logged interactions yet. Reach out and log the activity to start scoring engagement.`,
      confidence: 88,
    });
  }

  return out;
}

const meta: Record<Insight["type"], { icon: React.ElementType; label: string; color: string }> = {
  opportunity: { icon: TrendingUp, label: "Opportunity", color: "var(--success)" },
  risk: { icon: AlertTriangle, label: "Risk", color: "var(--destructive)" },
  action: { icon: Zap, label: "Action", color: "var(--brand)" },
  forecast: { icon: LineChart, label: "Forecast", color: "var(--info)" },
};

export function Insights() {
  const store = useStore();
  const insights = buildInsights(store);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand shadow-sm">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1>Insights</h1>
          <p className="text-sm text-muted-foreground">Analytics computed live from your contacts and pipeline</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="No insights yet"
          description="Add contacts, log activities and create deals. Insights are generated automatically from real patterns in your data."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {insights.map((a) => {
            const m = meta[a.type];
            return (
              <div key={a.id} className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm" style={{ color: m.color, fontWeight: 600 }}>
                    <m.icon className="size-4" /> {m.label}
                  </span>
                  <span className="rounded-full bg-white/10 dark:bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">{a.confidence}% confidence</span>
                </div>
                <h3 className="mt-3">{a.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{a.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
