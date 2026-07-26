import { useRef, useState } from "react";
import { FileText, Upload, Trash2, PenLine, File } from "lucide-react";
import { Button } from "../ui/button";
import { EmptyState } from "../forms";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { useStore, uid, type DocStatus, type DocLinkType, type Document } from "../../store";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const statuses: DocStatus[] = ["draft", "sent", "signed", "expired"];
const statusStyle: Record<DocStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  signed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  expired: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function Documents() {
  const { documents, contacts, deals, companies, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<DocStatus | "all">("all");

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const parts = f.name.split(".");
      const ext = parts.length > 1 ? parts.pop()! : "file";
      dispatch({
        type: "document/add",
        document: {
          id: uid(),
          name: parts.join("."),
          ext,
          sizeKb: Math.max(1, Math.round(f.size / 1024)),
          status: "draft",
          linkType: null,
          linkId: null,
          createdAt: Date.now(),
        },
      });
    });
    toast.success("Document uploaded");
    if (fileRef.current) fileRef.current.value = "";
  }

  function linkOptions(type: DocLinkType) {
    if (type === "contact") return contacts.map((c) => ({ id: c.id, name: c.name }));
    if (type === "deal") return deals.map((d) => ({ id: d.id, name: d.title }));
    return companies.map((c) => ({ id: c.id, name: c.name }));
  }

  function linkedLabel(d: Document) {
    if (!d.linkType || !d.linkId) return null;
    const src = linkOptions(d.linkType).find((o) => o.id === d.linkId);
    return src ? `${d.linkType}: ${src.name}` : null;
  }

  const shown = filter === "all" ? documents : documents.filter((d) => d.status === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Documents</h1>
          <p className="text-sm text-muted-foreground">Contracts, proposals and invoices — linked to contacts, deals and companies</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as DocStatus | "all")}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <Button onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Upload</Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <EmptyState
            icon={<FileText className="size-6" />}
            title="No documents yet"
            description="Upload contracts, proposals and invoices, tag their status, and link them to a contact, deal or company. Drag & drop files here."
            action={<Button onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Upload a document</Button>}
          />
        </div>
      ) : (
        <div className="glass-surface divide-y divide-white/10 dark:divide-white/5 overflow-hidden rounded-xl border border-white/10 dark:border-white/5 shadow-sm">
          {shown.map((d) => (
            <div key={d.id} className="group flex flex-wrap items-center gap-3 p-3 transition-colors hover:bg-white/5 dark:hover:bg-white/5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 border border-brand/20 text-brand shadow-sm"><File className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm" style={{ fontWeight: 500 }}>{d.name}.{d.ext}</div>
                <div className="text-xs text-muted-foreground">{d.sizeKb} KB{linkedLabel(d) ? ` · ${linkedLabel(d)}` : ""}</div>
              </div>

              <Select value={d.linkType ?? "none"} onValueChange={(v) => dispatch({ type: "document/update", document: { ...d, linkType: v === "none" ? null : (v as DocLinkType), linkId: null } })}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Link to" /></SelectTrigger>
                <SelectContent><SelectItem value="none">No link</SelectItem><SelectItem value="contact">Contact</SelectItem><SelectItem value="deal">Deal</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent>
              </Select>
              {d.linkType && (
                <Select value={d.linkId ?? "none"} onValueChange={(v) => dispatch({ type: "document/update", document: { ...d, linkId: v === "none" ? null : v } })}>
                  <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">—</SelectItem>{linkOptions(d.linkType).map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                </Select>
              )}

              <Select value={d.status} onValueChange={(v) => dispatch({ type: "document/update", document: { ...d, status: v as DocStatus } })}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] capitalize", statusStyle[d.status])}>{d.status}</span>

              <button onClick={() => { dispatch({ type: "document/update", document: { ...d, status: "sent" } }); toast.success("E-signature request sent (placeholder)"); }} title="Request e-signature" className="text-muted-foreground hover:text-[var(--brand)]"><PenLine className="size-4" /></button>
              <button onClick={() => { dispatch({ type: "document/delete", id: d.id }); toast.success("Document deleted"); }} className="text-muted-foreground opacity-0 transition-opacity hover:text-[var(--destructive)] group-hover:opacity-100"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
