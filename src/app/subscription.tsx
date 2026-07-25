import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth";
import { SERVER_URL } from "./supabaseClient";

export type SubStatus = "trialing" | "active" | "expired" | "canceled";

interface SubData {
  status: SubStatus;
  daysLeft: number;
  trialEndsAt: number | null;
  planType: "monthly" | "yearly" | null;
  currentPeriodEnd: number | null;
  allowed: boolean;
}

interface SubContext extends SubData {
  loading: boolean;
  isLocked: boolean; // trial ended AND not active
  refresh: () => Promise<void>;
  upgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const defaults: SubData = {
  status: "trialing",
  daysLeft: 14,
  trialEndsAt: null,
  planType: null,
  currentPeriodEnd: null,
  allowed: true,
};

const Ctx = createContext<SubContext | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [data, setData] = useState<SubData>(defaults);
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${SERVER_URL}/subscription`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load subscription");
      setData({
        status: body.status,
        daysLeft: body.daysLeft,
        trialEndsAt: body.trialEndsAt,
        planType: body.plan_type,
        currentPeriodEnd: body.current_period_end,
        allowed: body.allowed,
      });
    } catch (err) {
      console.log("Error loading subscription:", err);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setData(defaults);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [accessToken, refresh]);

  const value = useMemo<SubContext>(
    () => ({
      ...data,
      loading,
      isLocked: !data.allowed,
      refresh,
      upgradeModalOpen,
      openUpgradeModal: () => setUpgradeModalOpen(true),
      closeUpgradeModal: () => setUpgradeModalOpen(false),
    }),
    [data, loading, refresh, upgradeModalOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
