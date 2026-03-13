import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  mission_type: string;
  difficulty: string;
  xp_reward: number;
  progress: number;
  completed: boolean;
}

export const useMissions = () => {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const prevCompletedRef = useRef<Set<string>>(new Set());

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: allMissions }, { data: userMissions }] = await Promise.all([
      supabase.from("missions").select("*").eq("is_active", true),
      supabase.from("user_missions").select("*").eq("user_id", user.id),
    ]);

    const progressMap = new Map(
      (userMissions ?? []).map((um: any) => [um.mission_id, um])
    );

    const mapped: Mission[] = (allMissions ?? []).map((m: any) => {
      const um = progressMap.get(m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        mission_type: m.mission_type,
        difficulty: m.difficulty,
        xp_reward: m.xp_reward,
        progress: um?.progress_value ?? 0,
        completed: um?.completed ?? false,
      };
    });

    // Detect newly completed missions
    const prevCompleted = prevCompletedRef.current;
    mapped.forEach((m) => {
      if (m.completed && !prevCompleted.has(m.id)) {
        track("mission_completed", {
          mission_id: m.id,
          mission_type: m.mission_type,
          xp_earned: m.xp_reward,
        });
      }
    });
    prevCompletedRef.current = new Set(mapped.filter((m) => m.completed).map((m) => m.id));

    setMissions(mapped);
    setLoading(false);
  }, [user, track]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const activeMissions = missions.filter((m) => !m.completed);
  const completedMissions = missions.filter((m) => m.completed);

  return { missions, activeMissions, completedMissions, loading, refetch: fetchMissions };
};
