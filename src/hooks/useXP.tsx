import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import {
  getLevelForXP,
  getNextLevel,
  getLevelProgress,
  getStreakMultiplier,
  ALL_BADGES,
  type Badge,
} from "@/lib/xp-system";

/**
 * Mock XP hook — simulates XP based on profile completeness.
 * In a real implementation this would query an xp_transactions table.
 */
export const useXP = () => {
  const { profile } = useProfile();

  const data = useMemo(() => {
    // Simulate XP from onboarding & profile data
    let xp = 0;
    if (profile?.onboarding_completed) xp += 100;
    if (profile?.connected_bank) xp += 200;
    if (profile?.goals && profile.goals.length > 0) xp += 50;
    if (profile?.financial_accounts && profile.financial_accounts.length > 0) xp += 50 * profile.financial_accounts.length;
    // Add mock XP for demo richness
    xp += 820;

    const streakDays = 12; // mock
    const multiplier = getStreakMultiplier(streakDays);
    const totalXP = Math.round(xp * multiplier);

    const currentLevel = getLevelForXP(totalXP);
    const nextLevel = getNextLevel(totalXP);
    const progress = getLevelProgress(totalXP);

    const badges: Badge[] = ALL_BADGES;
    const earnedBadges = badges.filter((b) => b.earned);
    const lockedBadges = badges.filter((b) => !b.earned);

    return {
      totalXP,
      currentLevel,
      nextLevel,
      progress,
      streakDays,
      multiplier,
      badges,
      earnedBadges,
      lockedBadges,
    };
  }, [profile]);

  return data;
};
