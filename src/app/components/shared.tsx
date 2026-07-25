import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "./ui/utils";

export function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const color = score >= 67 ? "var(--success)" : score >= 34 ? "var(--warning)" : "var(--destructive)";
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px]" style={{ fontWeight: 600 }}>
        {score}
      </span>
    </div>
  );
}

export function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="size-3.5 text-[var(--success)]" />;
  if (trend === "down") return <TrendingDown className="size-3.5 text-[var(--destructive)]" />;
  return <Minus className="size-3.5 text-muted-foreground" />;
}

export function AiChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] text-[var(--brand)]" style={{ fontWeight: 500 }}>
      <Sparkles className="size-3" />
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  delta,
  positive = true,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {value}
      </div>
      {delta && (
        <div className={cn("mt-1 flex items-center gap-1 text-sm", positive ? "text-[var(--success)]" : "text-[var(--destructive)]")}>
          {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {delta}
        </div>
      )}
    </div>
  );
}

export function currency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
