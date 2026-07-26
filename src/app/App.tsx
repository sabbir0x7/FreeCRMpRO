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
import { ContactMe } from "./components/pages/ContactMe";
import { AuthScreen } from "./components/AuthScreen";
import { UpgradeModal } from "./components/UpgradeModal";
import { LandingPage } from "./components/landing/LandingPage";
import { Logo } from "./components/ui/Logo";
import { StoreProvider, type Segment } from "./store";
import { AuthProvider, useAuth } from "./auth";
import { SubscriptionProvider, useSubscription } from "./subscription";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

function Workspace() {
  const getInitialPage = (): Page => {
    const hash = window.location.hash.replace("#", "");
    return (hash as Page) || "dashboard";
  };
  const [page, setPageState] = useState<Page>(getInitialPage);
  const [segment, setSegment] = useState<Segment | "all">("all");
  const [dark, setDark] = useState(false);
  const { refresh } = useSubscription();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const setPage = (newPage: Page) => {
    setPageState(newPage);
    window.history.pushState(null, "", `#${newPage}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace("#", "");
      setPageState((hash as Page) || "dashboard");
    };
    window.addEventListener("popstate", handlePopState);
    if (!window.location.hash) {
      window.history.replaceState(null, "", `#${page}`);
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
        {page === "contact-me" && <ContactMe />}
      </Layout>
      <UpgradeModal onGoToBilling={() => setPage("billing")} />
    </StoreProvider>
  );
}

function Gate() {
  const { userId, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isContactRoute, setIsContactRoute] = useState(() => window.location.hash.replace("#", "") === "contact-me");

  useEffect(() => {
    const handleHash = () => {
      setIsContactRoute(window.location.hash.replace("#", "") === "contact-me");
    };
    window.addEventListener("popstate", handleHash);
    return () => window.removeEventListener("popstate", handleHash);
  }, []);

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

  if (isContactRoute) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="fixed top-4 left-4 z-50">
          <Logo 
            onClick={() => window.location.hash = ''} 
            className="rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 hover:bg-white/30 border border-white/20 shadow-sm transition-all" 
          />
        </div>
        <div className="pt-24 pb-12 max-w-5xl mx-auto px-4">
           <ContactMe />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <LandingPage
        onGetStarted={() => setShowAuth(true)}
        onLogin={() => setShowAuth(true)}
      />
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <AuthScreen onBack={() => setShowAuth(false)} />
        </div>
      )}
    </div>
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
