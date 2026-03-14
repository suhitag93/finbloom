import { motion } from "framer-motion";
import { Flame, Zap, TrendingUp } from "lucide-react";
import { useXP } from "@/hooks/useXP";

const UserLevelHeader = ({ firstName }: { firstName: string }) => {
  const { totalXP, currentLevel, nextLevel, progress, streakDays, multiplier } = useXP();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground mb-1">
            Welcome back, {firstName} {currentLevel.emoji}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-xs flex-wrap">
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              {currentLevel.emoji} {currentLevel.title}
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1">
              <Flame className="w-3 h-3 text-destructive" />
              {streakDays}-day streak
            </span>
            {multiplier > 1 && (
              <>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1 text-success font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {multiplier}x XP
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium shrink-0">
          <Zap className="w-3 h-3" />
          {totalXP.toLocaleString()} XP
        </div>
      </div>

      {/* XP progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-bloom"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
          {nextLevel
            ? `${totalXP.toLocaleString()} / ${nextLevel.xpRequired.toLocaleString()} XP`
            : `Max Level! 👑`}
        </span>
      </div>
    </motion.div>
  );
};

export default UserLevelHeader;
