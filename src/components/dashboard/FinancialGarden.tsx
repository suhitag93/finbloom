import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXP } from "@/hooks/useXP";
import { useMissions } from "@/hooks/useMissions";
import { useAccounts } from "@/hooks/useAccounts";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import FinancialGardenScene from "./FinancialGardenScene";
import type { GardenState } from "./FinancialGardenScene";

// ─── Growth Event Types ──────────────────────────────────────────────────────

interface GrowthEvent {
  id: string;
  type: "flower" | "pond" | "tree" | "weed" | "butterfly" | "sun";
  emoji: string;
  message: string;
}

// ─── Growth Event Banner ─────────────────────────────────────────────────────

const GrowthEventBanner = ({ event, onDismiss }: { event: GrowthEvent | null; onDismiss: () => void }) => (
  <AnimatePresence>
    {event && (
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        transition={{ duration: 0.35, type: "spring" }}
        className="absolute top-3 left-3 right-3 z-20"
        onClick={onDismiss}
      >
        <div className="bg-card/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-primary/20">
          <div className="flex items-center justify-center gap-2">
            <motion.span className="text-xl"
              animate={{ scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 0.55, delay: 0.15 }}>
              {event.emoji}
            </motion.span>
            <p className="text-sm font-semibold text-foreground">{event.message}</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Dashboard Component ────────────────────────────────────────────────

const FinancialGarden = () => {
  const { currentLevel, totalXP, nextLevel, progress, earnedBadges, streakDays } = useXP();
  const { completedMissions } = useMissions();
  const { accounts } = useAccounts();
  const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
  const [recentGrowth, setRecentGrowth] = useState<Set<string>>(new Set());

  const prevValuesRef = useRef({
    level: currentLevel.id,
    badgeCount: earnedBadges.length,
    completedCount: completedMissions.length,
    xp: totalXP,
  });

  // Derive garden state from real data
  const gardenState: GardenState = useMemo(() => {
    const savings = accounts.filter(a => a.account_type === "savings").reduce((s, a) => s + a.balance, 0);
    const checking = accounts.filter(a => a.account_type === "checking").reduce((s, a) => s + a.balance, 0);
    const investments = accounts.filter(a => ["investment", "brokerage", "retirement"].includes(a.account_type)).reduce((s, a) => s + a.balance, 0);
    const debt = accounts.filter(a => ["credit", "loan"].includes(a.account_type)).reduce((s, a) => s + Math.abs(a.balance), 0);
    const monthlyExpenses = 3500;

    return {
      savingsRate: Math.min(20 + earnedBadges.filter(b => b.category === "savings").length * 10, 50),
      emergencyFundMonths: monthlyExpenses > 0
        ? Math.min((savings + checking) / monthlyExpenses, 12)
        : currentLevel.id * 1.5,
      investmentValue: investments > 0
        ? Math.min((investments / 50000) * 100, 100)
        : Math.min(currentLevel.id * 15 + earnedBadges.filter(b => b.category === "investing").length * 20, 100),
      debtRatio: debt > 0
        ? Math.min((debt / (savings + checking + investments + 1)) * 50, 100)
        : Math.max(60 - earnedBadges.filter(b => b.category === "debt").length * 20, 10),
      userLevel: currentLevel.id,
    };
  }, [accounts, currentLevel.id, earnedBadges]);

  // ─── Growth Event Detection ───────────────────────────────────────────────
  const checkForGrowthEvents = useCallback(() => {
    const prev = prevValuesRef.current;
    const events: GrowthEvent[] = [];

    if (currentLevel.id > prev.level) {
      events.push({ id: `level-${currentLevel.id}`, type: "tree", emoji: "🌳", message: `Level up! You reached ${currentLevel.title}!` });
      setRecentGrowth(s => new Set(s).add("tree"));
    }
    if (earnedBadges.length > prev.badgeCount) {
      const nb = earnedBadges[earnedBadges.length - 1];
      const isDebt = nb?.category === "debt";
      events.push({
        id: `badge-${nb?.id}`, type: isDebt ? "weed" : "flower",
        emoji: isDebt ? "🌿" : "🌸",
        message: isDebt ? "A weed disappeared! Debt milestone reached!" : `A new flower bloomed! ${nb?.title ?? "Badge"} earned!`,
      });
      setRecentGrowth(s => new Set(s).add(isDebt ? "weed" : "flower"));
    }
    if (completedMissions.length > prev.completedCount) {
      events.push({ id: `mission-${Date.now()}`, type: "butterfly", emoji: "🦋", message: "Mission complete! A butterfly visits your garden!" });
      setRecentGrowth(s => new Set(s).add("butterfly"));
    }
    const prevM = Math.floor(prev.xp / 500);
    const curM = Math.floor(totalXP / 500);
    if (curM > prevM && curM > 0) {
      events.push({ id: `xp-${curM}`, type: "pond", emoji: "💧", message: `${curM * 500} XP reached! Your pond expands!` });
      setRecentGrowth(s => new Set(s).add("pond"));
    }

    prevValuesRef.current = { level: currentLevel.id, badgeCount: earnedBadges.length, completedCount: completedMissions.length, xp: totalXP };

    if (events.length > 0) {
      setGrowthEvent(events[0]);
      events.slice(1).forEach((e, i) => setTimeout(() => toast(e.message, { icon: e.emoji, duration: 4000 }), (i + 1) * 2500));
      setTimeout(() => setRecentGrowth(new Set()), 3000);
    }
  }, [currentLevel, earnedBadges, completedMissions, totalXP]);

  useEffect(() => {
    const t = setTimeout(checkForGrowthEvents, 500);
    return () => clearTimeout(t);
  }, [checkForGrowthEvents]);

  useEffect(() => {
    if (growthEvent) {
      const t = setTimeout(() => setGrowthEvent(null), 4000);
      return () => clearTimeout(t);
    }
  }, [growthEvent]);

  const hasRecentGrowth = recentGrowth.size > 0;
  const xpToNext = nextLevel ? nextLevel.xpRequired - totalXP : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="relative rounded-2xl bg-card border border-border/40 shadow-lg overflow-hidden"
    >
      <GrowthEventBanner event={growthEvent} onDismiss={() => setGrowthEvent(null)} />

      {/* Header */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-semibold text-foreground">Your Garden</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            {currentLevel.emoji} {currentLevel.title}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">Tap any zone to explore your progress</p>
      </div>

      {/* Reusable Scene */}
      <div className="relative px-1 md:px-3">
        <FinancialGardenScene
          gardenState={gardenState}
          highlightZones={recentGrowth}
          className="relative w-full"
        />
      </div>

      {/* XP & Level Progress */}
      <div className="px-4 pb-4 pt-2 md:px-6 md:pb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-foreground">
            Level: <span className="text-primary">{currentLevel.title}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {nextLevel ? `${xpToNext.toLocaleString()} XP to ${nextLevel.title}` : "Max Level!"}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(152, 45%, 50%), hsl(152, 55%, 42%), hsl(140, 50%, 45%))" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground tabular-nums">{totalXP.toLocaleString()} XP</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">{nextLevel?.xpRequired.toLocaleString() ?? "∞"} XP</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={hasRecentGrowth ? "grew" : "static"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={`text-[11px] text-center mt-3 font-medium ${hasRecentGrowth ? "text-primary" : "text-muted-foreground"}`}
          >
            {hasRecentGrowth ? "Your garden grew today! 🌸✨" : "Every good habit helps your garden grow 🌱"}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FinancialGarden;
