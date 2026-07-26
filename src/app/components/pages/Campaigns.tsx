import { Megaphone, Plus, Trash2, TrendingUp, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { CampaignDialog, EmptyState } from "../forms";
import { useStore, currency, type Campaign } from "../../store";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const statusStyle: Record<Campaign["status"], string> = {
  Planned: "bg-muted text-muted-foreground",
  Active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Completed: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

function convRate(c: Campaign) {
  return c.leads > 0 ? Math.round((c.conversions / c.leads) * 100) : 0;
}
function cpl(c: Campaign) {
  return c.leads > 0 ? c.spend / c.leads : 0;
}

export function Campaigns() {
  const { campaigns, dispatch } = useStore();

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const totalConv = campaigns.reduce((s, c) => s + c.conversions, 0);
  const overallRate = totalLeads > 0 ? Math.round((totalConv / totalLeads) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Campaigns</h1>
          <p className="text-sm text-muted-foreground">Track marketing performance across channels</p>
        </div>
        <CampaignDialog trigger={<Button><Plus className="size-4" /> New campaign</Button>} />
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-6" />}
          title="No campaigns yet"
          description="Track your marketing campaigns — budget, channel, leads generated and conversion rate — in one performance dashboard."
          action={<CampaignDialog trigger={<Button><Plus className="size-4" /> Create your first campaign</Button>} />}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm"><div className="text-sm text-muted-foreground">Total budget</div><div className="mt-1 text-2xl" style={{ fontWeight: 600 }}>{currency(totalBudget)}</div></div>
            <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm"><div className="text-sm text-muted-foreground">Spend</div><div className="mt-1 text-2xl" style={{ fontWeight: 600 }}>{currency(totalSpend)}</div></div>
            <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm"><div className="text-sm text-muted-foreground">Leads generated</div><div className="mt-1 text-2xl" style={{ fontWeight: 600 }}>{totalLeads}</div></div>
            <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm"><div className="text-sm text-muted-foreground">Conversion rate</div><div className="mt-1 flex items-center gap-1 text-2xl" style={{ fontWeight: 600 }}><TrendingUp className="size-4 text-[var(--success)]" />{overallRate}%</div></div>
          </div>

          <div className="glass-surface overflow-hidden rounded-xl border border-white/10 dark:border-white/5 shadow-sm">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-white/10 dark:border-white/5 px-4 py-2.5 text-xs text-muted-foreground md:grid">
              <span>Campaign</span><span>Channel</span><span>Budget / Spend</span><span>Leads</span><span>Conv. rate</span><span></span>
            </div>
            {campaigns.map((c) => (
              <div key={c.id} className="group grid grid-cols-1 gap-2 border-b border-white/10 dark:border-white/5 px-4 py-3 last:border-0 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-3 transition-colors hover:bg-white/5 dark:hover:bg-white/5">
                <div>
                  <div className="flex items-center gap-2"><span className="text-sm" style={{ fontWeight: 500 }}>{c.name}</span><span className={cn("rounded-full px-2 py-0.5 text-[11px]", statusStyle[c.status])}>{c.status}</span></div>
                  <div className="text-xs text-muted-foreground">{c.startDate || "—"} → {c.endDate || "—"}</div>
                </div>
                <span className="text-sm text-muted-foreground">{c.channel}</span>
                <div className="text-sm"><span style={{ fontWeight: 500 }}>{currency(c.spend)}</span><span className="text-muted-foreground"> / {currency(c.budget)}</span><div className="text-xs text-muted-foreground">{currency(cpl(c))}/lead</div></div>
                <span className="text-sm">{c.leads} <span className="text-xs text-muted-foreground">({c.conversions} won)</span></span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10 dark:bg-white/5"><div className="h-full bg-[var(--brand)]" style={{ width: `${convRate(c)}%` }} /></div>
                  <span className="text-sm" style={{ fontWeight: 500 }}>{convRate(c)}%</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <CampaignDialog existing={c} trigger={<button className="text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button>} />
                  <button onClick={() => { dispatch({ type: "campaign/delete", id: c.id }); toast.success("Campaign deleted"); }} className="text-muted-foreground hover:text-[var(--destructive)]"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
