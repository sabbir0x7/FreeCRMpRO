import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { ValueSection } from "./ValueSection";
import { FeaturesSection } from "./FeaturesSection";
import { ProductShowcase } from "./ProductShowcase";
import { DeveloperPromo } from "./DeveloperPromo";
import { PricingSection } from "./PricingSection";
import { FinalCTA } from "./FinalCTA";
import { LandingFooter } from "./LandingFooter";

export function LandingPage({
  onGetStarted,
  onLogin,
}: {
  onGetStarted: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="min-h-screen text-foreground selection:bg-brand/30">
      <LandingNavbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <main>
        <HeroSection onGetStarted={onGetStarted} />
        <ValueSection />
        <div id="features"><FeaturesSection /></div>
        <div id="how-it-works"><ProductShowcase /></div>
        <DeveloperPromo />
        <div id="pricing"><PricingSection onGetStarted={onGetStarted} /></div>
        <FinalCTA onGetStarted={onGetStarted} onLogin={onLogin} />
      </main>
      <LandingFooter onLogin={onLogin} />
    </div>
  );
}
