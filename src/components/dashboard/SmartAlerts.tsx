import { motion } from "framer-motion";
import { AlertTriangle, CreditCard, ShoppingBag, RefreshCw } from "lucide-react";

const alerts = [
  {
    icon: CreditCard,
    message: "Credit card utilization hit 38% this month.",
    type: "warning" as const,
  },
  {
    icon: ShoppingBag,
    message: "Unusual spending: $280 at electronics store.",
    type: "info" as const,
  },
  {
    icon: RefreshCw,
    message: "Netflix renewal ($15.99) coming up on Mar 15.",
    type: "info" as const,
  },
];

const SmartAlerts = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-success" />
        <h3 className="font-display text-lg font-semibold text-foreground">Smart Alerts</h3>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.45 + i * 0.08 }}
            className={`flex items-start gap-3 p-3 rounded-xl ${
              alert.type === "warning"
                ? "bg-success/10 border border-success/20"
                : "bg-secondary/40 border border-border/30"
            }`}
          >
            <alert.icon className={`w-4 h-4 mt-0.5 shrink-0 ${
              alert.type === "warning" ? "text-success" : "text-muted-foreground"
            }`} />
            <p className="text-sm text-foreground">{alert.message}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SmartAlerts;
