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
    <section id="pricing" className="py-20 lg:py-28 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-soft text-brand text-sm font-medium mb-6">
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
                  ? "bg-card border-brand shadow-xl shadow-brand/10 scale-[1.02]"
                  : "bg-card border-border/50 shadow-sm hover:shadow-md hover:border-border"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-brand text-brand-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlighted
                      ? "bg-brand text-brand-foreground"
                      : "bg-brand-soft text-brand"
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
                className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "bg-brand text-brand-foreground hover:bg-brand/90 shadow-md hover:shadow-lg"
                    : "border border-border text-foreground hover:bg-muted"
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
