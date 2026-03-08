import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

const goalMeta: Record<string, { name: string; emoji: string; target: number; gardenLabel: string; color: string }> = {
  emergency_fund: { name: "Emergency Fund", emoji: "🌱", target: 5000, gardenLabel: "Safety Garden", color: "from-[hsl(var(--sage))] to-[hsl(var(--sage-dark))]" },
  pay_debt: { name: "Debt Freedom", emoji: "🪴", target: 4000, gardenLabel: "Freedom Patch", color: "from-[hsl(var(--primary))] to-[hsl(var(--sage-dark))]" },
  save_for_vacation: { name: "Travel Fund", emoji: "🌴", target: 2000, gardenLabel: "Wanderlust Grove", color: "from-[hsl(145,40%,55%)] to-[hsl(160,45%,40%)]" },
  start_investing: { name: "Investment Seed", emoji: "🌻", target: 2000, gardenLabel: "Growth Plot", color: "from-[hsl(var(--gold))] to-[hsl(var(--gold-dark,40,80%,45%))]" },
  buy_home: { name: "Home Fund", emoji: "🏡", target: 40000, gardenLabel: "Nesting Meadow", color: "from-[hsl(var(--lavender))] to-[hsl(var(--lavender-dark,260,40%,55%))]" },
  retirement: { name: "Retirement", emoji: "🌳", target: 50000, gardenLabel: "Legacy Forest", color: "from-[hsl(var(--sage-dark))] to-[hsl(150,30%,30%)]" },
  grow_income: { name: "Income Growth", emoji: "🌾", target: 10000, gardenLabel: "Harvest Field", color: "from-[hsl(var(--gold))] to-[hsl(35,70%,45%)]" },
};

interface Props {
  goals?: string[] | null;
}

const GoalTracker = ({ goals }: Props) => {
  const userGoals = (goals || ["emergency_fund", "pay_debt"]).map((g) => ({
    ...(goalMeta[g] || { name: g, emoji: "🎯", target: 5000, gardenLabel: "My Goal", color: "from-[hsl(var(--primary))] to-[hsl(var(--sage-dark))]" }),
    current: Math.round(Math.random() * 1500 + 500),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="col-span-full"
    >
      <div className="flex items-center gap-2 mb-5">
        <Sprout className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Your Growth Garden</h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {userGoals.map((goal, i) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          const growthStage = pct < 25 ? "Seed" : pct < 50 ? "Sprout" : pct < 75 ? "Growing" : "Blooming";
          return (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group relative p-5 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-soft transition-all duration-300 overflow-hidden"
            >
              {/* Background glow */}
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${goal.color} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500`} />

              {/* Header */}
              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <motion.span
                    className="text-3xl block mb-1"
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 + i * 0.1 }}
                  >
                    {goal.emoji}
                  </motion.span>
                  <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                  <p className="text-[11px] text-muted-foreground italic">{goal.gardenLabel}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {growthStage}
                </span>
              </div>

              {/* Garden bucket fill */}
              <div className="relative h-20 w-full rounded-xl bg-secondary/40 overflow-hidden border border-border/30 mb-3">
                {/* Soil/base layer */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[hsl(var(--sage-dark))]/20 rounded-b-xl" />
                {/* Fill */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t ${goal.color} opacity-80`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 5)}%` }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.12, ease: "easeOut" }}
                />
                {/* Water ripple effect */}
                <motion.div
                  className={`absolute left-0 right-0 h-1 bg-white/20 rounded-full`}
                  initial={{ bottom: 0 }}
                  animate={{ bottom: `${Math.max(pct - 2, 3)}%` }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.12, ease: "easeOut" }}
                />
                {/* Center percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground drop-shadow-sm">{pct}%</span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  ${goal.current.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  of ${goal.target.toLocaleString()}
                </span>
              </div>

              {/* Growth dots */}
              <div className="flex gap-1 mt-3">
                {[0, 1, 2, 3].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`h-1.5 rounded-full flex-1 ${dot < Math.ceil(pct / 25) ? `bg-gradient-to-r ${goal.color}` : "bg-secondary"}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.1 + dot * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GoalTracker;
