import { motion } from "framer-motion";
import { Target } from "lucide-react";

const goalMeta: Record<string, { name: string; emoji: string; target: number }> = {
  emergency_fund: { name: "Emergency Fund", emoji: "🛟", target: 5000 },
  pay_debt: { name: "Pay Off Debt", emoji: "💳", target: 4000 },
  start_investing: { name: "Start Investing", emoji: "📈", target: 2000 },
  buy_home: { name: "Home Down Payment", emoji: "🏠", target: 40000 },
  retirement: { name: "Retirement", emoji: "🏖️", target: 50000 },
  grow_income: { name: "Grow Income", emoji: "💰", target: 10000 },
};

interface Props {
  goals?: string[] | null;
}

const GoalTracker = ({ goals }: Props) => {
  const userGoals = (goals || ["emergency_fund", "pay_debt"]).map((g) => ({
    ...(goalMeta[g] || { name: g, emoji: "🎯", target: 5000 }),
    current: Math.round(Math.random() * 1500 + 500), // placeholder progress
  }));
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
        {userGoals.map((goal, i) => {
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
