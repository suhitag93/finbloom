import { motion } from "framer-motion";
import { Target } from "lucide-react";

const goals = [
  { name: "Emergency Fund", current: 1200, target: 5000, emoji: "🛟" },
  { name: "Credit Card Payoff", current: 1500, target: 4000, emoji: "💳" },
  { name: "Home Down Payment", current: 10000, target: 40000, emoji: "🏠" },
];

const GoalTracker = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold text-foreground">Your Goals</h3>
        <Target className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="space-y-5">
        {goals.map((goal, i) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          return (
            <div key={goal.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{goal.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{goal.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-sage"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GoalTracker;
