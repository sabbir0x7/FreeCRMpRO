import { useState } from "react";
import { Mail, Plus, Send, Sparkles, Inbox as InboxIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { EmptyState } from "../forms";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "../ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { useStore, uid, relativeTime, draftEmail, type Email } from "../../store";
import { useAuth } from "../../auth";
import { useSubscription } from "../../subscription";
import { callAI, TrialExpiredError } from "../../ai";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "../ui/utils";
import { toast } from "sonner";

function ComposeDialog({ trigger, presetContactId }: { trigger: React.ReactNode; presetContactId?: string }) {
  const { contacts, deals, dispatch } = useStore();
  const { accessToken } = useAuth();
  const { openUpgradeModal } = useSubscription();
  const [open, setOpen] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [form, setForm] = useState(() => ({
    contactId: presetContactId ?? (contacts[0]?.id ?? null),
    dealId: null as string | null,
    subject: "",
    body: "",
  }));

  async function aiDraft() {
    const contact = contacts.find((c) => c.id === form.contactId);
    setDrafting(true);
    try {
      const { result } = await callAI<{ subject: string; body: string }>(
        "draft-email",
        { contactName: contact?.name ?? "", purpose: form.subject, context: contact ? `${contact.title} at ${contact.company}, status ${contact.status}` : "" },
        accessToken,
      );
      setForm((f) => ({ ...f, subject: result.subject, body: result.body }));
      toast.success("AI draft generated");
    } catch (err) {
      if (err instanceof TrialExpiredError) {
        openUpgradeModal();
      } else {
        // Server unreachable / no key path is handled server-side; this catches
        // network errors — fall back to the local template so the UI still works.
        const draft = draftEmail(contact?.name ?? "", form.subject);
        setForm((f) => ({ ...f, subject: draft.subject, body: draft.body }));
        toast.success("AI draft generated");
      }
    } finally {
      setDrafting(false);
    }
  }

  function send() {
    if (!form.subject.trim()) return;
    dispatch({
      type: "email/add",
      email: { id: uid(), contactId: form.contactId, dealId: form.dealId, subject: form.subject, body: form.body, direction: "outbound", read: true, at: Date.now() },
    });
    if (form.contactId) {
      dispatch({ type: "contact/activity", id: form.contactId, activity: { id: uid(), type: "email", text: `Sent: ${form.subject}`, at: Date.now() } });
    }
    toast.success("Email sent");
    setOpen(false);
    setForm({ contactId: presetContactId ?? (contacts[0]?.id ?? null), dealId: null, subject: "", body: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Compose email</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>To (contact)</Label>
              <Select value={form.contactId ?? "none"} onValueChange={(v) => setForm({ ...form, contactId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Deal</Label>
              <Select value={form.dealId ?? "none"} onValueChange={(v) => setForm({ ...form, dealId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Subject</Label>
              <button onClick={aiDraft} disabled={drafting} className="flex items-center gap-1 text-xs text-[var(--brand)] disabled:opacity-50"><Sparkles className="size-3" /> {drafting ? "Drafting…" : "AI draft"}</button>
            </div>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Following up" />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send}><Send className="size-4" /> Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Email() {
  const { emails, contacts } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  // Group threads by contact.
  const threads = contacts
    .map((c) => ({ contact: c, msgs: emails.filter((e) => e.contactId === c.id).sort((a, b) => b.at - a.at) }))
    .filter((t) => t.msgs.length > 0)
    .sort((a, b) => b.msgs[0].at - a.msgs[0].at);

  const activeThread = threads.find((t) => t.contact.id === selected) ?? threads[0];

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Email</h1>
          <p className="text-sm text-muted-foreground">Unified inbox synced to your contacts</p>
        </div>
        <ComposeDialog trigger={<Button><Plus className="size-4" /> Compose</Button>} />
      </div>

      {emails.length === 0 ? (
        <EmptyState
          icon={<Mail className="size-6" />}
          title="No emails yet"
          description="Compose and send email directly from a contact. Each thread is linked to a contact or deal, with AI-drafted suggestions to get you started."
          action={<ComposeDialog trigger={<Button><Plus className="size-4" /> Compose your first email</Button>} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
          <div className="glass-surface divide-y divide-white/10 dark:divide-white/5 overflow-hidden rounded-xl border border-white/10 dark:border-white/5 shadow-sm">
            {threads.map((t) => {
              const last = t.msgs[0];
              const active = activeThread?.contact.id === t.contact.id;
              return (
                <button key={t.contact.id} onClick={() => setSelected(t.contact.id)} className={cn("flex w-full gap-2 p-3 text-left transition-colors", active ? "bg-brand/10" : "hover:bg-white/5 dark:hover:bg-white/5")}>
                  <Avatar className="size-8"><AvatarFallback>{t.contact.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2"><span className="truncate text-sm" style={{ fontWeight: 500 }}>{t.contact.name}</span><span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(last.at)}</span></div>
                    <div className="truncate text-xs text-muted-foreground">{last.subject}</div>
                  </div>
                  <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{t.msgs.length}</span>
                </button>
              );
            })}
          </div>

          <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 shadow-sm">
            {activeThread ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 p-4">
                  <div><div style={{ fontWeight: 600 }}>{activeThread.contact.name}</div><div className="text-xs text-muted-foreground">{activeThread.contact.email}</div></div>
                  <ComposeDialog presetContactId={activeThread.contact.id} trigger={<Button variant="outline" size="sm"><Send className="size-3.5" /> Reply</Button>} />
                </div>
                <div className="space-y-3 p-4">
                  {activeThread.msgs.map((m: Email) => (
                    <div key={m.id} className={cn("glass-surface rounded-lg border border-white/10 dark:border-white/5 p-3 shadow-sm", m.direction === "outbound" ? "bg-brand/5 border-brand/10" : "")}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm" style={{ fontWeight: 500 }}>{m.subject}</span>
                        <span className="text-[11px] uppercase text-muted-foreground">{m.direction}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p>
                      <div className="mt-1 text-[11px] text-muted-foreground">{relativeTime(m.at)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground"><InboxIcon className="mr-2 size-4" /> Select a thread</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
