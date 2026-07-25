import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "../forms";
import { useStore, stages, segmentLabels, segmentOptions, currency, dealProbability } from "../../store";

export function Analytics() {
  const store = useStore();
  const { deals, contacts } = store;

  const funnel = stages.map((s) => ({
    stage: s.name,
    count: deals.filter((d) => d.stageId === s.id).length,
    value: deals.filter((d) => d.stageId === s.id).reduce((sum, d) => sum + d.value, 0),
    fill: s.accent,
  }));

  const bySegment = segmentOptions.map((seg) => ({
    segment: segmentLabels[seg],
    value: deals.filter((d) => d.segment === seg).reduce((s, d) => s + d.value, 0),
    fill: "var(--brand)",
  }));

  const wonStage = stages[stages.length - 1].id;
  const won = deals.filter((d) => d.stageId === wonStage);
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const weighted = deals
    .filter((d) => d.stageId !== wonStage)
    .reduce((s, d) => s + d.value * (dealProbability(d, contacts) / 100), 0);
  const conversion = deals.length ? Math.round((won.length / deals.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div>
        <h1>Analytics & Reporting</h1>
        <p className="text-sm text-muted-foreground">Conversion, forecasting and segment performance — computed from your data</p>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="size-6" />}
          title="No data to analyze yet"
          description="Create deals and contacts to see conversion funnels, revenue forecasts and segment breakdowns here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total pipeline", value: currency(totalValue) },
              { label: "Weighted forecast", value: currency(weighted) },
              { label: "Won deals", value: String(won.length) },
              { label: "Conversion rate", value: `${conversion}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-card p-5">
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4">Deals by Stage</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis type="category" dataKey="stage" width={90} tickLine={false} axisLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {funnel.map((d) => <Cell key={d.stage} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4">Pipeline Value by Segment</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bySegment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="segment" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} axisLine={false} width={48} className="text-xs" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => currency(v)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--brand)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
