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
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Savings Buckets</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buckets.map((bucket, i) => {
          const pct = Math.round((bucket.current / bucket.goal) * 100);
          return (
            <motion.div
              key={bucket.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              className="p-5 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-soft transition-shadow duration-300"
            >
              <div className="text-2xl mb-3">{bucket.emoji}</div>
              <p className="text-sm font-medium text-foreground mb-1">{bucket.name}</p>
              <p className="text-xs text-muted-foreground mb-3">
                ${bucket.current.toLocaleString()} of ${bucket.goal.toLocaleString()}
              </p>
              {/* Bucket fill visualization */}
              <div className="relative h-16 w-full rounded-xl bg-secondary/50 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-xl bg-gradient-sage"
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">{pct}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SavingsBuckets;
