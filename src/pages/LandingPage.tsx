import HeroSection from "@/components/landing/HeroSection";
import XPShowcaseSection from "@/components/landing/XPShowcaseSection";
import GrowthJourneySection from "@/components/landing/GrowthJourneySection";
import BadgesPreviewSection from "@/components/landing/BadgesPreviewSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <XPShowcaseSection />
      <GrowthJourneySection />
      <BadgesPreviewSection />
      <CTASection />

      {/* Demoted waitlist — text link style */}
      <section className="py-8 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Want early access instead?{" "}
          <Link to="/auth" className="underline underline-offset-2 hover:text-primary transition-colors">
            Join the waitlist
          </Link>
        </p>
      </section>
      <FooterSection />
    </div>
  );
};

export default LandingPage;
