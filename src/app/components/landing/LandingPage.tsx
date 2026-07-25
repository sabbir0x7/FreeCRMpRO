import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { ValueSection } from "./ValueSection";
import { FeaturesSection } from "./FeaturesSection";
import { ProductShowcase } from "./ProductShowcase";
import { DeveloperPromo } from "./DeveloperPromo";
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
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <main>
        <HeroSection onGetStarted={onGetStarted} />
        <ValueSection />
        <FeaturesSection />
        <ProductShowcase />
        <DeveloperPromo />
        <FinalCTA onGetStarted={onGetStarted} onLogin={onLogin} />
      </main>
      <LandingFooter onLogin={onLogin} />
    </div>
  );
}
