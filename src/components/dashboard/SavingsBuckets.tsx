import { motion } from "framer-motion";

const buckets = [
  { name: "Emergency Fund", current: 3200, goal: 5000, emoji: "🛟" },
  { name: "Travel Fund", current: 850, goal: 2000, emoji: "✈️" },
  { name: "Moving Fund", current: 1200, goal: 4000, emoji: "🏠" },
  { name: "Career Break", current: 400, goal: 3000, emoji: "🌴" },
];

const SavingsBuckets = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-3">Savings Buckets</h3>
      <div className="space-y-3">
        {buckets.map((bucket, i) => {
          const pct = Math.round((bucket.current / bucket.goal) * 100);
          return (
            <motion.div
              key={bucket.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              className="p-4 rounded-2xl bg-card shadow-card border border-border/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{bucket.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{bucket.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${bucket.current.toLocaleString()} of ${bucket.goal.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">{pct}%</span>
              </div>
              {/* Horizontal progress bar */}
              <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-sage"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SavingsBuckets;
