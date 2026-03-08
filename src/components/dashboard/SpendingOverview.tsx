import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

const categories = [
  { name: "Rent", amount: 1650, color: "bg-primary" },
  { name: "Groceries", amount: 380, color: "bg-accent" },
  { name: "Transport", amount: 120, color: "bg-success" },
  { name: "Subscriptions", amount: 85, color: "bg-destructive/60" },
  { name: "Dining", amount: 210, color: "bg-primary/40" },
  { name: "Other", amount: 155, color: "bg-muted-foreground/30" },
];

const total = categories.reduce((s, c) => s + c.amount, 0);

const SpendingOverview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">March Spending</h3>
        <Wallet className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="font-display text-3xl font-semibold text-foreground mb-1">${total.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground mb-6">$350 under budget 🎉</p>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-6">
        {categories.map((cat) => (
          <motion.div
            key={cat.name}
            className={`${cat.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${(cat.amount / total) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        ))}
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <span className="text-sm text-foreground">{cat.name}</span>
            </div>
            <span className="text-sm font-medium text-foreground">${cat.amount}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SpendingOverview;
