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
    <section id="features" className="py-20 lg:py-28 bg-muted/30">
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
              className="bg-card rounded-xl border border-border/50 p-8 hover:shadow-lg hover:border-brand/20 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-soft flex items-center justify-center mb-5 group-hover:bg-brand transition-colors duration-300">
                <feature.icon className="w-[22px] h-[22px] text-brand group-hover:text-brand-foreground transition-colors duration-300" />
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
