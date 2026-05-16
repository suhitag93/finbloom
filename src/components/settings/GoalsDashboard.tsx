import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Check } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

const GoalsDashboard = () => {
  const { goals, milestones, loading, syncGoalProgress, deleteGoal } = useGoals();

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Loading goals…</div>;
  if (goals.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-base font-semibold text-foreground">Your Goals</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {activeGoals.map((goal, i) => {
          const pct = goal.target_amount > 0 ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0;
          const goalMilestones = milestones.filter((m) => m.goal_id === goal.id);
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (pct / 100) * circumference;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-card border border-border/50 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{goal.goal_type.replace(/_/g, " ")}</p>
                </div>
                <div className="flex gap-1">
                  {goal.linked_account_id && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => syncGoalProgress(goal.id)}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Circular progress */}
              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="6" className="stroke-secondary" />
                    <motion.circle
                      cx="50" cy="50" r={radius} fill="none" strokeWidth="6"
                      className="stroke-primary" strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">${goal.current_amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">of ${goal.target_amount.toLocaleString()}</p>
                  {goal.monthly_contribution && (
                    <p className="text-xs text-primary">${goal.monthly_contribution.toLocaleString()}/mo</p>
                  )}
                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground">Target: {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                  )}
                </div>
              </div>

              {/* Milestones */}
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((m) => {
                  const reached = goalMilestones.some((gm) => gm.milestone_pct === m);
                  return (
                    <div key={m} className={`flex-1 h-6 rounded-lg flex items-center justify-center text-[10px] font-medium ${reached ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground"}`}>
                      {reached ? <Check className="w-3 h-3" /> : `${m}%`}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
          {completedGoals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <span className="text-sm font-medium text-foreground">{goal.title}</span>
              </div>
              <span className="text-xs text-primary font-medium">${goal.target_amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsDashboard;
