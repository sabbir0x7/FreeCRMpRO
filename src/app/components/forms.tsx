import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  useStore,
  uid,
  stages,
  segmentOptions,
  segmentLabels,
  generateCallSummary,
  type Contact,
  type ContactStatus,
  type Deal,
  type Property,
  type Segment,
  type Task,
  type TaskStatus,
  type Company,
  type CalendarEvent,
  type EventType,
  type Call,
  type CallOutcome,
  type Campaign,
} from "../store";

const statuses: ContactStatus[] = ["New", "Engaged", "Qualified", "Customer", "Churned"];
const priorities: Task["priority"][] = ["High", "Medium", "Low"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
export function ContactDialog({
  trigger,
  existing,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  existing?: Contact;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const { dispatch } = useStore();
  const [internal, setInternal] = useState(false);
  const isOpen = open ?? internal;
  const setOpen = onOpenChange ?? setInternal;

  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    email: existing?.email ?? "",
    phone: existing?.phone ?? "",
    company: existing?.company ?? "",
    title: existing?.title ?? "",
    tags: existing?.tags.join(", ") ?? "",
    segment: existing?.segment ?? ("sales" as Segment),
    status: existing?.status ?? ("New" as ContactStatus),
    value: existing?.value ?? 0,
  }));

  function submit() {
    if (!form.name.trim()) return;
    const now = Date.now();
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (existing) {
      dispatch({ type: "contact/update", contact: { ...existing, ...form, tags } });
    } else {
      const contact: Contact = {
        id: uid(),
        ...form,
        tags,
        createdAt: now,
        lastActivityAt: now,
        activities: [{ id: uid(), type: "created", text: "Contact created", at: now }],
      };
      dispatch({ type: "contact/add", contact });
    }
    setOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit contact" : "New contact"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Full name *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Company">
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="Title / Role">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Segment">
            <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v as Segment })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {segmentOptions.map((s) => <SelectItem key={s} value={s}>{segmentLabels[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ContactStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Est. value ($)">
            <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          </Field>
          <div className="col-span-2">
            <Field label="Tags (comma separated)">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="hot, referral" />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Save changes" : "Create contact"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Deal
// ---------------------------------------------------------------------------
export function DealDialog({ trigger, existing }: { trigger: React.ReactNode; existing?: Deal }) {
  const { dispatch, contacts } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    title: existing?.title ?? "",
    contactId: existing?.contactId ?? (null as string | null),
    value: existing?.value ?? 0,
    stageId: existing?.stageId ?? stages[0].id,
    segment: existing?.segment ?? ("sales" as Segment),
    expectedClose: existing?.expectedClose ?? "",
  }));

  function submit() {
    if (!form.title.trim()) return;
    if (existing) {
      dispatch({ type: "deal/update", deal: { ...existing, ...form } });
    } else {
      dispatch({ type: "deal/add", deal: { id: uid(), ...form, createdAt: Date.now() } });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit deal" : "New deal"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Deal title *">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Acme — Annual contract" />
            </Field>
          </div>
          <Field label="Value ($)">
            <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          </Field>
          <Field label="Expected close">
            <Input type="date" value={form.expectedClose} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} />
          </Field>
          <Field label="Stage">
            <Select value={form.stageId} onValueChange={(v) => setForm({ ...form, stageId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Segment">
            <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v as Segment })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{segmentOptions.map((s) => <SelectItem key={s} value={s}>{segmentLabels[s]}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Linked contact">
              <Select value={form.contactId ?? "none"} onValueChange={(v) => setForm({ ...form, contactId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Save changes" : "Create deal"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------
export function PropertyDialog({ trigger }: { trigger: React.ReactNode }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    address: "",
    price: 0,
    beds: 0,
    baths: 0,
    sqft: 0,
    status: "Listed" as Property["status"],
    image: "",
  });

  function submit() {
    if (!form.title.trim()) return;
    dispatch({
      type: "property/add",
      property: {
        id: uid(),
        ...form,
        image: form.image || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
        createdAt: Date.now(),
      },
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>New property</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Title *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </div>
          <Field label="Price ($)"><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Property["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Listed", "Under Offer", "Sold"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Beds"><Input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: Number(e.target.value) })} /></Field>
          <Field label="Baths"><Input type="number" value={form.baths} onChange={(e) => setForm({ ...form, baths: Number(e.target.value) })} /></Field>
          <div className="col-span-2">
            <Field label="Size (ft²)"><Input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: Number(e.target.value) })} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Image URL (optional)"><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create property</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------
const taskStatuses: TaskStatus[] = ["To Do", "In Progress", "Done"];

export function TaskDialog({ trigger, existing }: { trigger: React.ReactNode; existing?: Task }) {
  const { dispatch, contacts, deals } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    title: existing?.title ?? "",
    due: existing?.due ?? "",
    priority: existing?.priority ?? ("Medium" as Task["priority"]),
    status: existing?.status ?? ("To Do" as TaskStatus),
    assignee: existing?.assignee ?? "",
    contactId: existing?.contactId ?? (null as string | null),
    dealId: existing?.dealId ?? (null as string | null),
  }));

  function submit() {
    if (!form.title.trim()) return;
    if (existing) {
      dispatch({ type: "task/update", task: { ...existing, ...form, done: form.status === "Done" } });
    } else {
      dispatch({
        type: "task/add",
        task: { id: uid(), ...form, done: form.status === "Done", createdAt: Date.now() },
      });
      setForm({ title: "", due: "", priority: "Medium", status: "To Do", assignee: "", contactId: null, dealId: null });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{existing ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Task *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Follow up with…" /></Field>
          </div>
          <Field label="Due date"><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
          <Field label="Priority">
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{taskStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Assignee"><Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="Me" /></Field>
          <Field label="Related contact">
            <Select value={form.contactId ?? "none"} onValueChange={(v) => setForm({ ...form, contactId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Related deal">
            <Select value={form.dealId ?? "none"} onValueChange={(v) => setForm({ ...form, dealId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Save changes" : "Create task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------
export function CompanyDialog({ trigger, existing }: { trigger: React.ReactNode; existing?: Company }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    industry: existing?.industry ?? "",
    size: existing?.size ?? "1-10",
    website: existing?.website ?? "",
    address: existing?.address ?? "",
    segment: existing?.segment ?? ("sales" as Segment),
  }));

  function submit() {
    if (!form.name.trim()) return;
    if (existing) dispatch({ type: "company/update", company: { ...existing, ...form } });
    else dispatch({ type: "company/add", company: { id: uid(), ...form, createdAt: Date.now() } });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{existing ? "Edit company" : "New company"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Company name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Inc." /></Field>
          </div>
          <Field label="Industry"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Real Estate" /></Field>
          <Field label="Size">
            <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="acme.com" /></Field>
          <Field label="Segment">
            <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v as Segment })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{segmentOptions.map((s) => <SelectItem key={s} value={s}>{segmentLabels[s]}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Save changes" : "Create company"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Calendar event
// ---------------------------------------------------------------------------
const eventTypes: EventType[] = ["meeting", "viewing", "follow-up", "call"];

export function EventDialog({ trigger, existing, defaultDate }: { trigger: React.ReactNode; existing?: CalendarEvent; defaultDate?: string }) {
  const { dispatch, contacts, deals, properties } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    title: existing?.title ?? "",
    type: existing?.type ?? ("meeting" as EventType),
    date: existing?.date ?? defaultDate ?? "",
    time: existing?.time ?? "09:00",
    durationMin: existing?.durationMin ?? 30,
    contactId: existing?.contactId ?? (null as string | null),
    dealId: existing?.dealId ?? (null as string | null),
    propertyId: existing?.propertyId ?? (null as string | null),
    notes: existing?.notes ?? "",
  }));

  function submit() {
    if (!form.title.trim() || !form.date) return;
    if (existing) dispatch({ type: "event/update", event: { ...existing, ...form } });
    else dispatch({ type: "event/add", event: { id: uid(), ...form, createdAt: Date.now() } });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{existing ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Title *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Property viewing" /></Field>
          </div>
          <Field label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as EventType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{eventTypes.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Duration (min)"><Input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} /></Field>
          <Field label="Date *"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Time"><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          <Field label="Contact">
            <Select value={form.contactId ?? "none"} onValueChange={(v) => setForm({ ...form, contactId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent><SelectItem value="none">None</SelectItem>{contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Deal">
            <Select value={form.dealId ?? "none"} onValueChange={(v) => setForm({ ...form, dealId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent><SelectItem value="none">None</SelectItem>{deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Property">
              <Select value={form.propertyId ?? "none"} onValueChange={(v) => setForm({ ...form, propertyId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Save changes" : "Create event"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Call log
// ---------------------------------------------------------------------------
const callOutcomes: CallOutcome[] = ["connected", "no-answer", "voicemail"];

export function CallDialog({ trigger }: { trigger: React.ReactNode }) {
  const { dispatch, contacts } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    contactId: null as string | null,
    direction: "outbound" as Call["direction"],
    outcome: "connected" as CallOutcome,
    durationSec: 300,
    notes: "",
  });

  function submit() {
    const now = Date.now();
    const contact = contacts.find((c) => c.id === form.contactId);
    const summary = generateCallSummary(form, contact?.name);
    dispatch({ type: "call/add", call: { id: uid(), ...form, summary, at: now, createdAt: now } });
    if (form.contactId) {
      dispatch({
        type: "contact/activity",
        id: form.contactId,
        activity: { id: uid(), type: "call", text: summary, at: now },
      });
    }
    setOpen(false);
    setForm({ contactId: null, direction: "outbound", outcome: "connected", durationSec: 300, notes: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Log call</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Contact">
              <Select value={form.contactId ?? "none"} onValueChange={(v) => setForm({ ...form, contactId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Direction">
            <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v as Call["direction"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="outbound">Outbound</SelectItem><SelectItem value="inbound">Inbound</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label="Outcome">
            <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v as CallOutcome })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{callOutcomes.map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace("-", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Duration (seconds)"><Input type="number" value={form.durationSec} onChange={(e) => setForm({ ...form, durationSec: Number(e.target.value) })} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Call notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What was discussed…" /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save & summarize</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------
export function CampaignDialog({ trigger, existing }: { trigger: React.ReactNode; existing?: Campaign }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    channel: existing?.channel ?? "Email",
    budget: existing?.budget ?? 0,
    spend: existing?.spend ?? 0,
    startDate: existing?.startDate ?? "",
    endDate: existing?.endDate ?? "",
    leads: existing?.leads ?? 0,
    conversions: existing?.conversions ?? 0,
    status: existing?.status ?? ("Planned" as Campaign["status"]),
  }));

  function submit() {
    if (!form.name.trim()) return;
    if (existing) dispatch({ type: "campaign/update", campaign: { ...existing, ...form } });
    else dispatch({ type: "campaign/add", campaign: { id: uid(), ...form, createdAt: Date.now() } });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{existing ? "Edit campaign" : "New campaign"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Campaign name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Spring listings push" /></Field>
          </div>
          <Field label="Channel">
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Email", "Social", "Paid Search", "Referral", "Events", "SMS"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Campaign["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["Planned", "Active", "Paused", "Completed"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Budget ($)"><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></Field>
          <Field label="Spend ($)"><Input type="number" value={form.spend} onChange={(e) => setForm({ ...form, spend: Number(e.target.value) })} /></Field>
          <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <Field label="Leads generated"><Input type="number" value={form.leads} onChange={(e) => setForm({ ...form, leads: Number(e.target.value) })} /></Field>
          <Field label="Conversions"><Input type="number" value={form.conversions} onChange={(e) => setForm({ ...form, conversions: Number(e.target.value) })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{existing ? "Save changes" : "Create campaign"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
        {icon}
      </div>
      <h3>{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
