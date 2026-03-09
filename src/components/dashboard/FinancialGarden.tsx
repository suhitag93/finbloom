import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXP } from "@/hooks/useXP";
import { useMissions } from "@/hooks/useMissions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

// ─── Growth Event Types ──────────────────────────────────────────────────────

interface GrowthEvent {
  id: string;
  type: "flower" | "pond" | "tree" | "weed" | "butterfly" | "sun";
  emoji: string;
  message: string;
}

// ─── Data mapping helpers ───────────────────────────────────────────────────

interface GardenData {
  emergencyMonths: number;
  savingsRate: number;
  debtLevel: number;
  investmentGrowth: number;
  habitStreak: number;
}

type GardenStage = "seed" | "sprout" | "bloom" | "thrive" | "flourish" | "legacy";

const STAGE_MAP: Record<number, GardenStage> = {
  0: "seed",
  1: "sprout",
  2: "bloom",
  3: "thrive",
  4: "flourish",
  5: "legacy",
};

interface TapDetail {
  title: string;
  subtitle: string;
  emoji: string;
  detail: string;
}

// ─── SVG Garden Elements ─────────────────────────────────────────────────────

const Ground = ({ stage }: { stage: GardenStage }) => {
  const grassDensity = ["seed", "sprout"].includes(stage) ? 0.3 : stage === "bloom" ? 0.6 : 1;
  return (
    <g>
      <ellipse cx="200" cy="290" rx="190" ry="30" fill="hsl(152, 20%, 85%)" opacity={0.5} />
      <ellipse cx="200" cy="290" rx="170" ry="22" fill="hsl(30, 25%, 70%)" opacity={0.4} />
      {grassDensity > 0.2 && (
        <g opacity={grassDensity}>
          {[40, 80, 130, 180, 240, 290, 340].map((x, i) => (
            <motion.path
              key={i}
              d={`M${x},285 Q${x + 2},270 ${x - 3},260 M${x},285 Q${x + 5},272 ${x + 8},262`}
              stroke="hsl(152, 30%, 55%)"
              strokeWidth="1.5"
              fill="none"
              initial={{ scaleY: 0, originY: "100%" }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
            />
          ))}
        </g>
      )}
    </g>
  );
};

const Pond = ({ months, onTap, isNew }: { months: number; onTap: () => void; isNew?: boolean }) => {
  if (months < 1) return null;
  const size = months < 3 ? 0.6 : months < 6 ? 0.85 : 1;
  const hasRipples = months >= 6;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Emergency fund details">
      <motion.ellipse
        cx="300" cy="270" rx={45 * size} ry={14 * size}
        fill="hsl(200, 50%, 75%)"
        opacity={0.7}
        initial={{ scale: 0 }}
        animate={{ scale: isNew ? [0, 1.2, 1] : 1 }}
        transition={{ delay: 0.8, duration: isNew ? 0.8 : 0.6, type: "spring" }}
      />
      <motion.ellipse
        cx="300" cy="268" rx={35 * size} ry={10 * size}
        fill="hsl(200, 60%, 82%)"
        opacity={0.6}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      />
      {hasRipples && (
        <>
          <motion.ellipse
            cx="300" cy="268" rx={20} ry={6}
            fill="none" stroke="hsl(200, 50%, 88%)" strokeWidth="0.5"
            animate={{ rx: [15, 30, 15], ry: [5, 9, 5], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M280,265 Q290,260 300,265 Q310,270 320,265"
            stroke="hsl(200, 60%, 88%)" strokeWidth="1" fill="none"
            animate={{ d: ["M280,265 Q290,260 300,265 Q310,270 320,265", "M280,265 Q290,270 300,265 Q310,260 320,265"] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        </>
      )}
      {/* New growth glow */}
      {isNew && (
        <motion.ellipse
          cx="300" cy="270" rx={50 * size} ry={18 * size}
          fill="none" stroke="hsl(200, 60%, 70%)" strokeWidth="2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.3, 1.5] }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      )}
    </g>
  );
};

const Flower = ({ x, y, color, delay, onTap, size = 1, isNew }: { x: number; y: number; color: string; delay: number; onTap: () => void; size?: number; isNew?: boolean }) => (
  <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Savings details">
    <motion.g
      initial={{ scale: 0, originX: `${x}px`, originY: `${y + 15}px` }}
      animate={{ scale: isNew ? [0, 1.3, size] : size }}
      transition={{ delay, duration: isNew ? 0.8 : 0.5, type: "spring" }}
    >
      <line x1={x} y1={y + 15} x2={x} y2={y + 35} stroke="hsl(152, 35%, 50%)" strokeWidth="1.5" />
      <ellipse cx={x + 5} cy={y + 25} rx="4" ry="2" fill="hsl(152, 35%, 55%)" transform={`rotate(-30, ${x + 5}, ${y + 25})`} />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.ellipse
          key={i}
          cx={x + Math.cos((angle * Math.PI) / 180) * 5}
          cy={y + Math.sin((angle * Math.PI) / 180) * 5}
          rx="4" ry="6"
          fill={color}
          opacity={0.85}
          transform={`rotate(${angle}, ${x + Math.cos((angle * Math.PI) / 180) * 5}, ${y + Math.sin((angle * Math.PI) / 180) * 5})`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <circle cx={x} cy={y} r="3" fill="hsl(43, 87%, 62%)" />
      {/* Bloom sparkle */}
      {isNew && (
        <motion.circle
          cx={x} cy={y - 10} r="12"
          fill="none" stroke="hsl(43, 90%, 70%)" strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        />
      )}
    </motion.g>
  </g>
);

const Tree = ({ x, y, height, onTap, isNew }: { x: number; y: number; height: number; onTap: () => void; isNew?: boolean }) => {
  const trunkH = 30 + height * 40;
  const canopyR = 15 + height * 20;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Investment details">
      <motion.rect
        x={x - 4} y={y - trunkH} width={8} height={trunkH}
        rx="3"
        fill="hsl(30, 30%, 45%)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isNew ? [0, 1.1, 1] : 1 }}
        style={{ transformOrigin: `${x}px ${y}px` }}
        transition={{ delay: 0.6, duration: isNew ? 1 : 0.8, ease: "easeOut" }}
      />
      <motion.circle
        cx={x} cy={y - trunkH - canopyR * 0.4} r={canopyR}
        fill="hsl(152, 30%, 50%)"
        opacity={0.9}
        initial={{ scale: 0 }}
        animate={{ scale: isNew ? [0, 1.15, 1] : 1 }}
        transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
      />
      <motion.circle
        cx={x - canopyR * 0.5} cy={y - trunkH - canopyR * 0.1} r={canopyR * 0.7}
        fill="hsl(152, 25%, 55%)"
        opacity={0.8}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      />
      <motion.circle
        cx={x + canopyR * 0.4} cy={y - trunkH} r={canopyR * 0.6}
        fill="hsl(152, 35%, 48%)"
        opacity={0.75}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      />
      {/* Growth ring */}
      {isNew && (
        <motion.circle
          cx={x} cy={y - trunkH - canopyR * 0.4} r={canopyR + 10}
          fill="none" stroke="hsl(152, 50%, 60%)" strokeWidth="2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.8, 1.2, 1.5] }}
          transition={{ duration: 1.2, delay: 1.4 }}
        />
      )}
    </g>
  );
};

const Weed = ({ x, y, opacity, isDisappearing }: { x: number; y: number; opacity: number; isDisappearing?: boolean }) => {
  if (opacity <= 0) return null;
  return (
    <motion.g
      initial={{ opacity: isDisappearing ? opacity + 0.3 : 0 }}
      animate={{ opacity: isDisappearing ? 0 : opacity }}
      transition={{ delay: isDisappearing ? 0 : 0.5, duration: isDisappearing ? 1.5 : 0.4 }}
    >
      <path
        d={`M${x},${y} Q${x - 4},${y - 12} ${x - 8},${y - 18} M${x},${y} Q${x + 3},${y - 10} ${x + 6},${y - 16}`}
        stroke="hsl(45, 30%, 55%)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={x - 8} cy={y - 19} r="1.5" fill="hsl(45, 25%, 60%)" />
      <circle cx={x + 6} cy={y - 17} r="1.2" fill="hsl(45, 25%, 60%)" />
      {/* Disappearing puff */}
      {isDisappearing && (
        <motion.circle
          cx={x} cy={y - 10} r="8"
          fill="hsl(152, 40%, 80%)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2], y: -20 }}
          transition={{ duration: 1.2 }}
        />
      )}
    </motion.g>
  );
};

const Butterfly = ({ delay }: { delay: number }) => (
  <motion.g
    initial={{ opacity: 0, x: 50, y: 100 }}
    animate={{
      opacity: [0, 1, 1, 0],
      x: [50, 120, 250, 330],
      y: [100, 60, 80, 50],
    }}
    transition={{ delay, duration: 8, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
  >
    <motion.path
      d="M0,-3 Q-8,-10 -5,-3 Q-8,4 0,3 Z"
      fill="hsl(245, 30%, 73%)"
      opacity={0.7}
      animate={{ d: ["M0,-3 Q-8,-10 -5,-3 Q-8,4 0,3 Z", "M0,-1 Q-5,-5 -3,-1 Q-5,3 0,1 Z"] }}
      transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.path
      d="M0,-3 Q8,-10 5,-3 Q8,4 0,3 Z"
      fill="hsl(330, 40%, 75%)"
      opacity={0.7}
      animate={{ d: ["M0,-3 Q8,-10 5,-3 Q8,4 0,3 Z", "M0,-1 Q5,-5 3,-1 Q5,3 0,1 Z"] }}
      transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
    />
  </motion.g>
);

const SunRays = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.35 }}
      transition={{ delay: 1.5, duration: 1 }}
    >
      {[0, 30, 60, 90, 120, 150].map((angle, i) => (
        <motion.line
          key={i}
          x1={370} y1={30}
          x2={370 + Math.cos(((angle + 180) * Math.PI) / 180) * 60}
          y2={30 + Math.sin(((angle + 180) * Math.PI) / 180) * 60}
          stroke="hsl(43, 87%, 62%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
      <circle cx="370" cy="30" r="14" fill="hsl(43, 87%, 72%)" opacity={0.5} />
    </motion.g>
  );
};

const SeedScene = () => (
  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <ellipse cx="200" cy="280" rx="30" ry="8" fill="hsl(30, 30%, 55%)" opacity={0.6} />
    <motion.ellipse
      cx="200" cy="275" rx="5" ry="7"
      fill="hsl(30, 35%, 45%)"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <text x="200" y="260" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" opacity={0.5}>
      🌱
    </text>
  </motion.g>
);

// ─── Growth Event Banner ─────────────────────────────────────────────────────

const GrowthEventBanner = ({ event, onDismiss }: { event: GrowthEvent | null; onDismiss: () => void }) => (
  <AnimatePresence>
    {event && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="absolute top-2 left-2 right-2 z-20"
        onClick={onDismiss}
      >
        <div className="bg-gradient-to-r from-primary/90 to-accent/80 rounded-xl px-4 py-3 shadow-lg border border-primary/20 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <motion.span
              className="text-xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {event.emoji}
            </motion.span>
            <p className="text-sm font-semibold text-primary-foreground">{event.message}</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Detail popover ──────────────────────────────────────────────────────────

const DetailPopover = ({ detail, onClose }: { detail: TapDetail | null; onClose: () => void }) => (
  <AnimatePresence>
    {detail && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-4 left-4 right-4 bg-card border border-border/50 rounded-2xl p-4 shadow-card z-10"
        onClick={onClose}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{detail.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{detail.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{detail.subtitle}</p>
            <p className="text-xs text-foreground/80 mt-2 leading-relaxed">{detail.detail}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">Tap to dismiss</p>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const FinancialGarden = () => {
  const { currentLevel, totalXP, nextLevel, progress, earnedBadges, streakDays } = useXP();
  const { completedMissions } = useMissions();
  const [activeDetail, setActiveDetail] = useState<TapDetail | null>(null);
  const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
  const [recentGrowth, setRecentGrowth] = useState<Set<string>>(new Set());
  
  // Track previous values to detect changes
  const prevValuesRef = useRef({
    level: currentLevel.id,
    badgeCount: earnedBadges.length,
    completedCount: completedMissions.length,
    xp: totalXP,
  });

  // Derive garden data from real metrics
  const data: GardenData = useMemo(() => ({
    emergencyMonths: Math.min(Math.floor(currentLevel.id * 1.5), 6), // Simulated based on level
    savingsRate: Math.min(20 + earnedBadges.filter(b => b.category === "savings").length * 10, 50),
    debtLevel: Math.max(60 - earnedBadges.filter(b => b.category === "debt").length * 20, 10),
    investmentGrowth: Math.min(currentLevel.id * 15 + earnedBadges.filter(b => b.category === "investing").length * 20, 100),
    habitStreak: streakDays,
  }), [currentLevel.id, earnedBadges, streakDays]);

  const stage = STAGE_MAP[currentLevel.id] ?? "seed";
  const stageIndex = currentLevel.id;

  // ─── Growth Event Detection ───────────────────────────────────────────────
  const checkForGrowthEvents = useCallback(() => {
    const prev = prevValuesRef.current;
    const events: GrowthEvent[] = [];

    // Level up → tree grows
    if (currentLevel.id > prev.level) {
      events.push({
        id: `level-${currentLevel.id}`,
        type: "tree",
        emoji: "🌳",
        message: `Level up! You reached ${currentLevel.title}!`,
      });
      setRecentGrowth(s => new Set(s).add("tree"));
    }

    // New badge earned → flower blooms
    if (earnedBadges.length > prev.badgeCount) {
      const newBadge = earnedBadges[earnedBadges.length - 1];
      const badgeEmoji = newBadge?.category === "savings" ? "🌸" 
        : newBadge?.category === "debt" ? "🌿"
        : newBadge?.category === "investing" ? "🌳"
        : "🦋";
      
      events.push({
        id: `badge-${newBadge?.id}`,
        type: newBadge?.category === "debt" ? "weed" : "flower",
        emoji: badgeEmoji,
        message: newBadge?.category === "debt" 
          ? "A weed disappeared! Debt milestone reached!"
          : `A new flower bloomed! ${newBadge?.title ?? "Badge"} earned!`,
      });
      setRecentGrowth(s => new Set(s).add(newBadge?.category === "debt" ? "weed" : "flower"));
    }

    // Mission completed → butterfly appears
    if (completedMissions.length > prev.completedCount) {
      events.push({
        id: `mission-${Date.now()}`,
        type: "butterfly",
        emoji: "🦋",
        message: "Mission complete! A butterfly visits your garden!",
      });
      setRecentGrowth(s => new Set(s).add("butterfly"));
    }

    // XP milestone (every 500 XP) → pond expands
    const prevMilestone = Math.floor(prev.xp / 500);
    const currentMilestone = Math.floor(totalXP / 500);
    if (currentMilestone > prevMilestone && currentMilestone > 0) {
      events.push({
        id: `xp-${currentMilestone}`,
        type: "pond",
        emoji: "💧",
        message: `${currentMilestone * 500} XP reached! Your pond expands!`,
      });
      setRecentGrowth(s => new Set(s).add("pond"));
    }

    // Update refs
    prevValuesRef.current = {
      level: currentLevel.id,
      badgeCount: earnedBadges.length,
      completedCount: completedMissions.length,
      xp: totalXP,
    };

    // Show first event, queue others as toasts
    if (events.length > 0) {
      setGrowthEvent(events[0]);
      events.slice(1).forEach((e, i) => {
        setTimeout(() => {
          toast(e.message, {
            icon: e.emoji,
            duration: 4000,
          });
        }, (i + 1) * 2500);
      });

      // Clear growth highlights after animation
      setTimeout(() => {
        setRecentGrowth(new Set());
      }, 3000);
    }
  }, [currentLevel, earnedBadges, completedMissions, totalXP]);

  // Check for growth events when data changes
  useEffect(() => {
    const timeout = setTimeout(checkForGrowthEvents, 500);
    return () => clearTimeout(timeout);
  }, [checkForGrowthEvents]);

  // Auto-dismiss growth event banner
  useEffect(() => {
    if (growthEvent) {
      const timer = setTimeout(() => setGrowthEvent(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [growthEvent]);

  const details: Record<string, TapDetail> = useMemo(() => ({
    pond: {
      title: "Emergency Fund",
      subtitle: `${data.emergencyMonths} months coverage`,
      emoji: "💧",
      detail: data.emergencyMonths >= 6
        ? "Excellent! Your safety net is strong with 6+ months of expenses covered."
        : `You're at ${data.emergencyMonths} months. Aim for 6 months of expenses saved.`,
    },
    flowers: {
      title: "Savings Progress",
      subtitle: `${data.savingsRate}% savings rate`,
      emoji: "🌸",
      detail: data.savingsRate >= 20
        ? `Great savings rate! You're saving ${data.savingsRate}% of your income.`
        : `Your savings rate is ${data.savingsRate}%. Try to reach 20% for healthy growth.`,
    },
    trees: {
      title: "Investment Growth",
      subtitle: `${data.investmentGrowth}% toward milestone`,
      emoji: "🌳",
      detail: "Your investments are growing steadily. Keep contributing regularly for compound growth.",
    },
    weeds: {
      title: "Debt Health",
      subtitle: data.debtLevel > 50 ? "Needs attention" : "Looking good",
      emoji: "🌿",
      detail: data.debtLevel > 50
        ? "Focus on paying down high-interest debt first to clear the weeds."
        : "Your debt is well-managed. Keep it up!",
    },
  }), [data]);

  // Determine what elements to show based on stage
  const showPond = stageIndex >= 1 && data.emergencyMonths >= 1;
  const flowerCount = stageIndex >= 2 ? Math.min(Math.ceil(data.savingsRate / 15), 5) : stageIndex >= 1 ? 1 : 0;
  const treeCount = stageIndex >= 3 ? (stageIndex >= 4 ? 2 : 1) : 0;
  const weedOpacity = Math.min(data.debtLevel / 100, 0.8);
  const showButterflies = stageIndex >= 2 && data.habitStreak >= 3;
  const showSun = stageIndex >= 3 && data.habitStreak >= 7;

  const flowerPositions = [
    { x: 80, y: 260, color: "hsl(330, 50%, 75%)" },
    { x: 140, y: 255, color: "hsl(280, 40%, 75%)" },
    { x: 200, y: 258, color: "hsl(350, 55%, 78%)" },
    { x: 250, y: 262, color: "hsl(300, 35%, 72%)" },
    { x: 110, y: 265, color: "hsl(20, 60%, 78%)" },
  ];

  const hasRecentGrowth = recentGrowth.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden"
    >
      {/* Growth event banner */}
      <GrowthEventBanner event={growthEvent} onDismiss={() => setGrowthEvent(null)} />

      {/* Header */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-semibold text-foreground">Your Garden Today</h3>
          <div className="flex items-center gap-1 text-xs font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            {currentLevel.emoji} {currentLevel.title}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Tap garden elements to explore your financial progress
        </p>
      </div>

      {/* Garden SVG */}
      <div className="relative px-2 md:px-4">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-auto"
          style={{ maxHeight: "280px" }}
          aria-label="Financial garden visualization"
        >
          <defs>
            <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(200, 40%, 92%)" />
              <stop offset="100%" stopColor="hsl(152, 20%, 93%)" />
            </linearGradient>
          </defs>

          <rect width="400" height="300" fill="url(#sky)" rx="8" />
          <SunRays visible={showSun} />
          <Ground stage={stage} />

          {stageIndex === 0 && <SeedScene />}

          {stageIndex >= 1 && (
            <g onClick={() => setActiveDetail(details.weeds)} className="cursor-pointer">
              <Weed x={340} y={278} opacity={weedOpacity} isDisappearing={recentGrowth.has("weed")} />
              <Weed x={60} y={280} opacity={weedOpacity * 0.7} />
              {weedOpacity > 0.5 && <Weed x={160} y={282} opacity={weedOpacity * 0.5} />}
            </g>
          )}

          {showPond && (
            <Pond 
              months={data.emergencyMonths} 
              onTap={() => setActiveDetail(details.pond)}
              isNew={recentGrowth.has("pond")}
            />
          )}

          {flowerPositions.slice(0, flowerCount).map((f, i) => (
            <Flower
              key={i}
              x={f.x}
              y={f.y}
              color={f.color}
              delay={0.5 + i * 0.15}
              onTap={() => setActiveDetail(details.flowers)}
              size={stageIndex >= 4 ? 1.2 : 1}
              isNew={recentGrowth.has("flower") && i === flowerCount - 1}
            />
          ))}

          {treeCount >= 1 && (
            <Tree
              x={65} y={280}
              height={data.investmentGrowth / 100}
              onTap={() => setActiveDetail(details.trees)}
              isNew={recentGrowth.has("tree")}
            />
          )}
          {treeCount >= 2 && (
            <Tree
              x={350} y={280}
              height={data.investmentGrowth / 100 * 0.7}
              onTap={() => setActiveDetail(details.trees)}
            />
          )}

          {showButterflies && <Butterfly delay={recentGrowth.has("butterfly") ? 0.5 : 2} />}
          {stageIndex >= 4 && <Butterfly delay={5} />}
        </svg>

        <DetailPopover detail={activeDetail} onClose={() => setActiveDetail(null)} />
      </div>

      {/* Bottom bar */}
      <div className="px-4 pb-4 pt-2 md:px-6 md:pb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-foreground">
                {currentLevel.emoji} {currentLevel.title} → {nextLevel?.emoji ?? "👑"} {nextLevel?.title ?? "Max"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {totalXP.toLocaleString()} / {nextLevel?.xpRequired.toLocaleString() ?? "∞"} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-bloom"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Growth message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={hasRecentGrowth ? "grew" : "static"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className={`text-[11px] text-center mt-3 font-medium ${
              hasRecentGrowth ? "text-primary" : "text-primary/70"
            }`}
          >
            {hasRecentGrowth ? "Your garden grew today! 🌸✨" : "Keep growing your financial garden 🌱"}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FinancialGarden;
