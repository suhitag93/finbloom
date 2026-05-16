import { motion } from "framer-motion";
import { Sprout, RefreshCw } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";

interface Props {
  goals?: string[] | null;
}

const GoalTracker = ({ goals: profileGoals }: Props) => {
  const { goals, milestones, loading, syncGoalProgress } = useGoals();

  const activeGoals = goals.filter((g) => g.status === "active");

  if (loading) return null;

  // If no DB goals, show fallback with profile goals
  if (activeGoals.length === 0) {
    const fallbackGoals = (profileGoals || ["emergency_fund"]).map((g) => ({
      name: g.replace(/_/g, " "),
      emoji: g === "emergency_fund" ? "🌱" : g === "pay_debt" ? "🪴" : "🌻",
    }));

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-full">
        <div className="flex items-center gap-2 mb-5">
          <Sprout className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Your Growth Garden</h3>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
          <p className="text-muted-foreground text-sm">Set up AI-coached goals in Settings → Goals to see your growth garden here!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="col-span-full">
      <div className="flex items-center gap-2 mb-5">
        <Sprout className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Your Growth Garden</h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeGoals.map((goal, i) => {
          const pct = goal.target_amount > 0 ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0;
          const growthStage = pct < 25 ? "Seed" : pct < 50 ? "Sprout" : pct < 75 ? "Growing" : "Blooming";
          const goalMilestones = milestones.filter((m) => m.goal_id === goal.id);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group relative p-5 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-soft transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500" />

              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                  <p className="text-[11px] text-muted-foreground italic capitalize">{goal.goal_type.replace(/_/g, " ")}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {growthStage}
                  </span>
                  {goal.linked_account_id && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => syncGoalProgress(goal.id)}>
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-20 w-full rounded-xl bg-secondary/40 overflow-hidden border border-border/30 mb-3">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-primary/80 to-primary/40"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 5)}%` }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.12, ease: "easeOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground drop-shadow-sm">{pct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-foreground">${goal.current_amount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">of ${goal.target_amount.toLocaleString()}</span>
              </div>

              {/* Milestone dots */}
              <div className="flex gap-1">
                {[25, 50, 75, 100].map((m) => {
                  const reached = goalMilestones.some((gm) => gm.milestone_pct === m);
                  return (
                    <div key={m} className={`h-1.5 rounded-full flex-1 ${reached ? "bg-primary" : pct >= m ? "bg-primary/40" : "bg-secondary"}`} />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GoalTracker;
