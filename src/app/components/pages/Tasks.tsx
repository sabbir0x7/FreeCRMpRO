import { CheckSquare, Plus, Calendar, AlertTriangle, Trash2, User } from "lucide-react";
import { Button } from "../ui/button";
import { TaskDialog, EmptyState } from "../forms";
import { useStore, type Task, type TaskStatus } from "../../store";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const columns: TaskStatus[] = ["To Do", "In Progress", "Done"];

const priorityColors: Record<Task["priority"], string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Low: "bg-muted text-muted-foreground",
};

function isOverdue(t: Task) {
  return t.status !== "Done" && t.due && t.due < new Date().toISOString().slice(0, 10);
}

export function Tasks() {
  const { tasks, contacts, deals, dispatch } = useStore();

  const overdue = tasks.filter(isOverdue).length;
  const dueToday = tasks.filter((t) => t.status !== "Done" && t.due === new Date().toISOString().slice(0, 10)).length;

  function advance(t: Task) {
    const next: Record<TaskStatus, TaskStatus> = { "To Do": "In Progress", "In Progress": "Done", Done: "To Do" };
    const status = next[t.status];
    dispatch({ type: "task/update", task: { ...t, status, done: status === "Done" } });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.filter((t) => t.status !== "Done").length} open
            {overdue > 0 && <span className="text-[var(--destructive)]"> · {overdue} overdue</span>}
            {dueToday > 0 && <span> · {dueToday} due today</span>}
          </p>
        </div>
        <TaskDialog trigger={<Button><Plus className="size-4" /> New task</Button>} />
      </div>

      {overdue > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-2.5 text-sm text-[var(--destructive)]">
          <AlertTriangle className="size-4" /> Daily digest: you have {overdue} overdue {overdue === 1 ? "task" : "tasks"} needing attention.
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="size-6" />}
          title="No tasks yet"
          description="Keep a dedicated to-do list separate from your activity feed. Set due dates, priorities and link tasks to contacts or deals."
          action={<TaskDialog trigger={<Button><Plus className="size-4" /> Create your first task</Button>} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((col) => {
            const items = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="rounded-xl border bg-muted/30 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm" style={{ fontWeight: 600 }}>{col}</span>
                  <span className="rounded-full bg-background px-2 text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((t) => {
                    const contact = contacts.find((c) => c.id === t.contactId);
                    const deal = deals.find((d) => d.id === t.dealId);
                    return (
                      <div key={t.id} className={cn("group rounded-lg border bg-card p-3", isOverdue(t) && "border-[var(--destructive)]/40")}>
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn("text-sm", t.status === "Done" && "text-muted-foreground line-through")} style={{ fontWeight: 500 }}>{t.title}</span>
                          <button onClick={() => { dispatch({ type: "task/delete", id: t.id }); toast.success("Task deleted"); }} className="text-muted-foreground opacity-0 transition-opacity hover:text-[var(--destructive)] group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className={cn("rounded px-1.5 py-0.5", priorityColors[t.priority])}>{t.priority}</span>
                          {t.due && <span className={cn("flex items-center gap-1", isOverdue(t) ? "text-[var(--destructive)]" : "text-muted-foreground")}><Calendar className="size-3" /> {t.due}</span>}
                          {t.assignee && <span className="flex items-center gap-1 text-muted-foreground"><User className="size-3" /> {t.assignee}</span>}
                        </div>
                        {(contact || deal) && <div className="mt-1 truncate text-xs text-muted-foreground">{contact?.name}{contact && deal ? " · " : ""}{deal?.title}</div>}
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => advance(t)} className="text-xs text-[var(--brand)]">Move →</button>
                          <TaskDialog existing={t} trigger={<button className="text-xs text-muted-foreground hover:text-foreground">Edit</button>} />
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">Nothing here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
