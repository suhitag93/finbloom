import HeroSection from "@/components/landing/HeroSection";
import XPShowcaseSection from "@/components/landing/XPShowcaseSection";
import GrowthJourneySection from "@/components/landing/GrowthJourneySection";
import BadgesPreviewSection from "@/components/landing/BadgesPreviewSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <XPShowcaseSection />
      <GrowthJourneySection />
      <BadgesPreviewSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
