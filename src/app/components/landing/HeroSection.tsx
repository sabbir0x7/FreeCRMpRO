import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Check, TrendingUp, Users } from 'lucide-react';

export interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const trustFeatures = [
    "Simple setup",
    "Easy to use",
    "Built for growing teams"
  ];

  return (
    <section className="py-20 lg:py-28 max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-soft text-brand text-sm font-medium">
            <Sparkles size={16} />
            <span>Smart CRM for Growing Businesses</span>
          </div>
          
          <h1 className="mt-6 font-display text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Manage Customers.<br />
            Close More Deals.<br />
            <span className="text-brand">Grow Faster.</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
            FreeCRMPro gives startups, freelancers, and growing businesses one simple place to manage leads, customers, deals, tasks, and sales activities.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-brand text-brand-foreground hover:bg-brand/90 px-7 py-3 rounded-lg text-base font-medium transition-all shadow-md hover:shadow-lg"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
            <a 
              href="#features"
              className="inline-flex items-center justify-center border border-border text-foreground hover:bg-muted px-7 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Explore Features
            </a>
          </div>
          
          <div className="mt-6 flex items-center gap-6 flex-wrap">
            {trustFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check size={16} className="text-brand" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-[600px] mx-auto lg:ml-auto"
        >
          <div className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            {/* Window title bar */}
            <div className="h-8 bg-muted/50 flex items-center gap-2 px-4 border-b border-border/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>

            {/* Content area */}
            <div className="p-5 space-y-4">
              {/* Top stat cards row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Pipeline</span>
                    <TrendingUp size={14} className="text-green-500" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-foreground">$48.5K</div>
                </div>
                
                <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Active Leads</span>
                    <Users size={14} className="text-brand" />
                  </div>
                  <div className="mt-2 text-lg font-bold text-foreground">24</div>
                </div>
                
                <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Win Rate</span>
                    <span className="text-xs font-medium text-green-500">+4%</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-green-600">68%</div>
                </div>
              </div>

              {/* Chart area */}
              <div className="bg-background rounded-lg p-4 border border-border/50 h-32 flex flex-col shadow-sm">
                <span className="text-xs text-muted-foreground font-medium mb-2">Revenue</span>
                <div className="flex-1 w-full relative">
                  <svg viewBox="0 0 300 100" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand, #6d28d9)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--brand, #6d28d9)" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d="M0,80 C30,75 60,60 90,55 C120,50 150,35 180,30 C210,25 240,20 270,15 L300,10 L300,100 L0,100 Z" fill="url(#heroChart)" />
                    <path d="M0,80 C30,75 60,60 90,55 C120,50 150,35 180,30 C210,25 240,20 270,15 L300,10" fill="none" stroke="var(--brand, #6d28d9)" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm">
                  <span className="text-xs text-muted-foreground font-medium block mb-2">Pipeline Stages</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-xs text-foreground font-medium">New Lead</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-xs text-foreground font-medium">Qualified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-xs text-foreground font-medium">Won</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm">
                  <span className="text-xs text-muted-foreground font-medium block mb-2">Recent Activity</span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0">
                        <Users size={8} className="text-brand" />
                      </div>
                      <span className="text-xs text-foreground truncate">New contact added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check size={8} className="text-green-600" />
                      </div>
                      <span className="text-xs text-foreground truncate">Deal won</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
