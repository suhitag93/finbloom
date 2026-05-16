import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useXP } from "@/hooks/useXP";
import type { Badge } from "@/hooks/useXP";
import { useState } from "react";

const categoryLabels: Record<string, string> = {
  savings: "Savings",
  debt: "Debt",
  investing: "Investing",
  milestones: "Milestones",
  engagement: "Engagement",
};

const AchievementsBadges = () => {
  const { earnedBadges } = useXP();
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...Object.keys(categoryLabels)];
  const filtered = filter === "all" ? earnedBadges : earnedBadges.filter((b) => b.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-4 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg font-semibold text-foreground">Achievements</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-accent">
          <Sparkles className="w-3.5 h-3.5" />
          {earnedBadges.length} earned
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Badge list – single column on mobile */}
      <div className="space-y-2">
        {filtered.map((badge, i) => (
          <BadgeCard key={badge.id} badge={badge} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

const BadgeCard = ({ badge, index }: { badge: Badge; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: 0.05 * index }}
      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        badge.earned
          ? "bg-secondary/50 border-primary/20"
          : "bg-muted/30 border-border/30 opacity-60"
      }`}
    >
      <span className={`text-2xl shrink-0 ${!badge.earned ? "grayscale" : ""}`}>{badge.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">{badge.title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{badge.description}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!badge.earned && <Lock className="w-3 h-3 text-muted-foreground/50" />}
        <span className="text-xs font-medium text-accent">+{badge.xpBonus} XP</span>
      </div>
    </motion.div>
  );
};

export default AchievementsBadges;
