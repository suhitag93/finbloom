import { Shield, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import FinBloomIcon from "@/components/FinBloomIcon";

interface Props {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: Props) => (
  <div className="flex flex-col items-center text-center min-h-[calc(100dvh-32px)] justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mx-auto flex justify-center shadow-glow mb-8"
    >
      <FinBloomIcon size="xl" />
    </motion.div>

    <div className="space-y-3 mb-8">
      <h1 className="font-display text-2xl font-semibold text-foreground leading-tight">
        Grow into financial<br />confidence
      </h1>
      <p className="text-muted-foreground text-base leading-relaxed">
        FinBloom helps women grow wealth with personalized financial guidance, goal tracking, and smart money insights.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-8 w-full">
      {[
        { icon: Lock, label: "Bank-level encryption" },
        { icon: Eye, label: "Read-only bank access" },
        { icon: Shield, label: "Data never sold" },
      ].map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50">
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
        </div>
      ))}
    </div>

    <div className="w-full space-y-3 pb-safe">
      <Button variant="hero" size="lg" className="w-full" onClick={onNext}>
        Start Your Financial Journey 🌸
      </Button>
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 min-h-[44px]">
        Learn How We Protect Your Data
      </button>
    </div>
  </div>
);

export default WelcomeStep;
