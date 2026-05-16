import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  { label: "Spending balance", key: "spending" },
  { label: "Emergency savings", key: "savings" },
  { label: "Debt health", key: "debt" },
  { label: "Investing", key: "investing" },
];

function computeScores(data: OnboardingData) {
  const accts = data.financialAccounts;
  const conf = data.financialConfidence;

  const spending = conf === "advanced" ? 85 : conf === "intermediate" ? 70 : 55;
  const savings = accts.includes("savings") ? (conf === "advanced" ? 80 : 55) : 25;
  const debt = accts.includes("credit_cards") || accts.includes("student_loans") ? 50 : 80;
  const investing = accts.some((a) => ["401k", "roth_ira", "brokerage", "crypto"].includes(a)) ? 65 : 20;

  return { spending, savings, debt, investing, total: Math.round((spending + savings + debt + investing) / 4) };
}

const HealthScoreStep = ({ data, onNext, onBack }: Props) => {
  const scores = computeScores(data);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimatedScore(Math.round(progress * scores.total));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [scores.total]);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Your FinBloom Score</h2>
          <p className="text-sm text-muted-foreground mt-1">Here's a snapshot of your financial health.</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-center py-4">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold text-foreground">{animatedScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const score = scores[cat.key as keyof typeof scores] as number;
            return (
              <div key={cat.key} className="flex items-center gap-4">
                <span className="text-sm text-foreground w-40">{cat.label}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-sage"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-8 text-right">{score}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 pb-safe">
        <Button variant="hero" size="lg" className="w-full" onClick={onNext}>
          Set Your Goals
        </Button>
      </div>
    </div>
  );
};

export default HealthScoreStep;
