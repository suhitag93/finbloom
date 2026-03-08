// FinBloom XP & Level System
// XP rewards positive financial behaviors, not just app usage.

export interface XPLevel {
  id: number;
  title: string;
  emoji: string;
  xpRequired: number;
  focus: string;
  unlocks: string[];
}

export const LEVELS: XPLevel[] = [
  {
    id: 0, title: "Seed", emoji: "🌱", xpRequired: 0, focus: "Financial awareness",
    unlocks: ["Spending insights", "Basic budgeting", "Emergency fund mission"],
  },
  {
    id: 1, title: "Sprout", emoji: "🌿", xpRequired: 500, focus: "Budget control",
    unlocks: ["Savings automation", "Subscription detector", "Spending trend reports"],
  },
  {
    id: 2, title: "Bloom", emoji: "🌸", xpRequired: 1500, focus: "Saving habits",
    unlocks: ["Investment education", "Net worth tracking", "Wealth projections"],
  },
  {
    id: 3, title: "Thrive", emoji: "🌳", xpRequired: 4000, focus: "Investing",
    unlocks: ["Portfolio analytics", "Retirement forecasting", "Tax optimization tips"],
  },
  {
    id: 4, title: "Flourish", emoji: "🌺", xpRequired: 8000, focus: "Wealth building",
    unlocks: ["Advanced investment simulations", "Financial independence calculator", "Passive income planning"],
  },
  {
    id: 5, title: "Legacy", emoji: "👑", xpRequired: 15000, focus: "Advanced wealth strategy",
    unlocks: ["Estate planning insights", "Generational wealth tools", "Legacy dashboard"],
  },
];

export interface XPAction {
  id: string;
  label: string;
  xp: number;
  category: "onboarding" | "banking" | "saving" | "investing" | "engagement" | "debt";
}

export const XP_ACTIONS: XPAction[] = [
  { id: "complete_onboarding", label: "Complete onboarding", xp: 100, category: "onboarding" },
  { id: "connect_bank", label: "Connect bank accounts", xp: 200, category: "banking" },
  { id: "categorize_txn", label: "Categorize transactions", xp: 10, category: "banking" },
  { id: "set_goals", label: "Set financial goals", xp: 50, category: "onboarding" },
  { id: "complete_mission", label: "Complete weekly mission", xp: 75, category: "engagement" },
  { id: "save_100", label: "Save $100", xp: 40, category: "saving" },
  { id: "pay_debt", label: "Pay down debt", xp: 50, category: "debt" },
  { id: "increase_savings", label: "Increase savings rate", xp: 100, category: "saving" },
  { id: "start_investing", label: "Start investing", xp: 250, category: "investing" },
  { id: "login_streak_3", label: "3-day login streak", xp: 20, category: "engagement" },
];

export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  xpBonus: number;
  category: "savings" | "debt" | "investing" | "milestones" | "engagement";
  earned: boolean;
  earnedDate?: string;
}

export const ALL_BADGES: Badge[] = [
  // Savings
  { id: "first_500", title: "First Drop", emoji: "💧", description: "Save your first $500", xpBonus: 50, category: "savings", earned: true, earnedDate: "2026-02-15" },
  { id: "emergency_5k", title: "Safety Net", emoji: "🌊", description: "$5K emergency fund", xpBonus: 150, category: "savings", earned: true, earnedDate: "2026-03-01" },
  { id: "six_months", title: "Island Secure", emoji: "🏝", description: "6 months expenses saved", xpBonus: 300, category: "savings", earned: false },
  // Debt
  { id: "first_cc_paid", title: "Chain Breaker", emoji: "🔓", description: "First credit card paid off", xpBonus: 100, category: "debt", earned: true, earnedDate: "2026-01-20" },
  { id: "debt_slayer", title: "Debt Slayer", emoji: "⚔️", description: "$10K debt cleared", xpBonus: 250, category: "debt", earned: false },
  // Investing
  { id: "first_investment", title: "Seed Investor", emoji: "🌱", description: "Made your first investment", xpBonus: 150, category: "investing", earned: true, earnedDate: "2026-02-28" },
  { id: "portfolio_50k", title: "Growth Engine", emoji: "📈", description: "$50K portfolio value", xpBonus: 500, category: "investing", earned: false },
  { id: "net_worth_100k", title: "Six Figures", emoji: "🚀", description: "$100K net worth", xpBonus: 1000, category: "investing", earned: false },
  // Milestones
  { id: "nw_10k", title: "Foundation", emoji: "🧱", description: "$10K net worth", xpBonus: 500, category: "milestones", earned: true, earnedDate: "2026-02-10" },
  { id: "nw_50k", title: "Momentum", emoji: "⚡", description: "$50K net worth", xpBonus: 1000, category: "milestones", earned: false },
  // Engagement
  { id: "streak_7", title: "Week Warrior", emoji: "🔥", description: "7-day login streak", xpBonus: 30, category: "engagement", earned: true, earnedDate: "2026-03-05" },
  { id: "streak_30", title: "Monthly Master", emoji: "💎", description: "30-day login streak", xpBonus: 100, category: "engagement", earned: false },
  { id: "mission_10", title: "Mission Maven", emoji: "🎯", description: "Complete 10 missions", xpBonus: 75, category: "engagement", earned: true, earnedDate: "2026-03-07" },
];

/** Get level for a given XP total */
export function getLevelForXP(xp: number): XPLevel {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) level = l;
    else break;
  }
  return level;
}

/** Get next level (or null if max) */
export function getNextLevel(xp: number): XPLevel | null {
  const current = getLevelForXP(xp);
  const next = LEVELS.find((l) => l.xpRequired > current.xpRequired);
  return next || null;
}

/** Progress percentage toward next level */
export function getLevelProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.xpRequired - current.xpRequired;
  const progress = xp - current.xpRequired;
  return Math.min(100, Math.round((progress / range) * 100));
}

/** Streak multiplier */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 7) return 1.2;
  if (streakDays >= 3) return 1.1;
  return 1.0;
}
