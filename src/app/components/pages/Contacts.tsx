import { useState } from "react";
import { Search, Plus, Users, Sparkles, Pencil, Trash2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScoreRing, TrendIcon } from "../shared";
import { ContactDialog, EmptyState } from "../forms";
import { LogActivityDialog } from "../activity";
import {
  useStore,
  scoreContact,
  scoreTrend,
  segmentLabels,
  currency,
  relativeTime,
  type Contact,
  type Segment,
} from "../../store";
import { cn } from "../ui/utils";

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Engaged: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  Qualified: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Customer: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Churned: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function Contacts({ segment }: { segment: Segment | "all" }) {
  const { contacts, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Contact | null>(null);

  const scoped = contacts
    .filter((c) => segment === "all" || c.segment === segment)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.company.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => scoreContact(b) - scoreContact(a));

  function remove(c: Contact) {
    dispatch({ type: "contact/delete", id: c.id });
    toast.success(`Deleted ${c.name}`);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Contacts & Leads</h1>
          <p className="text-sm text-muted-foreground">
            {scoped.length} {scoped.length === 1 ? "record" : "records"} · {segment === "all" ? "all segments" : segmentLabels[segment]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="glass-input rounded-lg border border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/10 backdrop-blur-md py-1.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/30 transition-all"
            />
          </div>
          <ContactDialog trigger={<Button><Plus className="size-4" /> Add contact</Button>} />
        </div>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title="No contacts yet"
          description="Add your first contact to start tracking leads, scoring them automatically, and building your pipeline."
          action={<ContactDialog trigger={<Button><Plus className="size-4" /> Add your first contact</Button>} />}
        />
      ) : scoped.length === 0 ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title="No matches"
          description="No contacts match your search or the selected segment filter."
        />
      ) : (
        <div className="glass-surface overflow-hidden rounded-xl border border-white/20 dark:border-white/10 shadow-sm">
          <div className="hidden grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 border-b border-white/10 dark:border-white/5 px-4 py-3 text-xs text-muted-foreground md:grid" style={{ fontWeight: 500 }}>
            <span>Contact</span>
            <span>Status</span>
            <span>Value</span>
            <span>Score</span>
            <span></span>
          </div>
          <div className="divide-y divide-white/10 dark:divide-white/5">
            {scoped.map((c) => {
              const score = scoreContact(c);
              return (
                <div key={c.id} className="grid grid-cols-1 items-center gap-3 px-4 py-3 hover:bg-white/5 dark:hover:bg-white/5 transition-colors md:grid-cols-[2fr_1fr_1fr_auto_auto] md:gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9"><AvatarFallback>{initials(c.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm" style={{ fontWeight: 500 }}>{c.name}</span>
                        {score > 80 && <Sparkles className="size-3 text-[var(--brand)]" />}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {[c.company, c.title].filter(Boolean).join(" · ") || c.email || "—"}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {c.tags.map((t) => (
                          <span key={t} className="rounded bg-white/10 dark:bg-white/5 border border-white/10 dark:border-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                        ))}
                        <span className="text-[10px] text-muted-foreground">· {relativeTime(c.lastActivityAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", statusColors[c.status])} style={{ fontWeight: 500 }}>{c.status}</span>
                  </div>
                  <div className="text-sm" style={{ fontWeight: 500 }}>{currency(c.value)}</div>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={scoreTrend(c)} />
                    <ScoreRing score={score} size={36} />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <LogActivityDialog
                      contact={c}
                      trigger={
                        <button className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors" title="Log activity">
                          <MessageSquarePlus className="size-4" />
                        </button>
                      }
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors">⋯</DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(c)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(c)} className="text-[var(--destructive)]"><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing && (
        <ContactDialog existing={editing} open={!!editing} onOpenChange={(o) => !o && setEditing(null)} />
      )}
    </div>
  );
}
