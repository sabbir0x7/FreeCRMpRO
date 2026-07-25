import React from "react";

interface LandingFooterProps {
  onLogin: () => void;
}

export function LandingFooter({ onLogin }: LandingFooterProps) {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <div className="font-display font-bold text-lg text-foreground flex items-center gap-1">
              FreeCRMPro
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"></span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              A smarter way to organize customers, leads, and sales.
            </p>
          </div>
          
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <button
              onClick={onLogin}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </button>
          </nav>
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FreeCRMPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
