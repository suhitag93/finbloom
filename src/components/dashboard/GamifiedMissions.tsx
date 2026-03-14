import { motion } from "framer-motion";
import { Zap, CheckCircle2, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useXP } from "@/hooks/useXP";
import { useMissions } from "@/hooks/useMissions";

const GamifiedMissions = () => {
  const { currentLevel } = useXP();
  const { missions, activeMissions, loading } = useMissions();
  const totalAvailableXP = activeMissions.reduce((sum, m) => sum + m.xp_reward, 0);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-card shadow-card border border-border/50 animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-secondary/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
          const done = mission.completed;
          return (
            <motion.div
              key={mission.id}
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
                {!done && mission.progress > 0 && (
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
              <span className="text-xs font-medium text-accent whitespace-nowrap">+{mission.xp_reward} XP</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GamifiedMissions;
