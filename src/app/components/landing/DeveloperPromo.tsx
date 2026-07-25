import React from "react";
import { motion } from "motion/react";
import { Zap, Shield, Smartphone, Layers, ExternalLink, ArrowUp } from "lucide-react";
import fiverrPoster from "@/assets/images/fiverr-promo-banner.png";

// ── Edit this URL when your Fiverr profile is ready ──
const FIVERR_URL = "#fiverr-profile";

export function DeveloperPromo() {
  const benefits = [
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Quick turnaround without compromising quality",
    },
    {
      icon: Shield,
      title: "Clean & Secure Code",
      description: "Production-ready, maintainable codebase",
    },
    {
      icon: Smartphone,
      title: "Fully Responsive",
      description: "Beautiful on every device and screen size",
    },
    {
      icon: Layers,
      title: "Modern Tech Stack",
      description: "React, TypeScript, Supabase, and more",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-muted/30 border-t border-border/50">
      <motion.div
        className="max-w-7xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            Custom Development
          </p>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
            Need a Custom SaaS Like FreeCRMPro?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
            FreeCRMPro is an example of a complete SaaS solution built with modern technologies, responsive design, secure architecture, and production-ready functionality.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-12">
          {/* Left Column: Image */}
          <div className="relative group">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 blur-3xl scale-110 rounded-3xl" />
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl relative z-10">
              <img
                src={fiverrPoster.src || fiverrPoster}
                alt="AI Web Apps and SaaS MVP development services"
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
              Custom Development
            </p>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Have an Idea for Your Own SaaS?
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed mt-4">
              From idea to production, I build modern web applications and SaaS MVPs with clean architecture, responsive interfaces, secure code, and scalable technology.
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-row items-center">
                  <div className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-[18px] h-[18px] text-brand" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-foreground">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={FIVERR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                Work With Me
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="#hero"
                className="inline-flex items-center gap-2 border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Explore FreeCRMPro
                <ArrowUp className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
