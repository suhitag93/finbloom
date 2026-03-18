import HeroSection from "@/components/landing/HeroSection";
import XPShowcaseSection from "@/components/landing/XPShowcaseSection";
import GrowthJourneySection from "@/components/landing/GrowthJourneySection";
import BadgesPreviewSection from "@/components/landing/BadgesPreviewSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";
import WaitlistBanner from "@/components/WaitlistBanner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <WaitlistBanner source="landing" />
      </div>
      <XPShowcaseSection />
      <GrowthJourneySection />
      <BadgesPreviewSection />

      {/* Survey CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-8"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
                Help shape finBloom — take our 2-min survey
              </h3>
              <p className="text-muted-foreground">
                Tell us about your financial journey so we can build something that actually works for you.
              </p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/survey" className="gap-2">
                Take the Survey <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
