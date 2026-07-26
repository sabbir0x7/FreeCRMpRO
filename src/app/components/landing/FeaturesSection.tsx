import React from "react";
import { Target, Users, Kanban, ListChecks } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Target,
    title: "Lead Management",
    description:
      "Capture, organize, and manage potential customers from one workspace. Score leads with AI and focus on high-value opportunities.",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Keep important customer information organized and accessible. Track every interaction, note, and touchpoint in one timeline.",
  },
  {
    icon: Kanban,
    title: "Sales Pipeline",
    description:
      "Track opportunities through every stage of your sales process. Drag-and-drop deals across your customizable pipeline board.",
  },
  {
    icon: ListChecks,
    title: "Tasks & Follow-ups",
    description:
      "Stay on top of important conversations and customer follow-ups. Assign tasks, set priorities, and never miss a deadline.",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-center">
          One CRM. Everything organized.
        </h2>
        <p className="text-muted-foreground text-center mt-4 max-w-2xl mx-auto text-base leading-relaxed">
          Stop managing customers across spreadsheets, notes, and disconnected
          tools. FreeCRMPro brings your customer relationships and sales workflow
          into one organized workspace.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-14">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-surface rounded-2xl border border-white/20 dark:border-white/10 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-white/50 dark:hover:bg-white/10 group backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="w-6 h-6 text-brand-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
