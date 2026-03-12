import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const MonthlyReport = () => {
  const income = 6200;
  const spent = 4800;
  const saved = income - spent;
  const savingsRate = Math.round((saved / income) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-5">March Report</h3>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <p className="font-display text-xl font-semibold text-foreground">${income.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs text-muted-foreground">Spent</span>
          </div>
          <p className="font-display text-xl font-semibold text-foreground">${spent.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <PiggyBank className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-muted-foreground">Saved</span>
          </div>
          <p className="font-display text-xl font-semibold text-primary">${saved.toLocaleString()}</p>
        </div>
      </div>

      {/* Savings rate gauge */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
        <p className="text-xs text-muted-foreground mb-1">Savings Rate</p>
        <p className="font-display text-3xl font-bold text-primary">{savingsRate}%</p>
        <p className="text-xs text-muted-foreground mt-1">Above the 20% recommended target 🎉</p>
      </div>
      <FinancialDisclaimer />
    </motion.div>
  );
};

export default MonthlyReport;
