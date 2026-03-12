import { motion } from "framer-motion";
import { TrendingUp, Wallet, CreditCard, BarChart3 } from "lucide-react";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const categories = [
  { label: "Savings", status: "⚠ Needs work", score: 40, color: "bg-success" },
  { label: "Debt", status: "⚠ Medium", score: 55, color: "bg-accent" },
  { label: "Spending", status: "✅ Healthy", score: 70, color: "bg-primary" },
  { label: "Investing", status: "🌱 Starting", score: 25, color: "bg-primary/40" },
];

const summaryItems = [
  { label: "Net Worth", value: "$24,200", icon: TrendingUp, trend: "+$2,200" },
  { label: "Cash Available", value: "$5,200", icon: Wallet },
  { label: "Debt", value: "$3,500", icon: CreditCard },
  { label: "Investments", value: "$12,000", icon: BarChart3 },
];

const FinancialHealthSnapshot = () => {
  const score = 68;
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
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-20">{cat.label}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${cat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.score}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-28 text-right">{cat.status}</span>
            </div>
          ))}
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
