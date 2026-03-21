import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProblems } from "@/components/landing/LandingProblems";
import { LandingPromise } from "@/components/landing/LandingPromise";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingDifferentials } from "@/components/landing/LandingDifferentials";
import { LandingDemo } from "@/components/landing/LandingDemo";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingSocial } from "@/components/landing/LandingSocial";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTAFinal } from "@/components/landing/LandingCTAFinal";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <LandingHero />
      <LandingProblems />
      <LandingPromise />
      <LandingFeatures />
      <LandingDifferentials />
      <LandingDemo />
      <LandingPricing />
      <LandingSocial />
      <LandingFAQ />
      <LandingCTAFinal />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
