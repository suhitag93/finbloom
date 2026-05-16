import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useFinancialData } from "@/hooks/useFinancialData";
import { DemoNetWorthPrompt } from "@/components/DemoConversionPrompts";

const NetWorthCard = () => {
  const { accounts } = useAccounts();
  const { totalInvestments, totalDebt } = useFinancialData();

  // Calculate net worth from real accounts
  const checking = accounts.filter((a) => a.account_type === "checking").reduce((s, a) => s + a.balance, 0);
  const savings = accounts.filter((a) => a.account_type === "savings").reduce((s, a) => s + a.balance, 0);
  const investments = totalInvestments || accounts.filter((a) => ["investment", "retirement"].includes(a.account_type)).reduce((s, a) => s + a.balance, 0);
  const debt = totalDebt || accounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0);
  const netWorth = checking + savings + investments + debt;

  const hasRealData = accounts.length > 0;

  // Fallback demo data
  const displayNetWorth = hasRealData ? netWorth : 28400;
  const displayChecking = hasRealData ? checking : 4200;
  const displaySavings = hasRealData ? savings : 12800;
  const displayInvestments = hasRealData ? investments : 11400;

  // Simple placeholder chart (could be replaced with historical data)
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const values = hasRealData
    ? months.map((_, i) => Math.round(displayNetWorth * (0.7 + (i * 0.3) / 7)))
    : [18200, 19100, 20500, 21800, 23100, 24600, 26200, 28400];
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Net Worth</h3>
        <div className="flex items-center gap-1 text-sm text-primary font-medium">
          <ArrowUpRight className="w-4 h-4" />
          {hasRealData ? "Live" : "+8.4%"}
        </div>
      </div>
      <p className="font-display text-3xl font-semibold text-foreground mb-1">
        ${displayNetWorth.toLocaleString()}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        {hasRealData ? `${accounts.length} accounts connected` : "Connect accounts for live data"}
      </p>

      {/* Simple bar chart */}
      <div className="flex items-end gap-2 h-24">
        {values.map((val, i) => (
          <motion.div
            key={months[i]}
            className="flex-1 flex flex-col items-center gap-1"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
            style={{ transformOrigin: "bottom" }}
          >
            <div
              className={`w-full rounded-t-md ${i === values.length - 1 ? "bg-gradient-sage" : "bg-primary/15"}`}
              style={{ height: `${((val - min) / (max - min)) * 80 + 12}px` }}
            />
            <span className="text-[10px] text-muted-foreground">{months[i]}</span>
          </motion.div>
        ))}
      </div>

      {/* Asset breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Checking", value: `$${displayChecking.toLocaleString()}` },
          { label: "Savings", value: `$${displaySavings.toLocaleString()}` },
          { label: "Investments", value: `$${displayInvestments.toLocaleString()}` },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <DemoNetWorthPrompt />
    </motion.div>
  );
};

export default NetWorthCard;
