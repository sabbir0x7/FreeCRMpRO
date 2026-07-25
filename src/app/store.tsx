import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useAuth } from "./auth";
import { SERVER_URL } from "./supabaseClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Segment = "real-estate" | "agency" | "freelancer" | "sales";

export type ContactStatus = "New" | "Engaged" | "Qualified" | "Customer" | "Churned";

export interface Activity {
  id: string;
  type: "note" | "email" | "call" | "meeting" | "stage" | "created";
  text: string;
  at: number; // epoch ms
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  tags: string[];
  segment: Segment;
  status: ContactStatus;
  value: number;
  createdAt: number;
  lastActivityAt: number;
  activities: Activity[];
}

export interface Deal {
  id: string;
  title: string;
  contactId: string | null;
  value: number;
  stageId: string;
  segment: Segment;
  expectedClose: string; // yyyy-mm-dd
  createdAt: number;
}

export type TaskStatus = "To Do" | "In Progress" | "Done";

export interface Task {
  id: string;
  title: string;
  due: string; // yyyy-mm-dd
  priority: "High" | "Medium" | "Low";
  done: boolean;
  status: TaskStatus;
  assignee: string;
  dealId: string | null;
  contactId: string | null;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Companies — organization/account-level records
// ---------------------------------------------------------------------------
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string; // e.g. "1-10", "11-50"
  website: string;
  address: string;
  segment: Segment;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Calendar events — meetings, viewings, follow-ups
// ---------------------------------------------------------------------------
export type EventType = "meeting" | "viewing" | "follow-up" | "call";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  durationMin: number;
  contactId: string | null;
  dealId: string | null;
  propertyId: string | null;
  notes: string;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Calls — call log entries
// ---------------------------------------------------------------------------
export type CallOutcome = "connected" | "no-answer" | "voicemail";

export interface Call {
  id: string;
  contactId: string | null;
  direction: "outbound" | "inbound";
  outcome: CallOutcome;
  durationSec: number;
  notes: string;
  summary: string; // AI-generated
  at: number;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Documents — files linked to a contact / deal / company
// ---------------------------------------------------------------------------
export type DocStatus = "draft" | "sent" | "signed" | "expired";
export type DocLinkType = "contact" | "deal" | "company";

export interface Document {
  id: string;
  name: string;
  ext: string;
  sizeKb: number;
  status: DocStatus;
  linkType: DocLinkType | null;
  linkId: string | null;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Emails — threads linked to contacts / deals
// ---------------------------------------------------------------------------
export interface Email {
  id: string;
  contactId: string | null;
  dealId: string | null;
  subject: string;
  body: string;
  direction: "inbound" | "outbound";
  read: boolean;
  at: number;
}

// ---------------------------------------------------------------------------
// Campaigns — marketing campaign tracker
// ---------------------------------------------------------------------------
export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spend: number;
  startDate: string;
  endDate: string;
  leads: number;
  conversions: number;
  status: "Planned" | "Active" | "Completed" | "Paused";
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Forms — lead capture form builder + submissions
// ---------------------------------------------------------------------------
export type FormFieldType = "name" | "email" | "phone" | "text" | "textarea" | "select";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
}

export interface LeadForm {
  id: string;
  name: string;
  fields: FormField[];
  segment: Segment;
  createdAt: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, string>;
  createdAt: number;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: "Listed" | "Under Offer" | "Sold";
  image: string;
  createdAt: number;
}

export interface Stage {
  id: string;
  name: string;
  accent: string;
}

interface State {
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  properties: Property[];
  companies: Company[];
  events: CalendarEvent[];
  calls: Call[];
  documents: Document[];
  emails: Email[];
  campaigns: Campaign[];
  forms: LeadForm[];
  submissions: FormSubmission[];
}

// ---------------------------------------------------------------------------
// Static configuration (not demo data — these are real app settings)
// ---------------------------------------------------------------------------
export const stages: Stage[] = [
  { id: "s1", name: "New Lead", accent: "#6366f1" },
  { id: "s2", name: "Contacted", accent: "#0ea5e9" },
  { id: "s3", name: "Qualified", accent: "#8b5cf6" },
  { id: "s4", name: "Proposal", accent: "#f59e0b" },
  { id: "s5", name: "Negotiation", accent: "#ec4899" },
  { id: "s6", name: "Won", accent: "#16a34a" },
];

export const segmentLabels: Record<Segment, string> = {
  "real-estate": "Real Estate",
  agency: "Agency",
  freelancer: "Freelancer",
  sales: "Sales Team",
};

export const segmentOptions = Object.keys(segmentLabels) as Segment[];

// ---------------------------------------------------------------------------
// Real lead scoring — deterministic function of the user's actual data.
// ---------------------------------------------------------------------------
export function scoreContact(c: Contact): number {
  let score = 0;
  const statusWeight: Record<ContactStatus, number> = {
    New: 15,
    Engaged: 40,
    Qualified: 65,
    Customer: 90,
    Churned: 10,
  };
  score += statusWeight[c.status];

  // Deal value signal (up to +20)
  score += Math.min(20, Math.round(c.value / 5000));

  // Engagement recency (up to +15)
  const days = (Date.now() - c.lastActivityAt) / 86_400_000;
  if (days < 1) score += 15;
  else if (days < 3) score += 10;
  else if (days < 7) score += 5;
  else if (days > 21) score -= 10;

  // Activity volume (up to +10)
  score += Math.min(10, c.activities.length * 2);

  // Intent tags
  const hot = ["hot", "vip", "referral", "inbound", "enterprise"];
  if (c.tags.some((t) => hot.includes(t.toLowerCase()))) score += 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreTrend(c: Contact): "up" | "down" | "flat" {
  const days = (Date.now() - c.lastActivityAt) / 86_400_000;
  if (days < 2 && (c.status === "Engaged" || c.status === "Qualified")) return "up";
  if (days > 14) return "down";
  return "flat";
}

// Deal close probability derived from stage + linked contact score.
export function dealProbability(deal: Deal, contacts: Contact[]): number {
  const stageIndex = stages.findIndex((s) => s.id === deal.stageId);
  const base = Math.round(((stageIndex + 1) / stages.length) * 70);
  const contact = contacts.find((c) => c.id === deal.contactId);
  const bonus = contact ? Math.round(scoreContact(contact) * 0.3) : 0;
  return Math.max(2, Math.min(98, base + bonus));
}

// ---------------------------------------------------------------------------
// Reducer + persistence
// ---------------------------------------------------------------------------
type Action =
  | { type: "hydrate"; state: State }
  | { type: "contact/add"; contact: Contact }
  | { type: "contact/update"; contact: Contact }
  | { type: "contact/delete"; id: string }
  | { type: "contact/activity"; id: string; activity: Activity }
  | { type: "deal/add"; deal: Deal }
  | { type: "deal/update"; deal: Deal }
  | { type: "deal/move"; id: string; stageId: string }
  | { type: "deal/delete"; id: string }
  | { type: "task/add"; task: Task }
  | { type: "task/toggle"; id: string }
  | { type: "task/update"; task: Task }
  | { type: "task/delete"; id: string }
  | { type: "property/add"; property: Property }
  | { type: "property/update"; property: Property }
  | { type: "property/delete"; id: string }
  | { type: "company/add"; company: Company }
  | { type: "company/update"; company: Company }
  | { type: "company/delete"; id: string }
  | { type: "event/add"; event: CalendarEvent }
  | { type: "event/update"; event: CalendarEvent }
  | { type: "event/delete"; id: string }
  | { type: "call/add"; call: Call }
  | { type: "call/update"; call: Call }
  | { type: "call/delete"; id: string }
  | { type: "document/add"; document: Document }
  | { type: "document/update"; document: Document }
  | { type: "document/delete"; id: string }
  | { type: "email/add"; email: Email }
  | { type: "email/read"; id: string }
  | { type: "email/delete"; id: string }
  | { type: "campaign/add"; campaign: Campaign }
  | { type: "campaign/update"; campaign: Campaign }
  | { type: "campaign/delete"; id: string }
  | { type: "form/add"; form: LeadForm }
  | { type: "form/update"; form: LeadForm }
  | { type: "form/delete"; id: string }
  | { type: "submission/add"; submission: FormSubmission };

const empty: State = {
  contacts: [],
  deals: [],
  tasks: [],
  properties: [],
  companies: [],
  events: [],
  calls: [],
  documents: [],
  emails: [],
  campaigns: [],
  forms: [],
  submissions: [],
};

// Deterministic AI helpers — reuse the same local "AI Insights" approach as
// scoreContact. These stand in for the Python AI microservice.
export function generateCallSummary(call: { outcome: CallOutcome; durationSec: number; notes: string }, contactName?: string): string {
  const who = contactName ? `with ${contactName}` : "with the prospect";
  const mins = Math.max(1, Math.round(call.durationSec / 60));
  if (call.outcome === "no-answer") return `No answer ${who}. Recommend a follow-up email and a retry in 24h.`;
  if (call.outcome === "voicemail") return `Left a voicemail ${who}. Suggest a follow-up email summarizing next steps.`;
  const topic = call.notes.trim() ? call.notes.trim().split(/[.\n]/)[0] : "general discovery";
  return `${mins}-min connected call ${who}. Key topic: ${topic}. Positive engagement — recommend sending a proposal and booking a follow-up.`;
}

export function draftEmail(contactName: string, purpose: string): { subject: string; body: string } {
  const first = (contactName || "there").split(" ")[0];
  return {
    subject: purpose || `Following up, ${first}`,
    body: `Hi ${first},\n\nThanks for your time. ${purpose ? `I wanted to follow up regarding ${purpose.toLowerCase()}.` : "I wanted to follow up on our recent conversation."} I'd love to find a time to discuss the next steps and answer any questions you might have.\n\nAre you available for a quick call this week?\n\nBest regards`,
  };
}

// Backward-compatible migration for workspaces created before the new modules.
// Existing arrays are preserved; missing collections default via `empty` above,
// and legacy tasks (which only had a `done` boolean) gain status/assignee/dealId.
function normalize(state: State): State {
  return {
    ...state,
    tasks: (state.tasks ?? []).map((t) => ({
      assignee: "",
      dealId: null,
      ...t,
      status: t.status ?? (t.done ? "Done" : "To Do"),
    })),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "contact/add":
      return { ...state, contacts: [action.contact, ...state.contacts] };
    case "contact/update":
      return { ...state, contacts: state.contacts.map((c) => (c.id === action.contact.id ? action.contact : c)) };
    case "contact/delete":
      return {
        ...state,
        contacts: state.contacts.filter((c) => c.id !== action.id),
        deals: state.deals.map((d) => (d.contactId === action.id ? { ...d, contactId: null } : d)),
        tasks: state.tasks.map((t) => (t.contactId === action.id ? { ...t, contactId: null } : t)),
      };
    case "contact/activity":
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.id
            ? { ...c, activities: [action.activity, ...c.activities], lastActivityAt: action.activity.at }
            : c
        ),
      };
    case "deal/add":
      return { ...state, deals: [action.deal, ...state.deals] };
    case "deal/update":
      return { ...state, deals: state.deals.map((d) => (d.id === action.deal.id ? action.deal : d)) };
    case "deal/move":
      return { ...state, deals: state.deals.map((d) => (d.id === action.id ? { ...d, stageId: action.stageId } : d)) };
    case "deal/delete":
      return { ...state, deals: state.deals.filter((d) => d.id !== action.id) };
    case "task/add":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "task/toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, done: !t.done, status: !t.done ? "Done" : "To Do" } : t
        ),
      };
    case "task/update":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)) };
    case "task/delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "property/add":
      return { ...state, properties: [action.property, ...state.properties] };
    case "property/update":
      return { ...state, properties: state.properties.map((p) => (p.id === action.property.id ? action.property : p)) };
    case "property/delete":
      return { ...state, properties: state.properties.filter((p) => p.id !== action.id) };
    case "company/add":
      return { ...state, companies: [action.company, ...state.companies] };
    case "company/update":
      return { ...state, companies: state.companies.map((x) => (x.id === action.company.id ? action.company : x)) };
    case "company/delete":
      return {
        ...state,
        companies: state.companies.filter((x) => x.id !== action.id),
        documents: state.documents.map((d) => (d.linkType === "company" && d.linkId === action.id ? { ...d, linkType: null, linkId: null } : d)),
      };
    case "event/add":
      return { ...state, events: [action.event, ...state.events] };
    case "event/update":
      return { ...state, events: state.events.map((x) => (x.id === action.event.id ? action.event : x)) };
    case "event/delete":
      return { ...state, events: state.events.filter((x) => x.id !== action.id) };
    case "call/add":
      return { ...state, calls: [action.call, ...state.calls] };
    case "call/update":
      return { ...state, calls: state.calls.map((x) => (x.id === action.call.id ? action.call : x)) };
    case "call/delete":
      return { ...state, calls: state.calls.filter((x) => x.id !== action.id) };
    case "document/add":
      return { ...state, documents: [action.document, ...state.documents] };
    case "document/update":
      return { ...state, documents: state.documents.map((x) => (x.id === action.document.id ? action.document : x)) };
    case "document/delete":
      return { ...state, documents: state.documents.filter((x) => x.id !== action.id) };
    case "email/add":
      return { ...state, emails: [action.email, ...state.emails] };
    case "email/read":
      return { ...state, emails: state.emails.map((x) => (x.id === action.id ? { ...x, read: true } : x)) };
    case "email/delete":
      return { ...state, emails: state.emails.filter((x) => x.id !== action.id) };
    case "campaign/add":
      return { ...state, campaigns: [action.campaign, ...state.campaigns] };
    case "campaign/update":
      return { ...state, campaigns: state.campaigns.map((x) => (x.id === action.campaign.id ? action.campaign : x)) };
    case "campaign/delete":
      return { ...state, campaigns: state.campaigns.filter((x) => x.id !== action.id) };
    case "form/add":
      return { ...state, forms: [action.form, ...state.forms] };
    case "form/update":
      return { ...state, forms: state.forms.map((x) => (x.id === action.form.id ? action.form : x)) };
    case "form/delete":
      return {
        ...state,
        forms: state.forms.filter((x) => x.id !== action.id),
        submissions: state.submissions.filter((s) => s.formId !== action.id),
      };
    case "submission/add":
      return { ...state, submissions: [action.submission, ...state.submissions] };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface Store extends State {
  dispatch: React.Dispatch<Action>;
  loading: boolean;
  saving: boolean;
}
const StoreContext = createContext<Store | null>(null);

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [state, dispatch] = useReducer(reducer, empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the authenticated user's workspace from the server.
  useEffect(() => {
    hydrated.current = false;
    if (!accessToken) {
      dispatch({ type: "hydrate", state: empty });
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/workspace`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Failed to load workspace");
        dispatch({ type: "hydrate", state: normalize({ ...empty, ...body.workspace }) });
      } catch (err) {
        console.log("Error loading workspace from server:", err);
        dispatch({ type: "hydrate", state: empty });
      } finally {
        hydrated.current = true;
        setLoading(false);
      }
    })();
  }, [accessToken]);

  // Debounced persistence to the server after hydration.
  useEffect(() => {
    if (!accessToken || !hydrated.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/workspace`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ workspace: state }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to save workspace");
        }
      } catch (err) {
        console.log("Error saving workspace to server:", err);
      } finally {
        setSaving(false);
      }
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, accessToken]);

  const value = useMemo(() => ({ ...state, dispatch, loading, saving }), [state, loading, saving]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function currency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

export function relativeTime(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
