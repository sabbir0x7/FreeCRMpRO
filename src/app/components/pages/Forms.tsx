import { useState } from "react";
import { FileInput, Plus, Trash2, Copy, Send, GripVertical, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { EmptyState } from "../forms";
import { AiChip } from "../shared";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import {
  useStore, uid, scoreContact, segmentOptions, segmentLabels, relativeTime,
  type LeadForm, type FormField, type FormFieldType, type Segment, type Contact,
} from "../../store";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const fieldTypes: { type: FormFieldType; label: string }[] = [
  { type: "name", label: "Name" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "text", label: "Short text" },
  { type: "textarea", label: "Long text" },
  { type: "select", label: "Dropdown" },
];

function defaultFields(): FormField[] {
  return [
    { id: uid(), type: "name", label: "Full name", required: true },
    { id: uid(), type: "email", label: "Email", required: true },
    { id: uid(), type: "phone", label: "Phone", required: false },
  ];
}

function Builder({ form, onBack }: { form: LeadForm; onBack: () => void }) {
  const { dispatch, submissions, forms } = useStore();
  const live = forms.find((f) => f.id === form.id) ?? form;
  const formSubs = submissions.filter((s) => s.formId === form.id).sort((a, b) => b.createdAt - a.createdAt);
  const [values, setValues] = useState<Record<string, string>>({});

  function update(next: Partial<LeadForm>) {
    dispatch({ type: "form/update", form: { ...live, ...next } });
  }
  function addField(type: FormFieldType) {
    const label = fieldTypes.find((f) => f.type === type)!.label;
    update({ fields: [...live.fields, { id: uid(), type, label, required: false }] });
  }
  function setField(id: string, patch: Partial<FormField>) {
    update({ fields: live.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  }
  function removeField(id: string) {
    update({ fields: live.fields.filter((f) => f.id !== id) });
  }

  function submitEntry() {
    const nameField = live.fields.find((f) => f.type === "name");
    const emailField = live.fields.find((f) => f.type === "email");
    const phoneField = live.fields.find((f) => f.type === "phone");
    const name = (nameField && values[nameField.id]) || "New Lead";
    const now = Date.now();

    dispatch({ type: "submission/add", submission: { id: uid(), formId: live.id, data: values, createdAt: now } });

    const contact: Contact = {
      id: uid(),
      name,
      email: (emailField && values[emailField.id]) || "",
      phone: (phoneField && values[phoneField.id]) || "",
      company: "",
      title: "",
      tags: ["inbound", `form:${live.name}`],
      segment: live.segment,
      status: "New",
      value: 0,
      createdAt: now,
      lastActivityAt: now,
      activities: [{ id: uid(), type: "created", text: `Captured via form "${live.name}"`, at: now }],
    };
    dispatch({ type: "contact/add", contact });
    toast.success(`Lead created · AI score ${scoreContact(contact)}`);
    setValues({});
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://forms.freecrmpro.app/f/${live.id}`).catch(() => {});
    toast.success("Shareable form link copied");
  }
  function copyEmbed() {
    navigator.clipboard?.writeText(`<iframe src="https://forms.freecrmpro.app/f/${live.id}" width="100%" height="520" frameborder="0"></iframe>`).catch(() => {});
    toast.success("Embed code copied");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> All forms</button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input value={live.name} onChange={(e) => update({ name: e.target.value })} className="max-w-xs text-lg" style={{ fontWeight: 600 }} />
        <div className="flex items-center gap-2">
          <Select value={live.segment} onValueChange={(v) => update({ segment: v as Segment })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{segmentOptions.map((s) => <SelectItem key={s} value={s}>{segmentLabels[s]}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={copyLink}><Copy className="size-4" /> Link</Button>
          <Button variant="outline" onClick={copyEmbed}>Embed</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Builder */}
        <div className="space-y-3">
          <h3>Fields</h3>
          <div className="space-y-2">
            {live.fields.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-lg border bg-card p-2">
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <Input value={f.label} onChange={(e) => setField(f.id, { label: e.target.value })} className="h-8" />
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] capitalize text-muted-foreground">{f.type}</span>
                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={f.required} onChange={(e) => setField(f.id, { required: e.target.checked })} /> Req</label>
                <button onClick={() => removeField(f.id)} className="shrink-0 text-muted-foreground hover:text-[var(--destructive)]"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {fieldTypes.map((ft) => (
              <button key={ft.type} onClick={() => addField(ft.type)} className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs hover:bg-accent"><Plus className="size-3" /> {ft.label}</button>
            ))}
          </div>
        </div>

        {/* Live preview / test submit */}
        <div className="space-y-3">
          <h3>Preview & test</h3>
          <div className="space-y-3 rounded-xl border bg-card p-4">
            {live.fields.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <Label>{f.label}{f.required && <span className="text-[var(--destructive)]"> *</span>}</Label>
                {f.type === "textarea" ? (
                  <Textarea value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
                ) : f.type === "select" ? (
                  <Input value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} placeholder="Option…" />
                ) : (
                  <Input type={f.type === "email" ? "email" : "text"} value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
                )}
              </div>
            ))}
            <Button onClick={submitEntry} className="w-full"><Send className="size-4" /> Submit test entry</Button>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3 text-[var(--brand)]" /> Submissions auto-create a scored lead tagged "inbound".</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2">Submissions ({formSubs.length})</h3>
        {formSubs.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No submissions yet. Share the link or submit a test entry above.</p>
        ) : (
          <div className="divide-y rounded-xl border bg-card">
            {formSubs.map((s) => (
              <div key={s.id} className="p-3 text-sm">
                <div className="mb-1 text-xs text-muted-foreground">{relativeTime(s.createdAt)}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {live.fields.map((f) => s.data[f.id] ? <span key={f.id}><span className="text-muted-foreground">{f.label}:</span> {s.data[f.id]}</span> : null)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Forms() {
  const { forms, submissions, dispatch } = useStore();
  const [editing, setEditing] = useState<string | null>(null);

  function create() {
    const form: LeadForm = { id: uid(), name: "Untitled form", fields: defaultFields(), segment: "sales", createdAt: Date.now() };
    dispatch({ type: "form/add", form });
    setEditing(form.id);
  }

  const current = forms.find((f) => f.id === editing);
  if (current) return <Builder form={current} onBack={() => setEditing(null)} />;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Forms</h1>
          <p className="text-sm text-muted-foreground">Build lead capture forms — submissions become scored leads</p>
        </div>
        <Button onClick={create}><Plus className="size-4" /> New form</Button>
      </div>

      {forms.length === 0 ? (
        <EmptyState
          icon={<FileInput className="size-6" />}
          title="No forms yet"
          description="Build a lead capture form by choosing fields, then share the link or embed it. Every submission auto-creates a contact and lead tagged with its source."
          action={<Button onClick={create}><Plus className="size-4" /> Build your first form</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => {
            const count = submissions.filter((s) => s.formId === f.id).length;
            return (
              <div key={f.id} className={cn("group cursor-pointer rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm")} onClick={() => setEditing(f.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><FileInput className="size-5" /></div>
                  <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "form/delete", id: f.id }); toast.success("Form deleted"); }} className="text-muted-foreground opacity-0 transition-opacity hover:text-[var(--destructive)] group-hover:opacity-100"><Trash2 className="size-4" /></button>
                </div>
                <h3 className="mt-3">{f.name}</h3>
                <p className="text-sm text-muted-foreground">{f.fields.length} fields · {segmentLabels[f.segment]}</p>
                <div className="mt-3 flex items-center gap-1 border-t pt-3 text-sm text-muted-foreground"><AiChip>{count} submissions</AiChip></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
