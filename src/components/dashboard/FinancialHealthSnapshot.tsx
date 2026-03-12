import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, CreditCard, BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import { useFinancialHealthStates, type CategoryHealth } from "@/hooks/useFinancialHealthStates";

const categoryMeta = [
  { key: "savings" as const, label: "Savings", color: "bg-success" },
  { key: "debt" as const, label: "Debt", color: "bg-accent" },
  { key: "spending" as const, label: "Spending", color: "bg-primary" },
  { key: "investing" as const, label: "Investing", color: "bg-primary/40" },
];

const scoreBarMap: Record<string, number> = {
  needs_work: 20,
  room_to_grow: 40,
  starting: 50,
  being_managed: 70,
  healthy: 95,
};

const summaryItems = [
  { label: "Net Worth", value: "$24,200", icon: TrendingUp, trend: "+$2,200" },
  { label: "Cash Available", value: "$5,200", icon: Wallet },
  { label: "Debt", value: "$3,500", icon: CreditCard },
  { label: "Investments", value: "$12,000", icon: BarChart3 },
];

function StatusBadge({ health }: { health: CategoryHealth }) {
  const [open, setOpen] = useState(false);
  const isWarning = health.state === "needs_work";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`text-xs w-32 text-right cursor-help transition-colors ${
              isWarning ? "text-[#F59E0B] font-medium" : "text-muted-foreground"
            }`}
          >
            {health.icon} {health.label}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[260px] text-xs leading-relaxed"
        >
          {health.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const FinancialHealthSnapshot = () => {
  const { savings, debt, spending, investing, overallScore } = useFinancialHealthStates();

  const stateMap: Record<string, CategoryHealth> = { savings, debt, spending, investing };

  const score = overallScore;
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-5">Financial Health</h3>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Score ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <motion.circle
                cx="48" cy="48" r="44" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold text-foreground">{score}</span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="flex-1 space-y-2.5">
          {categoryMeta.map((cat) => {
            const health = stateMap[cat.key];
            const barScore = scoreBarMap[health.state];
            return (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-20">{cat.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${cat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${barScore}%` }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                <StatusBadge health={health} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {summaryItems.map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-secondary/50 text-center">
            <item.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold text-foreground">{item.value}</p>
            {item.trend && (
              <p className="text-[10px] text-primary font-medium mt-0.5">{item.trend}</p>
            )}
          </div>
        ))}
      </div>
      <FinancialDisclaimer />
    </motion.div>
  );
};

export default FinancialHealthSnapshot;
