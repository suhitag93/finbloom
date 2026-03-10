import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";

const CATEGORY_COLORS: Record<string, string> = {
  FOOD_AND_DRINK: "bg-accent",
  TRANSPORTATION: "bg-success",
  RENT_AND_UTILITIES: "bg-primary",
  ENTERTAINMENT: "bg-primary/40",
  GENERAL_MERCHANDISE: "bg-destructive/60",
  TRANSFER_OUT: "bg-muted-foreground/30",
  other: "bg-muted-foreground/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DRINK: "Food & Drink",
  TRANSPORTATION: "Transport",
  RENT_AND_UTILITIES: "Rent & Utilities",
  ENTERTAINMENT: "Entertainment",
  GENERAL_MERCHANDISE: "Shopping",
  TRANSFER_OUT: "Transfers",
};

const SpendingOverview = () => {
  const { spendingByCategory, totalSpending, loading } = useFinancialData();

  // Build categories sorted by amount
  const categories = Object.entries(spendingByCategory)
    .map(([name, amount]) => ({
      name: CATEGORY_LABELS[name] || name.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      amount,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const total = totalSpending || categories.reduce((s, c) => s + c.amount, 0);

  // Fallback to demo data if no transactions
  const displayCategories = categories.length > 0 ? categories : [
    { name: "Rent", amount: 1650, color: "bg-primary" },
    { name: "Groceries", amount: 380, color: "bg-accent" },
    { name: "Transport", amount: 120, color: "bg-success" },
    { name: "Subscriptions", amount: 85, color: "bg-destructive/60" },
    { name: "Dining", amount: 210, color: "bg-primary/40" },
    { name: "Other", amount: 155, color: "bg-muted-foreground/30" },
  ];

  const displayTotal = total > 0 ? total : displayCategories.reduce((s, c) => s + c.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {new Date().toLocaleString("default", { month: "long" })} Spending
        </h3>
        <Wallet className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="font-display text-3xl font-semibold text-foreground mb-1">${displayTotal.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground mb-6">
        {categories.length > 0 ? `${categories.length} categories tracked` : "Connect accounts to see real data"}
      </p>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-6">
        {displayCategories.map((cat) => (
          <motion.div
            key={cat.name}
            className={`${cat.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${(cat.amount / displayTotal) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        ))}
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {displayCategories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <span className="text-sm text-foreground">{cat.name}</span>
            </div>
            <span className="text-sm font-medium text-foreground">${cat.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SpendingOverview;
