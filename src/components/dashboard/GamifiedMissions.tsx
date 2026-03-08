import { motion } from "framer-motion";
import { Zap, CheckCircle2, Circle } from "lucide-react";
import { useXP } from "@/hooks/useXP";

const missions = [
  { title: "Build $1,000 emergency fund", xp: 200, progress: 64, category: "saving" },
  { title: "Reduce subscriptions to under $50", xp: 100, progress: 30, category: "saving" },
  { title: "Save $200 this month", xp: 150, progress: 85, category: "saving" },
  { title: "Track spending for 7 days", xp: 75, progress: 100, category: "engagement" },
  { title: "Increase savings rate by 3%", xp: 120, progress: 15, category: "saving" },
];

const GamifiedMissions = () => {
  const { currentLevel } = useXP();
  const activeMissions = missions.filter((m) => m.progress < 100);
  const totalAvailableXP = activeMissions.reduce((sum, m) => sum + m.xp, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg font-semibold text-foreground">Active Missions</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-accent">
          <Zap className="w-3.5 h-3.5" />
          {totalAvailableXP} XP available
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">
        {currentLevel.title}-level missions • Complete to earn XP and level up
      </p>

      <div className="space-y-3">
        {missions.map((mission, i) => {
          const done = mission.progress >= 100;
          return (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                done
                  ? "bg-primary/5 border-primary/20"
                  : "bg-secondary/30 border-border/50 hover:border-primary/30"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${done ? "text-primary line-through" : "text-foreground"}`}>
                  {mission.title}
                </p>
                {!done && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-sage transition-all"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{mission.progress}%</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-accent whitespace-nowrap">+{mission.xp} XP</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GamifiedMissions;
