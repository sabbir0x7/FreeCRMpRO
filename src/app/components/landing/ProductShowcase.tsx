import React from "react";
import {
  Users,
  Briefcase,
  DollarSign,
  CheckSquare,
  LayoutDashboard,
  Columns3,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";

const pipelineStages = [
  { name: "New Lead", count: 5, color: "bg-blue-500" },
  { name: "Contacted", count: 8, color: "bg-purple-500" },
  { name: "Qualified", count: 4, color: "bg-amber-500" },
  { name: "Proposal", count: 3, color: "bg-orange-500" },
  { name: "Won", count: 6, color: "bg-emerald-500" },
];

const highlights = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description: "Real-time overview of your business",
  },
  {
    icon: Columns3,
    title: "Visual Pipeline",
    description: "Drag-and-drop deal management",
  },
  {
    icon: Users,
    title: "Contact Hub",
    description: "Complete customer profiles",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Data-driven insights",
  },
];

export const ProductShowcase: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-center">
          Your entire sales workflow in one place.
        </h2>
        <p className="text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
          From first contact to closed deal, FreeCRMPro keeps everything organized
          so you can focus on what matters — growing your business.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <div className="glass-surface rounded-[24px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-xl">
            {/* Window bar */}
            <div className="h-12 bg-white/5 dark:bg-black/10 flex items-center px-4 gap-2 border-b border-white/10 dark:border-white/5 relative">
              <div className="flex gap-2 absolute left-4">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
              </div>
              <div className="w-full text-center text-xs text-muted-foreground font-medium">
                FreeCRMPro Dashboard
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-4 sm:p-6 bg-transparent">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Total Contacts
                    </span>
                    <Users className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <div className="text-xl font-bold text-foreground">156</div>
                </div>
                <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Active Deals
                    </span>
                    <Briefcase className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <div className="text-xl font-bold text-foreground">23</div>
                </div>
                <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Pipeline Value
                    </span>
                    <DollarSign className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <div className="text-xl font-bold text-foreground">$128.5K</div>
                </div>
                <div className="glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Tasks Due
                    </span>
                    <CheckSquare className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <div className="text-xl font-bold text-foreground">8</div>
                </div>
              </div>

              {/* Charts & Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-2 glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 h-52 flex flex-col shadow-sm">
                  <div className="text-sm font-semibold text-foreground mb-4">
                    Revenue Overview
                  </div>
                  <div className="flex-1 w-full relative">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 40"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0,40 L0,30 C15,35 25,20 40,25 C55,30 65,10 80,15 C90,18 95,5 100,5 L100,40 Z"
                        fill="var(--brand-soft)"
                        className="opacity-50"
                      />
                      <path
                        d="M0,30 C15,35 25,20 40,25 C55,30 65,10 80,15 C90,18 95,5 100,5"
                        fill="none"
                        stroke="var(--brand)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>

                <div className="md:col-span-1 glass-surface rounded-xl border border-white/10 dark:border-white/5 p-4 h-52 flex flex-col shadow-sm">
                  <div className="text-sm font-semibold text-foreground mb-4">
                    Pipeline
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    {pipelineStages.map((stage, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                          <span className="text-sm text-foreground">
                            {stage.name}
                          </span>
                        </div>
                        <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {stage.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Below Mockup */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          {highlights.map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110 shadow-sm">
                <item.icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-sm font-medium text-foreground">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
