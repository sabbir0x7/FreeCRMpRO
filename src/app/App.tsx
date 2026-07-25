import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Layout, type Page } from "./components/Layout";
import { Dashboard } from "./components/pages/Dashboard";
import { Contacts } from "./components/pages/Contacts";
import { Pipeline } from "./components/pages/Pipeline";
import { Companies } from "./components/pages/Companies";
import { Calendar } from "./components/pages/Calendar";
import { Tasks } from "./components/pages/Tasks";
import { Calls } from "./components/pages/Calls";
import { Inbox } from "./components/pages/Inbox";
import { Documents } from "./components/pages/Documents";
import { Email } from "./components/pages/Email";
import { Properties } from "./components/pages/Properties";
import { Campaigns } from "./components/pages/Campaigns";
import { Forms } from "./components/pages/Forms";
import { Insights } from "./components/pages/Insights";
import { Analytics } from "./components/pages/Analytics";
import { Billing } from "./components/pages/Billing";
import { AuthScreen } from "./components/AuthScreen";
import { UpgradeModal } from "./components/UpgradeModal";
import { LandingPage } from "./components/landing/LandingPage";
import { StoreProvider, type Segment } from "./store";
import { AuthProvider, useAuth } from "./auth";
import { SubscriptionProvider, useSubscription } from "./subscription";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

function Workspace() {
  const [page, setPage] = useState<Page>("dashboard");
  const [segment, setSegment] = useState<Segment | "all">("all");
  const [dark, setDark] = useState(false);
  const { refresh } = useSubscription();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Handle the Stripe / simulated checkout redirect (?upgrade=success|cancel).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get("upgrade");
    if (upgrade === "success") {
      refresh();
      setPage("dashboard");
      toast.success("You're all set — welcome to FreeCRMpRO Pro! 🎉");
    } else if (upgrade === "cancel") {
      toast.info("Checkout canceled — you can upgrade any time.");
    }
    if (upgrade) window.history.replaceState({}, "", window.location.pathname);
  }, [refresh]);

  return (
    <StoreProvider>
      <Layout page={page} setPage={setPage} segment={segment} setSegment={setSegment} dark={dark} setDark={setDark}>
        {page === "dashboard" && <Dashboard segment={segment} setPage={setPage} />}
        {page === "contacts" && <Contacts segment={segment} />}
        {page === "companies" && <Companies />}
        {page === "pipeline" && <Pipeline segment={segment} />}
        {page === "calendar" && <Calendar />}
        {page === "tasks" && <Tasks />}
        {page === "calls" && <Calls />}
        {page === "inbox" && <Inbox />}
        {page === "documents" && <Documents />}
        {page === "email" && <Email />}
        {page === "properties" && <Properties />}
        {page === "campaigns" && <Campaigns />}
        {page === "forms" && <Forms />}
        {page === "insights" && <Insights />}
        {page === "analytics" && <Analytics />}
        {page === "billing" && <Billing />}
      </Layout>
      <UpgradeModal onGoToBilling={() => setPage("billing")} />
    </StoreProvider>
  );
}

function Gate() {
  const { userId, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  if (userId) {
    return (
      <SubscriptionProvider>
        <Workspace />
      </SubscriptionProvider>
    );
  }

  if (showAuth) {
    return <AuthScreen onBack={() => setShowAuth(false)} />;
  }

  return (
    <LandingPage
      onGetStarted={() => setShowAuth(true)}
      onLogin={() => setShowAuth(true)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
      <Toaster />
    </AuthProvider>
  );
}
