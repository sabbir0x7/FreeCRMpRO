import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building,
  Kanban,
  CalendarDays,
  CheckSquare,
  Phone,
  Inbox,
  FileText,
  Mail,
  Building2,
  Megaphone,
  FileInput,
  Sparkles,
  BarChart3,
  CreditCard,
  Search,
  Bell,
  Moon,
  Sun,
  Plus,
  ChevronDown,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { cn } from "./ui/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { segmentLabels, type Segment } from "../store";
import { useAuth } from "../auth";
import { useSubscription } from "../subscription";
import { ContactDialog } from "./forms";
import { Sparkles as SparklesIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type Page =
  | "dashboard"
  | "contacts"
  | "companies"
  | "pipeline"
  | "calendar"
  | "tasks"
  | "calls"
  | "inbox"
  | "documents"
  | "email"
  | "properties"
  | "campaigns"
  | "forms"
  | "insights"
  | "analytics"
  | "billing";

const nav: { id: Page; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "contacts", label: "Contacts & Leads", icon: Users },
  { id: "companies", label: "Companies", icon: Building },
  { id: "pipeline", label: "Pipeline", icon: Kanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "inbox", label: "Activity", icon: Inbox },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "email", label: "Email", icon: Mail },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "forms", label: "Forms", icon: FileInput },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export function Layout({
  page,
  setPage,
  segment,
  setSegment,
  dark,
  setDark,
  children,
}: {
  page: Page;
  setPage: (p: Page) => void;
  segment: Segment | "all";
  setSegment: (s: Segment | "all") => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  children: React.ReactNode;
}) {
  const [collapsed] = useState(false);
  const { email, signOut } = useAuth();
  const { status, daysLeft } = useSubscription();
  return (
    <div className="flex h-full w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className={cn("hidden shrink-0 flex-col border-r bg-sidebar md:flex", collapsed ? "w-16" : "w-64")}>
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand)] text-[var(--brand-foreground)]">
            <Sparkles className="size-4" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="text-lg">
            FreeCRM<span className="text-[var(--brand)]">pRO</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--brand)] text-[var(--brand-foreground)]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-white/20" : "bg-[var(--brand)] text-white")}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback>{(email ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm" style={{ fontWeight: 500 }}>{email ?? "My Workspace"}</div>
              <div className="truncate text-xs text-muted-foreground">Owner</div>
            </div>
            <button onClick={signOut} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b px-4 md:px-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent">
              {segment === "all" ? "All Segments" : segmentLabels[segment]}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Workspace segment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSegment("all")}>All Segments</DropdownMenuItem>
              {(Object.keys(segmentLabels) as Segment[]).map((s) => (
                <DropdownMenuItem key={s} onClick={() => setSegment(s)}>
                  {segmentLabels[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative ml-2 hidden max-w-md flex-1 items-center sm:flex">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <input
              placeholder="Search contacts, deals, properties…"
              className="w-full rounded-lg border bg-input-background py-1.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {status === "trialing" && (
              <span className="hidden items-center gap-1.5 rounded-full border border-[var(--brand)]/30 bg-[var(--brand-soft)] px-3 py-1 text-xs text-[var(--brand)] sm:inline-flex" style={{ fontWeight: 500 }}>
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your free trial
              </span>
            )}
            <button
              onClick={() => setPage("billing")}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--brand)]/40 px-3 py-1.5 text-sm text-[var(--brand)] hover:bg-[var(--brand-soft)]"
            >
              <SparklesIcon className="size-4" /> <span className="hidden sm:inline">Upgrade</span>
            </button>
            <ContactDialog
              trigger={
                <button className="flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3 py-1.5 text-sm text-[var(--brand-foreground)]">
                  <Plus className="size-4" /> <span className="hidden sm:inline">New contact</span>
                </button>
              }
            />
            <button
              onClick={() => setDark(!dark)}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-accent"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button className="relative flex size-9 items-center justify-center rounded-lg hover:bg-accent">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--destructive)]" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
