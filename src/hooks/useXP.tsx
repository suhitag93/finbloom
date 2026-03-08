import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  getLevelForXP,
  getNextLevel,
  getLevelProgress,
  getStreakMultiplier,
  LEVELS,
  type XPLevel,
} from "@/lib/xp-system";

export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  xpBonus: number;
  category: string;
  earned: boolean;
  earnedDate?: string;
}

export const useXP = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [totalXP, setTotalXP] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Use profile xp_points if available (kept in sync by DB trigger)
    const xp = (profile as any)?.xp_points ?? 0;
    setTotalXP(xp);

    // Fetch all achievements + user's earned ones
    const [{ data: allAchievements }, { data: userAchievements }] = await Promise.all([
      supabase.from("achievements").select("*"),
      supabase.from("user_achievements").select("achievement_id, earned_at").eq("user_id", user.id),
    ]);

    const earnedMap = new Map(
      (userAchievements ?? []).map((ua: any) => [ua.achievement_id, ua.earned_at])
    );

    const mapped: Badge[] = (allAchievements ?? []).map((a: any) => ({
      id: a.id,
      title: a.name,
      emoji: a.badge_icon ?? "🏆",
      description: a.description ?? "",
      xpBonus: a.xp_reward,
      category: a.category,
      earned: earnedMap.has(a.id),
      earnedDate: earnedMap.get(a.id),
    }));

    setBadges(mapped);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentLevel = getLevelForXP(totalXP);
  const nextLevel = getNextLevel(totalXP);
  const progress = getLevelProgress(totalXP);

  const streakDays = 12; // TODO: implement streak tracking
  const multiplier = getStreakMultiplier(streakDays);

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
    loading,
    refetch: fetchData,
  };
};
