import { motion } from "framer-motion";

const HealthScoreCard = () => {
  const score = 72;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Financial Health</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <motion.circle
              cx="48" cy="48" r="40" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-2xl font-semibold text-foreground">{score}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-primary mb-1">Good</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your financial health is improving. Focus on building your emergency fund to reach the next level.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthScoreCard;
