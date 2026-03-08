import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  level: number;
  data: OnboardingData;
  onComplete?: () => void;
}

const levels = [
  { title: "Seed", emoji: "🌱", tagline: "Your first mission: Build a $1,000 emergency fund", color: "bg-secondary" },
  { title: "Sprout", emoji: "🌿", tagline: "Keep growing! Build your emergency fund to 1 month of expenses", color: "bg-secondary" },
  { title: "Bloom", emoji: "🌸", tagline: "You're blossoming! Time to strengthen your investment strategy", color: "bg-lavender-light" },
  { title: "Thrive", emoji: "🌳", tagline: "You're thriving! Let's optimize your path to financial independence", color: "bg-gold-light" },
];

const GamifiedWelcomeStep = ({ level, data, onComplete }: Props) => {
  const navigate = useNavigate();
  const info = levels[level];

  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="text-7xl"
      >
        {info.emoji}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Your starting level</p>
        <h1 className="font-display text-4xl font-bold text-foreground">
          {info.emoji} {info.title} Investor
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">{info.tagline}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`p-5 rounded-2xl ${info.color} border border-border/30`}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground mb-1">Bloom Guide says</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "Welcome to FinBloom! I'll be your financial guide. Based on your profile, I've created a personalized growth roadmap just for you. Let's start growing together! 🌸"
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button variant="hero" size="lg" className="w-full text-base" onClick={() => navigate("/dashboard")}>
          Enter Your Financial Garden 🌿
        </Button>
      </motion.div>
    </div>
  );
};

export default GamifiedWelcomeStep;
