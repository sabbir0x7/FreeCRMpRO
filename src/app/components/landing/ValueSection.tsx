import React from "react";
import { Target, Users, TrendingUp, CheckSquare, BarChart3 } from "lucide-react";

const valueItems = [
  {
    icon: Target,
    title: "Lead Management",
    description: "Capture and qualify leads",
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Organize customer data",
  },
  {
    icon: TrendingUp,
    title: "Sales Pipeline",
    description: "Track deal progress",
  },
  {
    icon: CheckSquare,
    title: "Task Tracking",
    description: "Stay on top of follow-ups",
  },
  {
    icon: BarChart3,
    title: "Customer Insights",
    description: "AI-powered analytics",
  },
];

export const ValueSection: React.FC = () => {
  return (
    <section id="solutions" className="py-20 border-t border-white/10 dark:border-white/5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground text-center">
          Everything you need to manage customer relationships.
        </h2>
        <p className="text-muted-foreground text-center mt-3 text-base">
          One platform to capture leads, close deals, and grow your business.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-14">
          {valueItems.map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm">
                <item.icon className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-medium text-foreground text-sm">
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
