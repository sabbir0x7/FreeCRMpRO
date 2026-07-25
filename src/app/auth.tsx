import { createContext, useContext, useEffect, useState } from "react";
import { supabase, SERVER_URL, publicAnonKey } from "./supabaseClient";

interface AuthState {
  userId: string | null;
  email: string | null;
  accessToken: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const SERVER_UNREACHABLE =
  "Can't reach the server. If you just connected Supabase, deploy the edge function from the Make settings page, then try again.";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ userId: string; email: string; accessToken: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore an existing session on load.
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s?.access_token && s.user) {
        setSession({ userId: s.user.id, email: s.user.email ?? "", accessToken: s.access_token });
      }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.access_token && s.user) {
        setSession({ userId: s.user.id, email: s.user.email ?? "", accessToken: s.access_token });
      } else {
        setSession(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, name: string) {
    let res: Response;
    try {
      res = await fetch(`${SERVER_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email, password, name }),
      });
    } catch (err) {
      // A network TypeError (e.g. "Failed to fetch") means the edge function is unreachable.
      console.log("Signup network error:", err);
      throw new Error(SERVER_UNREACHABLE);
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.log("Signup request failed:", body);
      throw new Error((body as any).error ?? "Sign up failed");
    }
    await signIn(email, password);
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log("Sign in error:", error.message);
      // Map network-level failures to an actionable message.
      if (/failed to fetch|network|fetch/i.test(error.message)) {
        throw new Error(SERVER_UNREACHABLE);
      }
      throw new Error(error.message);
    }
    const s = data.session;
    if (s?.access_token && s.user) {
      setSession({ userId: s.user.id, email: s.user.email ?? "", accessToken: s.access_token });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        userId: session?.userId ?? null,
        email: session?.email ?? null,
        accessToken: session?.accessToken ?? null,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
