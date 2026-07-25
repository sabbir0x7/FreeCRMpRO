import { useState } from "react";
import { Building, Plus, Globe, MapPin, Users, Trash2, ChevronLeft, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { CompanyDialog, EmptyState } from "../forms";
import { useStore, currency, segmentLabels, type Company } from "../../store";
import { toast } from "sonner";

function CompanyDetail({ company, onBack }: { company: Company; onBack: () => void }) {
  const { contacts, deals, documents } = useStore();
  const linked = contacts.filter((c) => c.company.trim().toLowerCase() === company.name.trim().toLowerCase());
  const linkedIds = new Set(linked.map((c) => c.id));
  const companyDeals = deals.filter((d) => d.contactId && linkedIds.has(d.contactId));
  const companyDocs = documents.filter((d) => d.linkType === "company" && d.linkId === company.id);
  const totalValue = companyDeals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All companies
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-5">
        <div className="flex gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Building className="size-6" />
          </div>
          <div>
            <h1>{company.name}</h1>
            <p className="text-sm text-muted-foreground">{company.industry || "—"} · {segmentLabels[company.segment]}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {company.website && <span className="flex items-center gap-1"><Globe className="size-3.5" /> {company.website}</span>}
              {company.address && <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {company.address}</span>}
              <span className="flex items-center gap-1"><Users className="size-3.5" /> {company.size} employees</span>
            </div>
          </div>
        </div>
        <CompanyDialog existing={company} trigger={<Button variant="outline"><Pencil className="size-4" /> Edit</Button>} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">Contacts</div><div className="mt-1 text-2xl" style={{ fontWeight: 600 }}>{linked.length}</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">Deals</div><div className="mt-1 text-2xl" style={{ fontWeight: 600 }}>{companyDeals.length}</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">Pipeline value</div><div className="mt-1 text-2xl" style={{ fontWeight: 600 }}>{currency(totalValue)}</div></div>
      </div>

      <div>
        <h3 className="mb-2">Linked contacts</h3>
        {linked.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No contacts with company "{company.name}" yet. Set a contact's Company field to this name to link them.</p>
        ) : (
          <div className="divide-y rounded-xl border bg-card">
            {linked.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 text-sm">
                <div><span style={{ fontWeight: 500 }}>{c.name}</span> <span className="text-muted-foreground">· {c.title || c.status}</span></div>
                <span className="text-muted-foreground">{c.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2">Documents</h3>
        {companyDocs.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No documents linked to this company.</p>
        ) : (
          <div className="divide-y rounded-xl border bg-card">
            {companyDocs.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 text-sm">
                <span style={{ fontWeight: 500 }}>{d.name}.{d.ext}</span>
                <span className="capitalize text-muted-foreground">{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Companies() {
  const { companies, contacts, deals, dispatch } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  const current = companies.find((c) => c.id === selected);
  if (current) return <CompanyDetail company={current} onBack={() => setSelected(null)} />;

  function contactCount(name: string) {
    return contacts.filter((c) => c.company.trim().toLowerCase() === name.trim().toLowerCase()).length;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Companies</h1>
          <p className="text-sm text-muted-foreground">{companies.length} {companies.length === 1 ? "account" : "accounts"}</p>
        </div>
        <CompanyDialog trigger={<Button><Plus className="size-4" /> Add company</Button>} />
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={<Building className="size-6" />}
          title="No companies yet"
          description="Track organizations and accounts separately from individual contacts. Link multiple contacts and deals to each company."
          action={<CompanyDialog trigger={<Button><Plus className="size-4" /> Add your first company</Button>} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => {
            const dealCount = deals.filter((d) => d.contactId && contacts.find((x) => x.id === d.contactId)?.company.trim().toLowerCase() === c.name.trim().toLowerCase()).length;
            return (
              <div key={c.id} className="group cursor-pointer rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm" onClick={() => setSelected(c.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Building className="size-5" /></div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: "company/delete", id: c.id }); toast.success("Company removed"); }}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-[var(--destructive)] group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <h3 className="mt-3">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.industry || segmentLabels[c.segment]}</p>
                <div className="mt-3 flex gap-4 border-t pt-3 text-sm text-muted-foreground">
                  <span>{contactCount(c.name)} contacts</span>
                  <span>{dealCount} deals</span>
                  <span>{c.size}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
