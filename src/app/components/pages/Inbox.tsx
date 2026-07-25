import { Mail, Phone, Users2, StickyNote, CalendarClock, Inbox as InboxIcon, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { EmptyState } from "../forms";
import { LogActivityDialog } from "../activity";
import { useStore, relativeTime, type Activity } from "../../store";

const icons: Record<Activity["type"], React.ElementType> = {
  note: StickyNote,
  email: Mail,
  call: Phone,
  meeting: CalendarClock,
  stage: Users2,
  created: PlusCircle,
};

export function Inbox() {
  const { contacts } = useStore();

  const feed = contacts
    .flatMap((c) => c.activities.map((a) => ({ ...a, contact: c })))
    .sort((a, b) => b.at - a.at);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1>Activity Feed</h1>
        <p className="text-sm text-muted-foreground">Every logged interaction across your contacts, newest first</p>
      </div>

      {feed.length === 0 ? (
        <EmptyState
          icon={<InboxIcon className="size-6" />}
          title="No activity yet"
          description="Log calls, emails, meetings and notes from any contact and they'll appear here as a unified timeline."
        />
      ) : (
        <div className="space-y-3">
          {feed.map((item) => {
            const Icon = icons[item.type] ?? StickyNote;
            return (
              <div key={item.id} className="flex gap-3 rounded-xl border bg-card p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5"><AvatarFallback>{item.contact.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <span className="text-sm" style={{ fontWeight: 500 }}>{item.contact.name}</span>
                      <span className="text-xs capitalize text-muted-foreground">· {item.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{relativeTime(item.at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">{item.text}</p>
                  <div className="mt-2">
                    <LogActivityDialog
                      contact={item.contact}
                      trigger={<button className="text-xs text-[var(--brand)]">+ Log follow-up</button>}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
