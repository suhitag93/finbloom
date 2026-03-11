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
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg font-semibold text-foreground">Achievements</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-accent">
          <Sparkles className="w-3.5 h-3.5" />
          {earnedBadges.length}/{badges.length} earned
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${
        badge.earned
          ? "bg-secondary/50 border-primary/20 hover:border-primary/40"
          : "bg-muted/30 border-border/30 opacity-60"
      }`}
    >
      {!badge.earned && (
        <div className="absolute top-1.5 right-1.5">
          <Lock className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
      <span className={`text-2xl ${!badge.earned ? "grayscale" : ""}`}>{badge.emoji}</span>
      <p className="text-xs font-semibold text-foreground leading-tight">{badge.title}</p>
      <p className="text-[10px] text-muted-foreground leading-snug">{badge.description}</p>
      <span className="text-[10px] font-medium text-accent">+{badge.xpBonus} XP</span>
    </motion.div>
  );
};

export default AchievementsBadges;
