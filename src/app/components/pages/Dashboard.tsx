import { DollarSign, Users, Target, Gauge, Sparkles, ArrowRight, Plus, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard, ScoreRing } from "../shared";
import { EmptyState, ContactDialog, TaskDialog } from "../forms";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { buildInsights } from "./Insights";
import { UpgradeState } from "./UpgradeState";
import { useSubscription } from "../../subscription";
import {
  useStore,
  scoreContact,
  stages,
  dealProbability,
  currency,
  type Segment,
} from "../../store";
import type { Page } from "../Layout";

function last6Months() {
  const out: { key: string; month: string }[] = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ key: `${dt.getFullYear()}-${dt.getMonth()}`, month: dt.toLocaleString("en-US", { month: "short" }) });
  }
  return out;
}

export function Dashboard({ segment, setPage }: { segment: Segment | "all"; setPage: (p: Page) => void }) {
  const store = useStore();
  const { isLocked } = useSubscription();
  if (isLocked) return <UpgradeState setPage={setPage} />;

  const contacts = store.contacts.filter((c) => segment === "all" || c.segment === segment);
  const deals = store.deals.filter((d) => segment === "all" || d.segment === segment);
  const openTasks = store.tasks.filter((t) => !t.done);

  const hasData = store.contacts.length > 0 || store.deals.length > 0;

  const wonStage = stages[stages.length - 1].id;
  const wonDeals = deals.filter((d) => d.stageId === wonStage);
  const openDeals = deals.filter((d) => d.stageId !== wonStage);

  const weightedPipeline = openDeals.reduce((s, d) => s + d.value * (dealProbability(d, store.contacts) / 100), 0);
  const winRate = deals.length ? Math.round((wonDeals.length / deals.length) * 100) : 0;
  const avgScore = contacts.length ? Math.round(contacts.reduce((s, c) => s + scoreContact(c), 0) / contacts.length) : 0;

  const months = last6Months();
  const series = months.map(({ key, month }) => {
    const created = deals.filter((d) => `${new Date(d.createdAt).getFullYear()}-${new Date(d.createdAt).getMonth()}` === key);
    return { month, pipeline: created.reduce((s, d) => s + d.value, 0) };
  });

  const hotLeads = [...contacts].sort((a, b) => scoreContact(b) - scoreContact(a)).slice(0, 5);
  const insights = buildInsights(store).slice(0, 3);

  if (!hasData) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <h1>Welcome to FreeCRMpRO 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your workspace is empty and ready for real data. Add a contact to begin — leads are scored automatically and flow straight into your pipeline and analytics.
        </p>
        <div className="mt-6">
          <EmptyState
            icon={<Users className="size-6" />}
            title="Start with your first contact"
            description="Everything in FreeCRMpRO is driven by the contacts and deals you add. Nothing here is demo data — it's all yours."
            action={<ContactDialog trigger={<Button><Plus className="size-4" /> Add your first contact</Button>} />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1>Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live metrics across your {segment === "all" ? "workspace" : "segment"}.</p>
        </div>
        <Button onClick={() => setPage("contact-me")} className="bg-gradient-to-r from-brand to-brand/80 text-brand-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg">
          <Sparkles className="mr-2 size-4" /> Hire Me
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Weighted Pipeline" value={currency(weightedPipeline)} icon={<DollarSign className="size-4" />} />
        <StatCard label="Active Leads" value={String(contacts.length)} icon={<Users className="size-4" />} />
        <StatCard label="Win Rate" value={`${winRate}%`} icon={<Target className="size-4" />} />
        <StatCard label="Avg. Lead Score" value={String(avgScore)} icon={<Gauge className="size-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-surface rounded-xl border border-white/20 dark:border-white/10 p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3>Pipeline Added</h3>
            <p className="text-sm text-muted-foreground">Deal value created per month (last 6 months)</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} axisLine={false} width={48} className="text-xs" />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => currency(v)} />
              <Area key="pipeline" type="monotone" dataKey="pipeline" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.15} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-surface rounded-xl border border-white/20 dark:border-white/10 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3>Tasks</h3>
            <TaskDialog trigger={<button className="flex items-center gap-1 text-sm text-[var(--brand)]"><Plus className="size-3.5" /> Add</button>} />
          </div>
          {openTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <ClipboardList className="size-6" /> No open tasks
            </div>
          ) : (
            <div className="space-y-3">
              {openTasks.slice(0, 6).map((t) => (
                <button key={t.id} onClick={() => store.dispatch({ type: "task/toggle", id: t.id })} className="flex w-full items-start gap-3 text-left rounded-lg p-2 hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{t.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{t.due || "No date"} · {t.priority}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-surface rounded-xl border border-white/20 dark:border-white/10 p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3>Top Leads</h3>
              <p className="text-sm text-muted-foreground">Ranked by computed lead score</p>
            </div>
            <button onClick={() => setPage("contacts")} className="text-sm text-[var(--brand)]">View all</button>
          </div>
          {hotLeads.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No contacts in this segment yet.</p>
          ) : (
            <div className="space-y-1">
              {hotLeads.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                  <Avatar className="size-9"><AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm" style={{ fontWeight: 500 }}>{c.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{[c.company, c.title].filter(Boolean).join(" · ") || c.email}</div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-sm" style={{ fontWeight: 500 }}>{currency(c.value)}</div>
                    <div className="text-xs text-muted-foreground">{c.status}</div>
                  </div>
                  <ScoreRing score={scoreContact(c)} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-surface rounded-xl border border-brand/20 bg-gradient-to-b from-brand/5 to-transparent p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--brand)]" />
            <h3>Insights</h3>
          </div>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add more contacts and deals to unlock insights.</p>
          ) : (
            <div className="space-y-3">
              {insights.map((a) => (
                <div key={a.id} className="glass-surface rounded-lg border border-white/10 dark:border-white/5 p-3 shadow-sm">
                  <div className="text-sm" style={{ fontWeight: 500 }}>{a.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.detail}</p>
                  <button onClick={() => setPage("insights")} className="mt-2 flex items-center gap-1 text-xs text-[var(--brand)]">
                    View insights <ArrowRight className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
