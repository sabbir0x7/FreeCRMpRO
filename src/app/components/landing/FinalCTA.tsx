import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface FinalCTAProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function FinalCTA({ onGetStarted, onLogin }: FinalCTAProps) {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand/5 blur-3xl -z-10 pointer-events-none" />
      
      <motion.div
        className="max-w-4xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
          Ready to simplify your customer management?
        </h2>
        
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          Start using FreeCRMPro and keep your leads, customers, and sales workflow organized — all in one place.
        </p>
        
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand/80 text-brand-foreground px-8 py-3.5 rounded-xl text-base font-medium transition-all shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:scale-105 hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] border-none"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onLogin}
            className="glass-surface inline-flex items-center justify-center border border-white/20 dark:border-white/10 text-foreground hover:bg-white/50 dark:hover:bg-white/10 px-8 py-3.5 rounded-xl text-base font-medium transition-all shadow-sm hover:scale-105"
          >
            Log In
          </button>
        </div>
        
        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required
        </p>
      </motion.div>
    </section>
  );
}
