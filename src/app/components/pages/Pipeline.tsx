import { useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sparkles, GripVertical, Plus, Kanban, Trash2, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { DealDialog, EmptyState } from "../forms";
import {
  useStore,
  stages,
  dealProbability,
  currency,
  type Deal,
  type Segment,
} from "../../store";
import { cn } from "../ui/utils";

const ITEM = "deal";

function DealCard({ deal }: { deal: Deal }) {
  const { contacts, dispatch } = useStore();
  const contact = contacts.find((c) => c.id === deal.contactId);
  const probability = dealProbability(deal, contacts);
  const [{ isDragging }, drag] = useDrag(
    () => ({ type: ITEM, item: { id: deal.id }, collect: (m) => ({ isDragging: m.isDragging() }) }),
    [deal.id]
  );
  const probColor = probability >= 70 ? "var(--success)" : probability >= 40 ? "var(--warning)" : "var(--destructive)";

  return (
    <div
      ref={drag as any}
      className={cn("glass-surface group cursor-grab rounded-lg border border-white/10 dark:border-white/5 p-3 shadow-sm hover:shadow-md transition-all active:cursor-grabbing hover:-translate-y-0.5", isDragging && "opacity-40")}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm" style={{ fontWeight: 500 }}>{deal.title}</span>
        <div className="flex items-center opacity-0 group-hover:opacity-100">
          <DealDialog
            existing={deal}
            trigger={<button className="flex size-6 items-center justify-center rounded hover:bg-white/10 dark:hover:bg-white/10 transition-colors"><Pencil className="size-3.5" /></button>}
          />
          <button onClick={() => dispatch({ type: "deal/delete", id: deal.id })} className="flex size-6 items-center justify-center rounded hover:bg-white/10 dark:hover:bg-white/10 transition-colors">
            <Trash2 className="size-3.5 text-[var(--destructive)]" />
          </button>
          <GripVertical className="size-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{currency(deal.value)}</span>
        <span className="flex items-center gap-1 text-xs" style={{ color: probColor, fontWeight: 500 }}>
          <Sparkles className="size-3" /> {probability}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10 dark:bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${probability}%`, background: probColor }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{contact ? contact.name : "No contact"}</span>
        <span>{deal.expectedClose || "—"}</span>
      </div>
    </div>
  );
}

function Column({ stage, deals }: { stage: (typeof stages)[number]; deals: Deal[] }) {
  const { dispatch } = useStore();
  const [{ over }, drop] = useDrop(
    () => ({
      accept: ITEM,
      drop: (item: { id: string }) => dispatch({ type: "deal/move", id: item.id, stageId: stage.id }),
      collect: (m) => ({ over: m.isOver() }),
    }),
    [stage.id]
  );
  const total = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div ref={drop as any} className={cn("glass-surface flex w-72 shrink-0 flex-col rounded-xl border border-white/10 dark:border-white/5 shadow-sm transition-colors", over && "ring-2 ring-[var(--brand)]/40")}>
      <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full shadow-sm" style={{ background: stage.accent }} />
          <span className="text-sm" style={{ fontWeight: 500 }}>{stage.name}</span>
          <span className="rounded-full bg-white/10 dark:bg-white/5 px-1.5 text-xs text-muted-foreground">{deals.length}</span>
        </div>
      </div>
      <div className="px-3 pb-1 pt-2 text-xs text-muted-foreground">{currency(total)}</div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 pt-1">
        {deals.map((d) => <DealCard key={d.id} deal={d} />)}
        {deals.length === 0 && <div className="rounded-lg border border-dashed border-white/20 dark:border-white/10 py-6 text-center text-xs text-muted-foreground">Drop deals here</div>}
      </div>
    </div>
  );
}

export function Pipeline({ segment }: { segment: Segment | "all" }) {
  const { deals } = useStore();
  const scoped = useMemo(
    () => deals.filter((d) => segment === "all" || d.segment === segment),
    [deals, segment]
  );

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Pipeline</h1>
          <p className="text-sm text-muted-foreground">Drag deals across stages · close probability computed from stage & lead score</p>
        </div>
        <DealDialog trigger={<Button><Plus className="size-4" /> Add deal</Button>} />
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={<Kanban className="size-6" />}
          title="No deals in your pipeline"
          description="Create a deal to start tracking it through your stages. Deals can be linked to contacts and are scored automatically."
          action={<DealDialog trigger={<Button><Plus className="size-4" /> Add your first deal</Button>} />}
        />
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <Column key={stage.id} stage={stage} deals={scoped.filter((d) => d.stageId === stage.id)} />
            ))}
          </div>
        </DndProvider>
      )}
    </div>
  );
}
