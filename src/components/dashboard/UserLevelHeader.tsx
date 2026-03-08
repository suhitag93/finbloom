import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";

const UserLevelHeader = () => {
  const xp = 420;
  const xpMax = 1000;
  const pct = Math.round((xp / xpMax) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-1">
            Welcome back, Sarah 🌸
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              🌿 Sprout
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-destructive" />
              12-day streak
            </span>
            <span className="text-border">•</span>
            <span>Personality: Planner 📋</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
          <Zap className="w-3.5 h-3.5" />
          {xp} XP
        </div>
      </div>

      {/* XP progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-bloom"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          {xp} / {xpMax} XP → Bloom 🌸
        </span>
      </div>
    </motion.div>
  );
};

export default UserLevelHeader;
