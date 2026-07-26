import React from "react";
import { motion } from "motion/react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

interface PricingSectionProps {
  onGetStarted: () => void;
}

const plans = [
  {
    name: "Free Trial",
    icon: Zap,
    price: "$0",
    period: "14 days",
    description: "Try everything free for 14 days. No credit card required.",
    features: [
      "Up to 100 contacts",
      "Basic pipeline management",
      "Task & activity tracking",
      "Email integration",
      "Community support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Monthly",
    icon: Sparkles,
    price: "$25",
    period: "/month",
    description: "Full access with flexible monthly billing.",
    features: [
      "Unlimited contacts & deals",
      "AI lead scoring & deal probability",
      "AI-drafted emails & call summaries",
      "Full dashboard & analytics",
      "Campaign management",
      "Priority support",
    ],
    cta: "Get Started",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Yearly",
    icon: Crown,
    price: "$200",
    period: "/year",
    description: "Best value — save $100 compared to monthly.",
    features: [
      "Everything in Monthly",
      "Save $100 per year",
      "Advanced insights & reports",
      "Custom properties & forms",
      "Document management",
      "Dedicated support",
    ],
    cta: "Get Started",
    highlighted: false,
    badge: "Save $100",
  },
];

export const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  return (
    <section id="pricing" className="py-20 lg:py-28 border-t border-white/10 dark:border-white/5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-medium mb-6 shadow-sm">
            <Sparkles size={16} />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
            One plan. Everything included.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-14">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl border p-6 lg:p-8 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "glass-surface border-brand/50 shadow-2xl shadow-brand/20 scale-[1.02] bg-brand/5 backdrop-blur-xl"
                  : "glass-surface border-white/20 dark:border-white/10 shadow-lg backdrop-blur-md hover:shadow-xl hover:-translate-y-1 hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-brand to-brand/80 text-brand-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(109,40,217,0.4)]">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.highlighted
                      ? "bg-gradient-to-br from-brand to-brand/80 text-brand-foreground shadow-md"
                      : "bg-brand/10 border border-brand/20 text-brand shadow-sm"
                  }`}
                >
                  <plan.icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {plan.name}
                </h3>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-display font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-brand" : "text-green-500"
                      }`}
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onGetStarted}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-brand to-brand/80 text-brand-foreground shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] border-none"
                    : "glass-surface border border-white/20 dark:border-white/10 text-foreground hover:bg-white/50 dark:hover:bg-white/10 shadow-sm hover:scale-[1.02]"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
};
