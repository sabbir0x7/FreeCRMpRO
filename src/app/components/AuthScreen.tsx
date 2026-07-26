import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../auth";
import { Logo } from "./ui/Logo";

export function AuthScreen({ onBack }: { onBack?: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") await signUp(email, password, name);
      else await signIn(email, password);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="glass-modal relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/20 p-8 shadow-2xl dark:border-white/10 animate-in zoom-in-95 fade-in duration-500 ease-out">
        <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-40 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative z-10">
          {onBack && (
            <div className="absolute -top-4 -left-4">
              <Logo 
                onClick={onBack}
                className="rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-md p-2 hover:bg-white/30 border border-white/20 shadow-sm transition-all scale-75 origin-top-left" 
              />
            </div>
          )}
          <Logo 
            className="justify-center mb-8" 
            iconClassName="h-10 w-10" 
            textClassName="text-2xl" 
          />

          <h1 className="mb-1 text-2xl font-semibold text-foreground tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your workspace." : "Start managing your leads in minutes."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="glass-input" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="glass-input" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="glass-input" />
            </div>

            {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

            <Button type="submit" className="w-full shadow-lg" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              className="font-medium text-[var(--brand)] hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
