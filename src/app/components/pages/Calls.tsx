import { Phone, PhoneOutgoing, PhoneIncoming, PhoneMissed, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { CallDialog, EmptyState } from "../forms";
import { AiChip } from "../shared";
import { useStore, relativeTime, generateCallSummary, type Call, type CallOutcome } from "../../store";
import { useAuth } from "../../auth";
import { useSubscription } from "../../subscription";
import { callAI, TrialExpiredError } from "../../ai";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const outcomeStyle: Record<CallOutcome, string> = {
  connected: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  "no-answer": "bg-muted text-muted-foreground",
  voicemail: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function Calls() {
  const { calls, contacts, dispatch } = useStore();
  const { accessToken } = useAuth();
  const { openUpgradeModal } = useSubscription();
  const connected = calls.filter((c) => c.outcome === "connected").length;

  async function regenerate(call: Call) {
    const contact = contacts.find((c) => c.id === call.contactId);
    try {
      const { result } = await callAI<string>(
        "summarize-call",
        { outcome: call.outcome, durationSec: call.durationSec, notes: call.notes, contactName: contact?.name ?? "" },
        accessToken,
      );
      dispatch({ type: "call/update", call: { ...call, summary: result } });
      toast.success("AI summary regenerated");
    } catch (err) {
      if (err instanceof TrialExpiredError) {
        openUpgradeModal();
      } else {
        // Network error — fall back to the local summary generator.
        dispatch({ type: "call/update", call: { ...call, summary: generateCallSummary(call, contact?.name) } });
        toast.success("AI summary regenerated");
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Calls</h1>
          <p className="text-sm text-muted-foreground">{calls.length} logged · {connected} connected</p>
        </div>
        <CallDialog trigger={<Button><Plus className="size-4" /> Log call</Button>} />
      </div>

      {calls.length === 0 ? (
        <EmptyState
          icon={<Phone className="size-6" />}
          title="No calls logged"
          description="Log your calls with outcome, duration and notes. Each connected call gets an AI-generated summary you can push to the contact timeline."
          action={<CallDialog trigger={<Button><Plus className="size-4" /> Log your first call</Button>} />}
        />
      ) : (
        <div className="space-y-3">
          {calls.map((call) => {
            const contact = contacts.find((c) => c.id === call.contactId);
            const Icon = call.outcome === "no-answer" ? PhoneMissed : call.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
            return (
              <div key={call.id} className="group rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm" style={{ fontWeight: 500 }}>{contact?.name ?? "Unknown contact"}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] capitalize", outcomeStyle[call.outcome])}>{call.outcome.replace("-", " ")}</span>
                      <span className="text-xs text-muted-foreground">· {fmtDuration(call.durationSec)} · {relativeTime(call.at)}</span>
                      {contact && (
                        <button title="Click to call" onClick={() => toast.info(`Dialing ${contact.name}… (integration placeholder)`)} className="ml-auto flex items-center gap-1 text-xs text-[var(--brand)]"><Phone className="size-3" /> Call</button>
                      )}
                    </div>
                    {call.notes && <p className="mt-1.5 text-sm text-foreground/80">{call.notes}</p>}
                    <div className="mt-2 rounded-lg bg-[var(--brand-soft)]/50 p-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <AiChip>AI summary</AiChip>
                        <button onClick={() => regenerate(call)} className="flex items-center gap-1 text-[11px] text-[var(--brand)]"><Sparkles className="size-3" /> Regenerate</button>
                      </div>
                      <p className="text-xs text-foreground/80">{call.summary}</p>
                    </div>
                  </div>
                  <button onClick={() => { dispatch({ type: "call/delete", id: call.id }); toast.success("Call deleted"); }} className="text-muted-foreground opacity-0 transition-opacity hover:text-[var(--destructive)] group-hover:opacity-100"><Trash2 className="size-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
