import { useState } from "react";
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Link2 } from "lucide-react";
import { Button } from "../ui/button";
import { EventDialog, EmptyState } from "../forms";
import { useStore, type CalendarEvent, type EventType } from "../../store";
import { cn } from "../ui/utils";
import { toast } from "sonner";

type View = "month" | "week" | "day";

const typeColors: Record<EventType, string> = {
  meeting: "bg-[var(--brand)] text-white",
  viewing: "bg-emerald-500 text-white",
  "follow-up": "bg-amber-500 text-white",
  call: "bg-sky-500 text-white",
};

export function Calendar() {
  const { events, dispatch, contacts } = useStore();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());

  const byDay = (day: Date) => events.filter((e) => e.date && isSameDay(parseISO(e.date), day)).sort((a, b) => a.time.localeCompare(b.time));

  function shift(dir: number) {
    if (view === "month") setCursor(addMonths(cursor, dir));
    else if (view === "week") setCursor(addWeeks(cursor, dir));
    else setCursor(addDays(cursor, dir));
  }

  const monthDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor)), end: endOfWeek(endOfMonth(cursor)) });
  const weekDays = eachDayOfInterval({ start: startOfWeek(cursor), end: endOfWeek(cursor) });

  function copyBookingLink() {
    const slug = "you-" + Math.random().toString(36).slice(2, 8);
    navigator.clipboard?.writeText(`https://cal.freecrmpro.app/${slug}`).catch(() => {});
    toast.success("Booking link copied to clipboard");
  }

  function EventChip({ e }: { e: CalendarEvent }) {
    const contact = contacts.find((c) => c.id === e.contactId);
    return (
      <EventDialog
        existing={e}
        trigger={
          <button className={cn("w-full truncate rounded px-1.5 py-0.5 text-left text-[11px]", typeColors[e.type])}>
            {e.time} {e.title}{contact ? ` · ${contact.name.split(" ")[0]}` : ""}
          </button>
        }
      />
    );
  }

  const label =
    view === "month" ? format(cursor, "MMMM yyyy")
    : view === "week" ? `${format(startOfWeek(cursor), "MMM d")} – ${format(endOfWeek(cursor), "MMM d, yyyy")}`
    : format(cursor, "EEEE, MMMM d, yyyy");

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Calendar</h1>
          <p className="text-sm text-muted-foreground">Meetings, viewings and follow-ups</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyBookingLink}><Link2 className="size-4" /> Booking link</Button>
          <EventDialog defaultDate={format(cursor, "yyyy-MM-dd")} trigger={<Button><Plus className="size-4" /> New event</Button>} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-accent"><ChevronLeft className="size-4" /></button>
          <button onClick={() => setCursor(new Date())} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent">Today</button>
          <button onClick={() => shift(1)} className="flex size-8 items-center justify-center rounded-lg border hover:bg-accent"><ChevronRight className="size-4" /></button>
          <span className="ml-2 text-sm" style={{ fontWeight: 600 }}>{label}</span>
        </div>
        <div className="flex rounded-lg border p-0.5 text-sm">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-md px-3 py-1 capitalize", view === v ? "bg-[var(--brand)] text-white" : "text-muted-foreground")}>{v}</button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-6" />}
          title="No events scheduled"
          description="Schedule meetings, property viewings and follow-ups. Link each event to a contact, deal or property."
          action={<EventDialog defaultDate={format(cursor, "yyyy-MM-dd")} trigger={<Button><Plus className="size-4" /> Schedule your first event</Button>} />}
        />
      ) : view === "month" ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-7 border-b text-center text-xs text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => (
              <div key={day.toISOString()} className={cn("min-h-24 border-b border-r p-1", !isSameMonth(day, cursor) && "bg-muted/30")}>
                <div className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-xs", isToday(day) && "bg-[var(--brand)] text-white")}>{format(day, "d")}</div>
                <div className="space-y-0.5">{byDay(day).map((e) => <EventChip key={e.id} e={e} />)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : view === "week" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="rounded-xl border bg-card p-2">
              <div className={cn("mb-2 text-center text-xs", isToday(day) && "text-[var(--brand)]")}>{format(day, "EEE d")}</div>
              <div className="space-y-1">{byDay(day).map((e) => <EventChip key={e.id} e={e} />)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {byDay(cursor).length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No events on this day.</p>
          ) : byDay(cursor).map((e) => {
            const contact = contacts.find((c) => c.id === e.contactId);
            return (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <div className="w-16 text-sm text-muted-foreground">{e.time}</div>
                <span className={cn("size-2 rounded-full", typeColors[e.type])} />
                <div className="flex-1">
                  <div style={{ fontWeight: 500 }}>{e.title}</div>
                  <div className="text-xs capitalize text-muted-foreground">{e.type} · {e.durationMin}min{contact ? ` · ${contact.name}` : ""}</div>
                </div>
                <EventDialog existing={e} trigger={<Button variant="outline" size="sm">Edit</Button>} />
                <button onClick={() => { dispatch({ type: "event/delete", id: e.id }); toast.success("Event removed"); }} className="text-xs text-muted-foreground hover:text-[var(--destructive)]">Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
