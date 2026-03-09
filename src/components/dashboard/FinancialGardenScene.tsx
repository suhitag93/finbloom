import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, PiggyBank, Shield, CreditCard } from "lucide-react";

// ─── Public API ──────────────────────────────────────────────────────────────

export interface GardenState {
  savingsRate: number;          // 0–100  percentage of income saved
  emergencyFundMonths: number;  // 0–12+  months of expenses covered
  investmentValue: number;      // 0–100  percent toward investment milestone
  debtRatio: number;            // 0–100  debt-to-asset ratio
  userLevel: number;            // 0–5    maps to garden stage
}

export interface GardenSceneProps {
  gardenState: GardenState;
  /** Highlight specific zones after a growth event */
  highlightZones?: Set<string>;
  /** Override container height. Default: clamp(360px, 50vw, 420px) */
  className?: string;
}

// ─── Internal types ──────────────────────────────────────────────────────────

interface TapDetail {
  title: string;
  subtitle: string;
  emoji: string;
  icon: React.ElementType;
  stats: { label: string; value: string }[];
  nextMilestone?: string;
}

type GardenStage = "seed" | "sprout" | "bloom" | "thrive" | "flourish" | "legacy";

const STAGE_MAP: Record<number, GardenStage> = {
  0: "seed", 1: "sprout", 2: "bloom", 3: "thrive", 4: "flourish", 5: "legacy",
};

// ─── SVG Definitions ─────────────────────────────────────────────────────────

const GardenDefs = () => (
  <defs>
    <linearGradient id="gs-skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="hsl(205, 45%, 92%)" />
      <stop offset="50%" stopColor="hsl(170, 30%, 91%)" />
      <stop offset="100%" stopColor="hsl(152, 25%, 88%)" />
    </linearGradient>
    <radialGradient id="gs-sunGlow" cx="88%" cy="10%" r="25%">
      <stop offset="0%" stopColor="hsl(43, 95%, 88%)" stopOpacity="0.7" />
      <stop offset="100%" stopColor="hsl(43, 90%, 88%)" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="gs-pondGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="hsl(200, 55%, 78%)" />
      <stop offset="100%" stopColor="hsl(200, 50%, 65%)" />
    </linearGradient>
    <linearGradient id="gs-trunkGrad" x1="0%" y1="0%" x2="1" y2="0">
      <stop offset="0%" stopColor="hsl(25, 32%, 35%)" />
      <stop offset="50%" stopColor="hsl(30, 38%, 42%)" />
      <stop offset="100%" stopColor="hsl(25, 28%, 32%)" />
    </linearGradient>
    <filter id="gs-softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

// ─── SkyLayer ────────────────────────────────────────────────────────────────

const SkyLayer = ({ showSunlight, cloudCount }: { showSunlight: boolean; cloudCount: number }) => {
  const clouds = [
    { x: 55, y: 28, scale: 1, dur: 50 },
    { x: 200, y: 18, scale: 0.8, dur: 60 },
    { x: 330, y: 35, scale: 0.7, dur: 55 },
  ];

  return (
    <g>
      <rect width="400" height="320" fill="url(#gs-skyGrad)" />
      {showSunlight && <rect width="400" height="320" fill="url(#gs-sunGlow)" />}

      {/* Sun */}
      {showSunlight && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.5 }}>
          <motion.circle cx="360" cy="32" r="28" fill="hsl(43, 90%, 88%)" opacity={0.18}
            animate={{ r: [26, 32, 26], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 5, repeat: Infinity }} />
          <circle cx="360" cy="32" r="14" fill="hsl(43, 95%, 82%)" opacity={0.55} />
          <circle cx="360" cy="32" r="8" fill="hsl(43, 98%, 88%)" opacity={0.75} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.line key={i}
              x1={360 + Math.cos((angle * Math.PI) / 180) * 18}
              y1={32 + Math.sin((angle * Math.PI) / 180) * 18}
              x2={360 + Math.cos((angle * Math.PI) / 180) * (28 + (i % 2) * 6)}
              y2={32 + Math.sin((angle * Math.PI) / 180) * (28 + (i % 2) * 6)}
              stroke="hsl(43, 85%, 78%)" strokeWidth="1" strokeLinecap="round" opacity={0.35}
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.35 }} />
          ))}
        </motion.g>
      )}

      {/* Clouds */}
      {cloudCount > 0 && (
        <g opacity={0.45}>
          {clouds.slice(0, cloudCount).map((c, i) => (
            <motion.g key={i} animate={{ x: [0, 12, 0] }}
              transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: i * 5 }}>
              <ellipse cx={c.x} cy={c.y} rx={32 * c.scale} ry={10 * c.scale} fill="white" opacity={0.75} />
              <ellipse cx={c.x - 18 * c.scale} cy={c.y + 4} rx={20 * c.scale} ry={7 * c.scale} fill="white" opacity={0.55} />
              <ellipse cx={c.x + 16 * c.scale} cy={c.y + 3} rx={16 * c.scale} ry={6 * c.scale} fill="white" opacity={0.6} />
            </motion.g>
          ))}
        </g>
      )}
    </g>
  );
};

// ─── GroundLayer ─────────────────────────────────────────────────────────────

const GroundLayer = ({ healthLevel }: { healthLevel: number }) => {
  const hue = 100 + healthLevel * 52;
  const sat = 18 + healthLevel * 18;
  const light = 52 - healthLevel * 8;

  const patches = [
    [25, 35, 45], [70, 85, 98], [140, 155, 168], [210, 225, 238],
    [280, 295, 308], [340, 355, 368], [115, 128], [185, 198], [250, 263], [320, 333],
  ];

  return (
    <g>
      {/* Distant hill */}
      <path d="M-10,225 Q80,190 180,210 Q280,185 410,220 L410,250 L-10,250Z"
        fill={`hsl(${hue - 10}, ${sat - 5}%, ${light + 15}%)`} opacity={0.4} />
      {/* Main ground */}
      <path d="M-10,255 Q60,248 140,254 Q220,245 310,252 Q380,246 410,252 L410,320 L-10,320Z"
        fill={`hsl(${hue}, ${sat}%, ${light}%)`} />
      {/* Foreground grass layer */}
      <path d="M-10,272 Q90,266 180,270 Q270,264 360,269 Q400,265 410,268 L410,320 L-10,320Z"
        fill={`hsl(${hue + 5}, ${sat + 5}%, ${light - 5}%)`} opacity={0.85} />

      {/* Grass blades */}
      {healthLevel >= 0.2 && (
        <g opacity={0.3 + healthLevel * 0.55}>
          {patches.slice(0, Math.ceil(healthLevel * patches.length)).map((group, gi) => (
            <g key={gi}>
              {group.map((x, i) => (
                <motion.path key={`${gi}-${i}`}
                  d={`M${x},${272 - (gi % 2) * 3} q${1 + (i % 2)},${-7 - (i % 3)} ${(i % 2 === 0 ? -2 : 3)},${-11 - (gi % 3)}`}
                  stroke={`hsl(${135 + (gi % 3) * 5}, ${32 + (i % 2) * 8}%, ${42 + (gi % 4) * 4}%)`}
                  strokeWidth="1" fill="none" strokeLinecap="round"
                  animate={{ rotate: [0, (i % 2 === 0 ? 2 : -2), 0] }}
                  transition={{ duration: 3 + (gi % 2), repeat: Infinity, delay: i * 0.15 }}
                  style={{ transformOrigin: `${x}px 272px` }} />
              ))}
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ─── SavingsFlowersLayer ─────────────────────────────────────────────────────

const FlowerCluster = ({ x, y, count, colors, onTap, isNew }: {
  x: number; y: number; count: number; colors: string[]; onTap: () => void; isNew?: boolean;
}) => {
  const positions = [
    { dx: 0, dy: 0, scale: 1 },
    { dx: -12, dy: 5, scale: 0.85 },
    { dx: 14, dy: 3, scale: 0.9 },
    { dx: -6, dy: 10, scale: 0.75 },
    { dx: 8, dy: 8, scale: 0.8 },
  ];
  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Savings meadow">
      {positions.slice(0, count).map((pos, i) => (
        <motion.g key={i}
          initial={{ scale: 0 }}
          animate={{ scale: isNew && i === count - 1 ? [0, 1.3, pos.scale] : pos.scale }}
          transition={{ delay: 0.4 + i * 0.1, duration: isNew && i === count - 1 ? 0.8 : 0.5, type: "spring" }}
          style={{ transformOrigin: `${x + pos.dx}px ${y + pos.dy + 15}px` }}>
          {/* Stem */}
          <motion.path
            d={`M${x + pos.dx},${y + pos.dy + 15} Q${x + pos.dx + (i % 2 === 0 ? 1 : -1)},${y + pos.dy + 6} ${x + pos.dx},${y + pos.dy}`}
            stroke="hsl(140, 35%, 42%)" strokeWidth={1.2 * pos.scale} fill="none" strokeLinecap="round"
            animate={{ d: [
              `M${x + pos.dx},${y + pos.dy + 15} Q${x + pos.dx + 1},${y + pos.dy + 6} ${x + pos.dx},${y + pos.dy}`,
              `M${x + pos.dx},${y + pos.dy + 15} Q${x + pos.dx - 1},${y + pos.dy + 6} ${x + pos.dx + 0.5},${y + pos.dy}`,
              `M${x + pos.dx},${y + pos.dy + 15} Q${x + pos.dx + 1},${y + pos.dy + 6} ${x + pos.dx},${y + pos.dy}`,
            ] }}
            transition={{ duration: 4 + i, repeat: Infinity }} />
          {/* Leaf */}
          <ellipse cx={x + pos.dx + 4 * pos.scale} cy={y + pos.dy + 10}
            rx={4 * pos.scale} ry={2 * pos.scale}
            fill="hsl(140, 38%, 48%)" opacity={0.7}
            transform={`rotate(-30, ${x + pos.dx + 4}, ${y + pos.dy + 10})`} />
          {/* Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle, j) => (
            <motion.ellipse key={j}
              cx={x + pos.dx + Math.cos((angle * Math.PI) / 180) * 4 * pos.scale}
              cy={y + pos.dy + Math.sin((angle * Math.PI) / 180) * 4 * pos.scale}
              rx={3.5 * pos.scale} ry={5.5 * pos.scale}
              fill={colors[i % colors.length]} opacity={0.82}
              transform={`rotate(${angle}, ${x + pos.dx + Math.cos((angle * Math.PI) / 180) * 4 * pos.scale}, ${y + pos.dy + Math.sin((angle * Math.PI) / 180) * 4 * pos.scale})`}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: j * 0.3 }} />
          ))}
          <circle cx={x + pos.dx} cy={y + pos.dy} r={2.5 * pos.scale} fill="hsl(43, 88%, 62%)" />
        </motion.g>
      ))}
      {isNew && (
        <motion.circle cx={x} cy={y - 5} r="18"
          fill="none" stroke="hsl(43, 90%, 70%)" strokeWidth="1.5" filter="url(#gs-softGlow)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.5, 2] }}
          transition={{ duration: 1.2, delay: 0.5 }} />
      )}
    </g>
  );
};

const SavingsFlowersLayer = ({ savingsRate, onTap, isNew }: { savingsRate: number; onTap: () => void; isNew?: boolean }) => {
  const clusterCount = savingsRate < 10 ? 1 : savingsRate < 20 ? 2 : savingsRate < 35 ? 3 : 4;
  const flowersPerCluster = savingsRate < 15 ? 2 : savingsRate < 30 ? 3 : savingsRate < 45 ? 4 : 5;
  const colors = [
    ["hsl(340, 52%, 75%)", "hsl(350, 48%, 78%)", "hsl(330, 45%, 72%)"],
    ["hsl(280, 40%, 74%)", "hsl(295, 38%, 76%)", "hsl(270, 42%, 72%)"],
    ["hsl(20, 55%, 78%)", "hsl(35, 50%, 76%)", "hsl(15, 52%, 74%)"],
    ["hsl(310, 42%, 75%)", "hsl(320, 40%, 77%)", "hsl(300, 38%, 73%)"],
  ];
  const clusters = [
    { x: 55, y: 248 }, { x: 95, y: 252 }, { x: 70, y: 260 }, { x: 115, y: 258 },
  ];

  return (
    <g>
      {clusters.slice(0, clusterCount).map((c, i) => (
        <FlowerCluster key={i} x={c.x} y={c.y}
          count={flowersPerCluster} colors={colors[i]}
          onTap={onTap} isNew={isNew && i === clusterCount - 1} />
      ))}
    </g>
  );
};

// ─── EmergencyPondLayer ──────────────────────────────────────────────────────

const EmergencyPondLayer = ({ months, onTap, isNew }: { months: number; onTap: () => void; isNew?: boolean }) => {
  if (months < 0.5) {
    return (
      <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Emergency fund">
        <ellipse cx="200" cy="268" rx="35" ry="10" fill="hsl(30, 22%, 48%)" opacity={0.5} />
        <path d="M185,265 L188,272 M195,263 L198,275 M205,264 L203,273 M215,266 L212,274"
          stroke="hsl(30, 18%, 38%)" strokeWidth="1" opacity={0.4} />
        <text x="200" y="280" textAnchor="middle" fontSize="8" fill="hsl(30, 20%, 55%)" opacity={0.5}>Empty</text>
      </g>
    );
  }

  const size = months < 2 ? 0.5 : months < 4 ? 0.75 : months < 6 ? 0.9 : 1;
  const hasRipples = months >= 3;
  const hasReeds = months >= 2;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Emergency fund">
      <ellipse cx="200" cy="272" rx={50 * size} ry={14 * size} fill="hsl(200, 20%, 45%)" opacity={0.1} />
      <motion.ellipse cx="200" cy="268" rx={46 * size} ry={13 * size}
        fill="url(#gs-pondGrad)" opacity={0.8}
        initial={{ scale: 0 }}
        animate={{ scale: isNew ? [0, 1.12, 1] : 1 }}
        transition={{ delay: 0.6, duration: isNew ? 0.8 : 0.5, type: "spring" }} />
      <motion.ellipse cx="197" cy="266" rx={30 * size} ry={7 * size}
        fill="hsl(200, 62%, 88%)" opacity={0.4}
        animate={{ rx: [30 * size, 32 * size, 30 * size] }}
        transition={{ duration: 4.5, repeat: Infinity }} />
      {hasRipples && (
        <>
          <motion.ellipse cx="200" cy="268" rx={15} ry={4}
            fill="none" stroke="hsl(200, 50%, 82%)" strokeWidth="0.5"
            animate={{ rx: [10, 35, 10], ry: [3, 9, 3], opacity: [0.5, 0.08, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity }} />
          <motion.ellipse cx="200" cy="268" rx={8} ry={2}
            fill="none" stroke="hsl(200, 55%, 80%)" strokeWidth="0.4"
            animate={{ rx: [6, 25, 6], ry: [2, 6, 2], opacity: [0.4, 0.05, 0.4] }}
            transition={{ duration: 3.8, repeat: Infinity, delay: 1.2 }} />
        </>
      )}
      {hasReeds && (
        <g opacity={0.5}>
          {[{ x: 200 - 42 * size, h: 16 }, { x: 200 - 46 * size, h: 12 }, { x: 200 + 44 * size, h: 14 }].map((r, i) => (
            <motion.line key={i} x1={r.x} y1={268} x2={r.x + 1} y2={268 - r.h}
              stroke="hsl(130, 28%, 48%)" strokeWidth="1" strokeLinecap="round"
              animate={{ x2: [r.x + 1, r.x - 0.5, r.x + 1] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.4 }} />
          ))}
        </g>
      )}
      {isNew && (
        <motion.ellipse cx="200" cy="268" rx={55 * size} ry={18 * size}
          fill="none" stroke="hsl(200, 60%, 70%)" strokeWidth="2" filter="url(#gs-softGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.25, 1.4] }}
          transition={{ duration: 1.4, delay: 0.4 }} />
      )}
    </g>
  );
};

// ─── InvestmentTreesLayer ────────────────────────────────────────────────────

const TreeElement = ({ x, y, height, onTap, isNew, variant = 0 }: {
  x: number; y: number; height: number; onTap: () => void; isNew?: boolean; variant?: number;
}) => {
  const trunkH = 30 + height * 50;
  const canopyR = 14 + height * 24;
  const leafHue = variant === 0 ? 152 : 145;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Investment grove">
      <ellipse cx={x + 6} cy={y + 2} rx={canopyR * 0.5} ry={3} fill="hsl(152, 15%, 30%)" opacity={0.1} />
      <motion.rect x={x - 4} y={y - trunkH} width={8} height={trunkH} rx="3"
        fill="url(#gs-trunkGrad)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isNew ? [0, 1.08, 1] : 1 }}
        style={{ transformOrigin: `${x}px ${y}px` }}
        transition={{ delay: 0.5, duration: isNew ? 1 : 0.7 }} />
      <motion.path
        d={`M${x},${y - trunkH * 0.55} Q${x + 10},${y - trunkH * 0.65} ${x + 15},${y - trunkH * 0.6}`}
        stroke="hsl(30, 30%, 38%)" strokeWidth="1.8" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }} />
      <motion.ellipse cx={x - canopyR * 0.25} cy={y - trunkH + 3}
        rx={canopyR * 0.65} ry={canopyR * 0.55}
        fill={`hsl(${leafHue}, 30%, 50%)`} opacity={0.7}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.4, type: "spring" }} />
      <motion.ellipse cx={x + canopyR * 0.2} cy={y - trunkH - canopyR * 0.2}
        rx={canopyR * 0.8} ry={canopyR * 0.7}
        fill={`hsl(${leafHue}, 32%, 46%)`} opacity={0.85}
        initial={{ scale: 0 }} animate={{ scale: isNew ? [0, 1.1, 1] : 1 }}
        transition={{ delay: 1.1, duration: 0.5, type: "spring" }} />
      <motion.ellipse cx={x} cy={y - trunkH - canopyR * 0.5}
        rx={canopyR} ry={canopyR * 0.75}
        fill={`hsl(${leafHue}, 35%, 42%)`} opacity={0.9}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 1.2, duration: 0.45, type: "spring" }} />
      <ellipse cx={x - canopyR * 0.15} cy={y - trunkH - canopyR * 0.55}
        rx={canopyR * 0.3} ry={canopyR * 0.22}
        fill={`hsl(${leafHue}, 38%, 55%)`} opacity={0.35} />
      <motion.ellipse cx={x + canopyR * 0.45} cy={y - trunkH - canopyR * 0.25}
        rx={canopyR * 0.45} ry={canopyR * 0.38}
        fill={`hsl(${leafHue + 6}, 28%, 52%)`} opacity={0.45}
        animate={{ cx: [x + canopyR * 0.45, x + canopyR * 0.48, x + canopyR * 0.45] }}
        transition={{ duration: 5.5, repeat: Infinity }} />
      {isNew && (
        <motion.circle cx={x} cy={y - trunkH - canopyR * 0.4} r={canopyR + 10}
          fill="none" stroke="hsl(152, 50%, 58%)" strokeWidth="2" filter="url(#gs-softGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.8, 1.2, 1.4] }}
          transition={{ duration: 1.4, delay: 1.3 }} />
      )}
    </g>
  );
};

const SaplingElement = ({ x, y, onTap }: { x: number; y: number; onTap: () => void }) => (
  <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Investment grove">
    <motion.path d={`M${x},${y} Q${x},${y - 12} ${x},${y - 20}`}
      stroke="hsl(30, 30%, 42%)" strokeWidth="2" fill="none" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }} />
    <motion.ellipse cx={x} cy={y - 26} rx="10" ry="12"
      fill="hsl(150, 32%, 50%)" opacity={0.85}
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5, type: "spring" }} />
    <ellipse cx={x - 2} cy={y - 28} rx="4" ry="5" fill="hsl(150, 35%, 58%)" opacity={0.4} />
  </g>
);

const InvestmentTreesLayer = ({ investmentValue, onTap, isNew }: {
  investmentValue: number; onTap: () => void; isNew?: boolean;
}) => {
  const treeHeight = Math.min(investmentValue / 100, 1);

  if (investmentValue < 20) {
    return <SaplingElement x={340} y={270} onTap={onTap} />;
  }

  const treeCount = investmentValue < 40 ? 1 : investmentValue < 70 ? 2 : 3;
  return (
    <g>
      <TreeElement x={340} y={270} height={treeHeight} onTap={onTap} isNew={isNew} />
      {treeCount >= 2 && <TreeElement x={365} y={272} height={treeHeight * 0.7} onTap={onTap} variant={1} />}
      {treeCount >= 3 && <SaplingElement x={318} y={273} onTap={onTap} />}
    </g>
  );
};

// ─── DebtWeedsLayer ──────────────────────────────────────────────────────────

const Weed = ({ x, y, opacity, isDisappearing }: {
  x: number; y: number; opacity: number; isDisappearing?: boolean;
}) => {
  if (opacity <= 0) return null;
  return (
    <motion.g
      initial={{ opacity: isDisappearing ? opacity + 0.3 : 0 }}
      animate={{ opacity: isDisappearing ? 0 : opacity }}
      transition={{ delay: isDisappearing ? 0 : 0.4, duration: isDisappearing ? 1.2 : 0.35 }}>
      <path d={`M${x},${y} Q${x - 3},${y - 9} ${x - 6},${y - 14} M${x},${y} Q${x + 2},${y - 8} ${x + 4},${y - 12}`}
        stroke="hsl(50, 28%, 52%)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx={x - 6} cy={y - 15} r="1.2" fill="hsl(50, 22%, 58%)" />
      <circle cx={x + 4} cy={y - 13} r="0.9" fill="hsl(50, 22%, 58%)" />
      {isDisappearing && (
        <motion.g>
          {[0, 1, 2].map(i => (
            <motion.circle key={i} cx={x + (i - 1) * 3} cy={y - 6} r="2"
              fill="hsl(152, 45%, 72%)"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.65, 0], y: [-3, -18], x: [(i - 1) * 2, (i - 1) * 5] }}
              transition={{ duration: 0.9, delay: i * 0.12 }} />
          ))}
        </motion.g>
      )}
    </motion.g>
  );
};

const DebtWeedsLayer = ({ debtRatio, onTap, isDisappearing }: {
  debtRatio: number; onTap: () => void; isDisappearing?: boolean;
}) => {
  const weedOpacity = Math.min(debtRatio / 100, 0.75);
  const weedCount = debtRatio < 20 ? 1 : debtRatio < 50 ? 3 : debtRatio < 75 ? 5 : 7;
  const positions = [
    { x: 155, y: 276 }, { x: 180, y: 278 }, { x: 220, y: 277 },
    { x: 245, y: 279 }, { x: 168, y: 280 }, { x: 205, y: 281 }, { x: 232, y: 280 },
  ];

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Debt health">
      {debtRatio > 40 && (
        <ellipse cx="200" cy="278" rx={35 + debtRatio * 0.3} ry={6}
          fill="hsl(30, 20%, 38%)" opacity={0.15 + (debtRatio / 100) * 0.15} />
      )}
      {positions.slice(0, weedCount).map((pos, i) => (
        <Weed key={i} x={pos.x} y={pos.y}
          opacity={weedOpacity * (1 - i * 0.08)}
          isDisappearing={isDisappearing && i === 0} />
      ))}
    </g>
  );
};

// ─── Environmental Signals ───────────────────────────────────────────────────

const Butterfly = ({ delay, color = 0 }: { delay: number; color?: number }) => {
  const hue1 = color === 0 ? 245 : color === 1 ? 315 : 195;
  const hue2 = color === 0 ? 330 : color === 1 ? 38 : 265;
  return (
    <motion.g initial={{ opacity: 0, x: 30, y: 140 }}
      animate={{ opacity: [0, 1, 1, 1, 0], x: [30, 90, 180, 280, 380], y: [140, 95, 115, 75, 50] }}
      transition={{ delay, duration: 14, repeat: Infinity, repeatDelay: 10, ease: "easeInOut" }}>
      <motion.path d="M0,-3 Q-8,-10 -5,-3 Q-8,4 0,3 Z"
        fill={`hsl(${hue1}, 38%, 70%)`} opacity={0.75}
        animate={{ d: ["M0,-3 Q-8,-10 -5,-3 Q-8,4 0,3 Z", "M0,-1 Q-4,-4 -2.5,-1 Q-4,2.5 0,1 Z"] }}
        transition={{ duration: 0.22, repeat: Infinity, repeatType: "reverse" }} />
      <motion.path d="M0,-3 Q8,-10 5,-3 Q8,4 0,3 Z"
        fill={`hsl(${hue2}, 42%, 72%)`} opacity={0.75}
        animate={{ d: ["M0,-3 Q8,-10 5,-3 Q8,4 0,3 Z", "M0,-1 Q4,-4 2.5,-1 Q4,2.5 0,1 Z"] }}
        transition={{ duration: 0.22, repeat: Infinity, repeatType: "reverse" }} />
      <circle cx="0" cy="0" r="0.7" fill="hsl(0, 0%, 30%)" />
    </motion.g>
  );
};

const Bee = ({ delay }: { delay: number }) => (
  <motion.g initial={{ opacity: 0, x: 60, y: 250 }}
    animate={{ opacity: [0, 1, 1, 0], x: [60, 85, 105, 120], y: [250, 238, 242, 230] }}
    transition={{ delay, duration: 6, repeat: Infinity, repeatDelay: 12 }}>
    <ellipse cx="0" cy="0" rx="3" ry="2" fill="hsl(48, 85%, 55%)" />
    <rect x="-2" y="-2" width="1.5" height="4" fill="hsl(0, 0%, 15%)" />
    <rect x="0.5" y="-2" width="1.5" height="4" fill="hsl(0, 0%, 15%)" />
    <motion.ellipse cx="-2" cy="-1" rx="2" ry="1" fill="hsl(200, 20%, 90%)" opacity={0.6}
      animate={{ ry: [1, 0.3, 1] }} transition={{ duration: 0.08, repeat: Infinity }} />
    <motion.ellipse cx="2" cy="-1" rx="2" ry="1" fill="hsl(200, 20%, 90%)" opacity={0.6}
      animate={{ ry: [1, 0.3, 1] }} transition={{ duration: 0.08, repeat: Infinity, delay: 0.04 }} />
  </motion.g>
);

const FloatingMotes = ({ count }: { count: number }) => {
  if (count < 1) return null;
  const motes = [
    { x: 45, y: 210, endY: 140 }, { x: 160, y: 225, endY: 155 },
    { x: 290, y: 200, endY: 130 }, { x: 100, y: 215, endY: 145 },
    { x: 350, y: 205, endY: 125 },
  ];
  return (
    <g>
      {motes.slice(0, count).map((m, i) => (
        <motion.circle key={i} cx={m.x} cy={m.y} r="1.5" fill="hsl(43, 85%, 80%)" opacity={0}
          animate={{ cy: [m.y, m.endY, m.y], cx: [m.x, m.x + 12, m.x], opacity: [0, 0.45, 0] }}
          transition={{ duration: 8 + i, repeat: Infinity, delay: i * 2.5 }} />
      ))}
    </g>
  );
};

// ─── Seed Scene ──────────────────────────────────────────────────────────────

const SeedScene = () => (
  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
    <ellipse cx="200" cy="270" rx="30" ry="8" fill="hsl(30, 28%, 45%)" opacity={0.5} />
    <ellipse cx="200" cy="268" rx="20" ry="5" fill="hsl(30, 32%, 40%)" opacity={0.6} />
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
      <ellipse cx="200" cy="262" rx="3.5" ry="5" fill="hsl(30, 40%, 38%)" />
      <motion.path d="M200,256 Q200,248 201,242"
        stroke="hsl(135, 42%, 52%)" strokeWidth="1.2" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 1, duration: 1.8 }} />
      <motion.ellipse cx="203" cy="240" rx="4" ry="6"
        fill="hsl(135, 38%, 55%)" opacity={0}
        animate={{ opacity: [0, 0.8], scale: [0.5, 1] }}
        transition={{ delay: 2.2, duration: 0.8 }} />
    </motion.g>
    <text x="200" y="228" textAnchor="middle" fontSize="8"
      fill="hsl(152, 22%, 55%)" opacity={0.45} fontFamily="DM Sans, sans-serif">
      Your journey begins…
    </text>
  </motion.g>
);

// ─── Detail Popover ──────────────────────────────────────────────────────────

const DetailPopover = ({ detail, onClose }: { detail: TapDetail | null; onClose: () => void }) => (
  <AnimatePresence>
    {detail && (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.95 }}
        transition={{ duration: 0.22, type: "spring" }}
        className="absolute bottom-4 left-3 right-3 bg-card/95 backdrop-blur-md border border-border/40 rounded-2xl p-4 shadow-lg z-10"
        onClick={onClose}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <detail.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{detail.emoji}</span>
              <p className="text-sm font-semibold text-foreground">{detail.title}</p>
            </div>
            <p className="text-xs text-muted-foreground">{detail.subtitle}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {detail.stats.map((stat, i) => (
                <div key={i} className="bg-secondary/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-xs font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
            {detail.nextMilestone && (
              <p className="text-[10px] text-primary mt-2.5 font-medium">🎯 Next: {detail.nextMilestone}</p>
            )}
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground/50 text-center mt-2.5">Tap to dismiss</p>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Reusable Component ─────────────────────────────────────────────────

const FinancialGardenScene = ({ gardenState, highlightZones, className }: GardenSceneProps) => {
  const { savingsRate, emergencyFundMonths, investmentValue, debtRatio, userLevel } = gardenState;
  const [activeDetail, setActiveDetail] = useState<TapDetail | null>(null);

  const stage = STAGE_MAP[Math.min(userLevel, 5)] ?? "seed";
  const stageIndex = Math.min(userLevel, 5);
  const healthLevel = Math.min(stageIndex / 5, 1);

  const showSunlight = stageIndex >= 2;
  const cloudCount = stageIndex < 1 ? 0 : stageIndex < 3 ? 1 : stageIndex < 5 ? 2 : 3;
  const butterflyCount = stageIndex >= 2 ? (stageIndex >= 4 ? 2 : 1) : 0;
  const showBees = stageIndex >= 3 && savingsRate >= 20;
  const moteCount = stageIndex >= 2 ? Math.min(stageIndex, 5) : 0;
  const highlights = highlightZones ?? new Set<string>();

  const details: Record<string, TapDetail> = {
    savings: {
      title: "Savings Meadow",
      subtitle: `${savingsRate}% savings rate`,
      emoji: "🌸",
      icon: PiggyBank,
      stats: [
        { label: "Savings Rate", value: `${savingsRate}%` },
        { label: "Target", value: "20%+" },
      ],
      nextMilestone: savingsRate < 20 ? "Reach 20% → More flowers bloom" : savingsRate < 35 ? "Reach 35% → Dense meadow" : undefined,
    },
    pond: {
      title: "Emergency Pond",
      subtitle: `${emergencyFundMonths.toFixed(1)} months coverage`,
      emoji: "💧",
      icon: Shield,
      stats: [
        { label: "Months Covered", value: emergencyFundMonths.toFixed(1) },
        { label: "Target", value: "6 months" },
      ],
      nextMilestone: emergencyFundMonths < 3 ? "Reach 3 months → Pond appears" : emergencyFundMonths < 6 ? "Reach 6 months → Ripples form" : undefined,
    },
    investments: {
      title: "Investment Grove",
      subtitle: `${investmentValue.toFixed(0)}% toward milestone`,
      emoji: "🌳",
      icon: TrendingUp,
      stats: [
        { label: "Growth", value: `${investmentValue.toFixed(0)}%` },
        { label: "Stage", value: investmentValue < 20 ? "Sapling" : investmentValue < 40 ? "Young Tree" : investmentValue < 70 ? "Growing" : "Tall Tree" },
      ],
      nextMilestone: investmentValue < 40 ? "Grow to 40% → Tree grows" : investmentValue < 70 ? "Grow to 70% → Second tree" : undefined,
    },
    debt: {
      title: "Debt Clearing",
      subtitle: debtRatio > 50 ? "Needs attention" : debtRatio > 20 ? "Improving" : "Looking great",
      emoji: "🌿",
      icon: CreditCard,
      stats: [
        { label: "Debt Ratio", value: `${debtRatio.toFixed(0)}%` },
        { label: "Status", value: debtRatio > 50 ? "High" : debtRatio > 20 ? "Moderate" : "Low" },
      ],
      nextMilestone: debtRatio > 50 ? "Reduce debt → Weeds disappear" : debtRatio > 20 ? "Clear more → Garden brightens" : undefined,
    },
  };

  return (
    <div className={className ?? "relative w-full"} style={{ minHeight: 360, maxHeight: 420 }}>
      <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        aria-label="Financial garden visualization">
        <GardenDefs />
        <SkyLayer showSunlight={showSunlight} cloudCount={cloudCount} />
        <GroundLayer healthLevel={healthLevel} />
        <FloatingMotes count={moteCount} />

        {stageIndex === 0 && <SeedScene />}

        {/* Debt Weeds (bottom center) */}
        {stageIndex >= 1 && debtRatio > 0 && (
          <DebtWeedsLayer debtRatio={debtRatio}
            onTap={() => setActiveDetail(details.debt)}
            isDisappearing={highlights.has("weed")} />
        )}

        {/* Emergency Pond (center) */}
        {stageIndex >= 1 && (
          <EmergencyPondLayer months={emergencyFundMonths}
            onTap={() => setActiveDetail(details.pond)}
            isNew={highlights.has("pond")} />
        )}

        {/* Savings Flowers (left) */}
        {stageIndex >= 1 && (
          <SavingsFlowersLayer savingsRate={savingsRate}
            onTap={() => setActiveDetail(details.savings)}
            isNew={highlights.has("flower")} />
        )}

        {/* Investment Trees (right) */}
        {stageIndex >= 2 && (
          <InvestmentTreesLayer investmentValue={investmentValue}
            onTap={() => setActiveDetail(details.investments)}
            isNew={highlights.has("tree")} />
        )}

        {/* Environmental signals */}
        {butterflyCount >= 1 && <Butterfly delay={2.5} color={0} />}
        {butterflyCount >= 2 && <Butterfly delay={8} color={1} />}
        {showBees && <Bee delay={5} />}
      </svg>

      <DetailPopover detail={activeDetail} onClose={() => setActiveDetail(null)} />
    </div>
  );
};

export default FinancialGardenScene;
