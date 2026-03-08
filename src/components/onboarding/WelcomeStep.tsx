import { Sprout, Shield, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: Props) => (
  <div className="text-center space-y-8">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-20 h-20 rounded-2xl bg-gradient-sage mx-auto flex items-center justify-center shadow-glow"
    >
      <Sprout className="w-10 h-10 text-primary-foreground" />
    </motion.div>

    <div className="space-y-3">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
        Grow into financial<br />confidence
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
        FinBloom helps women grow wealth with personalized financial guidance, goal tracking, and smart money insights.
      </p>
    </div>

    <div className="space-y-3">
      <Button variant="hero" size="lg" className="w-full text-base" onClick={onNext}>
        Start Your Financial Journey 🌸
      </Button>
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
        Learn How We Protect Your Data
      </button>
    </div>

    <div className="grid grid-cols-3 gap-4 pt-4">
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
  </div>
);

export default WelcomeStep;
