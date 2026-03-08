import { motion } from "framer-motion";
import { useXP } from "@/hooks/useXP";
import { LEVELS } from "@/lib/xp-system";
import { Lock, Check } from "lucide-react";

const LevelProgressionMap = () => {
  const { currentLevel, totalXP } = useXP();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">Growth Journey</h3>
      <p className="text-[11px] text-muted-foreground mb-5">Your path from Seed to Legacy</p>

      <div className="space-y-3">
        {LEVELS.map((level, i) => {
          const reached = totalXP >= level.xpRequired;
          const isCurrent = level.id === currentLevel.id;

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isCurrent
                  ? "bg-primary/8 border-primary/30 ring-1 ring-primary/20"
                  : reached
                  ? "bg-secondary/30 border-primary/10"
                  : "bg-muted/20 border-border/30"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                  reached ? "" : "grayscale opacity-50"
                }`}
              >
                {level.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                    {level.title}
                  </p>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{level.focus}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {reached ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground">{level.xpRequired.toLocaleString()} XP</span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LevelProgressionMap;
