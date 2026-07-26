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
    <div className="flex h-screen w-full overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className={cn("hidden shrink-0 flex-col glass-sidebar m-4 mr-0 h-[calc(100vh-2rem)] rounded-2xl border border-white/20 dark:border-white/10 shadow-lg md:flex transition-all duration-300", collapsed ? "w-16" : "w-64")}>
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
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-out",
                  active
                    ? "bg-brand/15 text-brand shadow-sm font-medium dark:bg-brand/20 dark:text-brand-foreground"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
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

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="glass-navbar mx-4 mt-4 flex h-16 shrink-0 items-center gap-3 rounded-2xl px-4 border border-white/20 dark:border-white/10 shadow-sm md:px-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="glass-surface flex items-center gap-2 rounded-xl border border-white/20 dark:border-white/10 px-3 py-1.5 text-sm hover:bg-white/50 dark:hover:bg-white/10 transition-colors shadow-sm">
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
              className="glass-input w-full rounded-xl py-2 pl-9 pr-3 text-sm outline-none transition-all duration-200"
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
              className="glass-surface flex items-center gap-1.5 rounded-xl border border-[var(--brand)]/30 px-3 py-1.5 text-sm text-[var(--brand)] shadow-sm transition-all hover:-translate-y-[1px] hover:bg-[var(--brand)]/10"
            >
              <SparklesIcon className="size-4" /> <span className="hidden sm:inline">Upgrade</span>
            </button>
            <ContactDialog
              trigger={
                <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-brand to-brand/90 px-3 py-1.5 text-sm text-[var(--brand-foreground)] shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md hover:to-brand">
                  <Plus className="size-4" /> <span className="hidden sm:inline">New contact</span>
                </button>
              }
            />
            <button
              onClick={() => setDark(!dark)}
              className="glass-surface flex size-9 items-center justify-center rounded-xl border border-white/20 shadow-sm transition-all hover:bg-white/50 dark:border-white/10 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
            </button>
            <button className="glass-surface relative flex size-9 items-center justify-center rounded-xl border border-white/20 shadow-sm transition-all hover:bg-white/50 dark:border-white/10 dark:hover:bg-white/10">
              <Bell className="size-4 text-muted-foreground" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--destructive)] shadow-[0_0_8px_var(--destructive)]" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
          {children}
        </main>
      </div>
    </div>
  );
}
