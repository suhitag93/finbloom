import { motion, type Easing } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as Easing },
  }),
};

const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-28 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-warm" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground leading-[1.12] mb-6"
          >
            Your money.{" "}
            <span className="text-accent italic">Finally on your side.</span>
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
          >
            finBloom helps women build financial confidence through small daily habits — no guilt, no jargon, just real progress.
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="lg" onClick={scrollToWaitlist}>
              Join the waitlist 💚
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/survey" className="gap-2">
                Take the survey <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
