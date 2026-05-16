import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  onComplete: () => void;
}

const MESSAGES = [
  "Growing your financial garden 🌿",
  "Updating your finances…",
  "Checking your accounts…",
  "Preparing your bloom report 🌸",
];

// ─── SVG Sub-layers ──────────────────────────────────────────────────────────

const SkyLayer = () => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(200 60% 88%)" />
        <stop offset="60%" stopColor="hsl(36 33% 96%)" />
        <stop offset="100%" stopColor="hsl(152 20% 92%)" />
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#sky)" />
  </g>
);

const SunLayer = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        {/* Sun glow */}
        <circle cx="680" cy="60" r="50" fill="hsl(43 87% 82%)" opacity="0.3" />
        <circle cx="680" cy="60" r="30" fill="hsl(43 87% 72%)" opacity="0.5" />
        <circle cx="680" cy="60" r="18" fill="hsl(43 87% 62%)" opacity="0.7" />
        {/* Rays */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <motion.line
            key={angle}
            x1={680 + Math.cos((angle * Math.PI) / 180) * 22}
            y1={60 + Math.sin((angle * Math.PI) / 180) * 22}
            x2={680 + Math.cos((angle * Math.PI) / 180) * 55}
            y2={60 + Math.sin((angle * Math.PI) / 180) * 55}
            stroke="hsl(43 87% 72%)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.8 + angle * 0.003 }}
          />
        ))}
      </motion.g>
    )}
  </AnimatePresence>
);

const GroundLayer = () => (
  <g>
    <defs>
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(152 20% 72%)" />
        <stop offset="100%" stopColor="hsl(30 25% 55%)" />
      </linearGradient>
    </defs>
    {/* Hills */}
    <ellipse cx="200" cy="290" rx="300" ry="50" fill="hsl(152 18% 78%)" opacity="0.5" />
    <ellipse cx="600" cy="295" rx="280" ry="45" fill="hsl(152 18% 75%)" opacity="0.4" />
    {/* Ground */}
    <path d="M0 300 Q200 270 400 285 Q600 300 800 280 L800 400 L0 400 Z" fill="url(#ground)" />
    {/* Grass line */}
    <path d="M0 300 Q200 270 400 285 Q600 300 800 280" fill="none" stroke="hsl(152 25% 55%)" strokeWidth="2" opacity="0.4" />
  </g>
);

interface GrassProps { phase: number }
const GrassPatches = ({ phase }: GrassProps) => {
  const patches = useMemo(() => [
    { x: 50, y: 305 }, { x: 120, y: 298 }, { x: 200, y: 290 },
    { x: 320, y: 288 }, { x: 440, y: 292 }, { x: 560, y: 296 },
    { x: 650, y: 290 }, { x: 730, y: 285 }, { x: 380, y: 295 },
  ], []);

  if (phase < 1) return null;

  return (
    <g>
      {patches.map((p, i) => (
        <motion.g
          key={i}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >
          {[-4, 0, 4].map((dx, j) => (
            <motion.line
              key={j}
              x1={p.x + dx}
              y1={p.y}
              x2={p.x + dx + (j - 1) * 2}
              y2={p.y - 10 - Math.random() * 5}
              stroke="hsl(152 30% 50%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ x2: [p.x + dx + (j - 1) * 2 - 1, p.x + dx + (j - 1) * 2 + 1] }}
              transition={{ duration: 2 + j * 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          ))}
        </motion.g>
      ))}
    </g>
  );
};

interface FlowerData { x: number; y: number; color: string; size: number; delay: number }
const FlowersLayer = ({ phase, density }: { phase: number; density: number }) => {
  const flowers: FlowerData[] = useMemo(() => {
    const all: FlowerData[] = [
      { x: 80, y: 295, color: "hsl(340 60% 65%)", size: 5, delay: 0 },
      { x: 110, y: 290, color: "hsl(280 50% 70%)", size: 4, delay: 0.1 },
      { x: 140, y: 288, color: "hsl(340 60% 65%)", size: 5, delay: 0.15 },
      { x: 60, y: 300, color: "hsl(45 80% 65%)", size: 4, delay: 0.2 },
      { x: 170, y: 285, color: "hsl(280 50% 70%)", size: 6, delay: 0.25 },
      { x: 100, y: 298, color: "hsl(0 65% 65%)", size: 4, delay: 0.3 },
      { x: 190, y: 283, color: "hsl(340 60% 65%)", size: 5, delay: 0.35 },
      { x: 50, y: 306, color: "hsl(45 80% 65%)", size: 3, delay: 0.4 },
      { x: 155, y: 286, color: "hsl(0 65% 65%)", size: 5, delay: 0.45 },
      { x: 210, y: 280, color: "hsl(280 50% 70%)", size: 4, delay: 0.5 },
    ];
    return all.slice(0, Math.max(2, Math.ceil(all.length * density)));
  }, [density]);

  if (phase < 2) return null;

  return (
    <g>
      {flowers.map((f, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: f.delay + 0.2, type: "spring", stiffness: 200 }}
          style={{ transformOrigin: `${f.x}px ${f.y}px` }}
        >
          {/* Stem */}
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y - f.size * 2.5} stroke="hsl(152 30% 45%)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Petals */}
          {[0, 72, 144, 216, 288].map((angle) => (
            <circle
              key={angle}
              cx={f.x + Math.cos((angle * Math.PI) / 180) * f.size * 0.6}
              cy={f.y - f.size * 2.5 + Math.sin((angle * Math.PI) / 180) * f.size * 0.6}
              r={f.size * 0.4}
              fill={f.color}
              opacity="0.85"
            />
          ))}
          {/* Center */}
          <circle cx={f.x} cy={f.y - f.size * 2.5} r={f.size * 0.25} fill="hsl(43 87% 62%)" />
        </motion.g>
      ))}
    </g>
  );
};

const PondLayer = ({ phase, size }: { phase: number; size: number }) => {
  if (phase < 3) return null;

  const cx = 400;
  const cy = 320;
  const rx = 30 + size * 25;
  const ry = 10 + size * 8;

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <defs>
        <radialGradient id="pond-grad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="hsl(200 50% 75%)" />
          <stop offset="100%" stopColor="hsl(200 40% 60%)" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 2} fill="hsl(30 20% 50%)" opacity="0.2" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#pond-grad)" opacity="0.7" />
      {/* Ripples */}
      {[0, 1, 2].map((r) => (
        <motion.ellipse
          key={r}
          cx={cx - 5 + r * 8}
          cy={cy - 1}
          rx={4 + r * 3}
          ry={1.5 + r}
          fill="none"
          stroke="hsl(200 60% 85%)"
          strokeWidth="0.6"
          opacity="0.5"
          animate={{ rx: [4 + r * 3, 6 + r * 3], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2.5 + r * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </motion.g>
  );
};

const TreesLayer = ({ phase, count }: { phase: number; count: number }) => {
  const trees = useMemo(() => [
    { x: 600, y: 280, height: 50, delay: 0 },
    { x: 650, y: 275, height: 60, delay: 0.2 },
    { x: 700, y: 278, height: 45, delay: 0.35 },
    { x: 560, y: 285, height: 40, delay: 0.5 },
  ].slice(0, count), [count]);

  if (phase < 3) return null;

  return (
    <g>
      {trees.map((t, i) => (
        <motion.g
          key={i}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: t.delay + 0.3, type: "spring", stiffness: 100 }}
          style={{ transformOrigin: `${t.x}px ${t.y}px` }}
        >
          {/* Trunk */}
          <rect x={t.x - 3} y={t.y - t.height * 0.35} width={6} height={t.height * 0.4} rx={2} fill="hsl(30 30% 40%)" />
          {/* Canopy layers */}
          <ellipse cx={t.x} cy={t.y - t.height * 0.5} rx={t.height * 0.32} ry={t.height * 0.3} fill="hsl(152 35% 45%)" opacity="0.8" />
          <ellipse cx={t.x - 4} cy={t.y - t.height * 0.55} rx={t.height * 0.25} ry={t.height * 0.22} fill="hsl(152 30% 52%)" opacity="0.7" />
          <ellipse cx={t.x + 3} cy={t.y - t.height * 0.48} rx={t.height * 0.2} ry={t.height * 0.18} fill="hsl(152 25% 58%)" opacity="0.6" />
        </motion.g>
      ))}
    </g>
  );
};

const ButterflyLayer = ({ phase }: { phase: number }) => {
  if (phase < 4) return null;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {[
        { startX: 300, startY: 230 },
        { startX: 500, startY: 210 },
      ].map((b, i) => (
        <motion.g
          key={i}
          animate={{
            x: [0, 30, -10, 20, 0],
            y: [0, -15, -5, -20, 0],
          }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Wings */}
          <motion.ellipse
            cx={b.startX - 4} cy={b.startY}
            rx={4} ry={3}
            fill={i === 0 ? "hsl(280 50% 70%)" : "hsl(43 87% 62%)"}
            opacity="0.7"
            animate={{ rx: [4, 2, 4] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx={b.startX + 4} cy={b.startY}
            rx={4} ry={3}
            fill={i === 0 ? "hsl(280 50% 70%)" : "hsl(43 87% 62%)"}
            opacity="0.7"
            animate={{ rx: [4, 2, 4] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />
          {/* Body */}
          <ellipse cx={b.startX} cy={b.startY} rx={1} ry={3} fill="hsl(200 15% 30%)" />
        </motion.g>
      ))}
    </motion.g>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const GardenLoadingScreen = ({ onComplete }: Props) => {
  const { profile } = useProfile();
  const [phase, setPhase] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Determine garden richness from profile level
  const level = profile?.finbloom_level ?? 0;
  const flowerDensity = level <= 1 ? 0.3 : level <= 3 ? 0.6 : 1;
  const pondSize = level <= 1 ? 0.5 : level <= 3 ? 1.5 : 3;
  const treeCount = level <= 1 ? 1 : level <= 3 ? 2 : 4;

  // Growth animation phases: 0→soil, 1→grass, 2→flowers, 3→trees+pond, 4→butterflies
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 1600),
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => onComplete(), 500);
      }, 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Garden SVG */}
      <div className="w-full max-w-2xl px-4">
        <svg
          viewBox="0 0 800 400"
          className="w-full"
          style={{ height: "clamp(280px, 40vh, 320px)" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <SkyLayer />
          <SunLayer show={phase >= 1} />
          <GroundLayer />
          <GrassPatches phase={phase} />
          <FlowersLayer phase={phase} density={flowerDensity} />
          <PondLayer phase={phase} size={pondSize} />
          <TreesLayer phase={phase} count={treeCount} />
          <ButterflyLayer phase={phase} />
        </svg>
      </div>

      {/* Loading message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="mt-6 text-sm text-muted-foreground font-body"
        >
          {MESSAGES[messageIdx]}
        </motion.p>
      </AnimatePresence>

      {/* Subtle progress dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3, 4].map((p) => (
          <motion.div
            key={p}
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: phase >= p ? "hsl(152, 22%, 58%)" : "hsl(36, 15%, 88%)",
              scale: phase === p ? 1.4 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GardenLoadingScreen;
