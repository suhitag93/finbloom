import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number | null;
  target_date: string | null;
  linked_account_id: string | null;
  status: string;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  milestone_pct: number;
  reached_at: string;
  xp_awarded: number;
}

const MILESTONE_XP: Record<number, number> = { 25: 50, 50: 100, 75: 150, 100: 300 };

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [goalsRes, milestonesRes] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("goal_milestones").select("*").eq("user_id", user.id),
    ]);
    setGoals((goalsRes.data || []).map((g: any) => ({
      ...g,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount),
      monthly_contribution: g.monthly_contribution ? Number(g.monthly_contribution) : null,
    })));
    setMilestones(milestonesRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = async (goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const { error } = await supabase.from("goals").insert({ ...goal, user_id: user.id });
    if (error) { toast.error("Failed to create goal"); return; }
    toast.success("Goal created! 🌱 +100 XP");
    // Award XP via secure server-side function
    await supabase.rpc("award_xp", {
      p_user_id: user.id, p_xp_amount: 100, p_source_type: "goal_created",
      p_reason: `Created goal: ${goal.title}`,
    });
    await fetchGoals();
  };

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    if (!user) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    await supabase.from("goals").update({ current_amount: newAmount }).eq("id", goalId);

    // Check milestones
    const pct = Math.min(Math.round((newAmount / goal.target_amount) * 100), 100);
    const existingPcts = new Set(milestones.filter((m) => m.goal_id === goalId).map((m) => m.milestone_pct));

    for (const threshold of [25, 50, 75, 100]) {
      if (pct >= threshold && !existingPcts.has(threshold)) {
        const xp = MILESTONE_XP[threshold];
        await supabase.from("goal_milestones").insert({
          goal_id: goalId, user_id: user.id, milestone_pct: threshold, xp_awarded: xp,
        });
        await supabase.from("xp_ledger").insert({
          user_id: user.id, xp_amount: xp, source_type: "goal_milestone",
          source_id: goalId, reason: `Reached ${threshold}% on ${goal.title}`,
        });
        const emoji = threshold === 100 ? "🎉" : threshold === 75 ? "🌸" : threshold === 50 ? "🌿" : "🌱";
        toast.success(`${emoji} ${threshold}% milestone! +${xp} XP`);
      }
    }

    if (pct >= 100) {
      await supabase.from("goals").update({ status: "completed" }).eq("id", goalId);
    }

    await fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    await supabase.from("goals").delete().eq("id", goalId);
    toast.success("Goal removed");
    await fetchGoals();
  };

  const syncGoalProgress = async (goalId: string) => {
    if (!user) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal?.linked_account_id) { toast.error("No linked account"); return; }

    const { data: account } = await supabase.from("accounts").select("balance").eq("id", goal.linked_account_id).single();
    if (account) {
      await updateGoalProgress(goalId, Math.max(0, Number(account.balance)));
      toast.success("Progress synced!");
    }
  };

  return { goals, milestones, loading, createGoal, updateGoalProgress, deleteGoal, syncGoalProgress, refetch: fetchGoals };
};
