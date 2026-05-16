import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Institution {
  id: string;
  name: string;
  provider: string;
  logo_url: string | null;
  institution_type: string;
}

export interface Account {
  id: string;
  user_id: string;
  institution_id: string;
  account_type: string;
  account_subtype: string | null;
  nickname: string;
  balance: number;
  currency: string;
  is_manual: boolean;
  last_synced_at: string | null;
  institution?: Institution;
}

export interface GoalAccount {
  id: string;
  user_id: string;
  goal_name: string;
  account_id: string;
}

export const useAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [goalAccounts, setGoalAccounts] = useState<GoalAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [accountsRes, institutionsRes, goalAccountsRes] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", user.id),
      supabase.from("institutions").select("*"),
      supabase.from("goal_accounts").select("*").eq("user_id", user.id),
    ]);

    const instMap = new Map<string, Institution>();
    (institutionsRes.data || []).forEach((i: any) => instMap.set(i.id, i));
    setInstitutions(institutionsRes.data || []);

    const enriched = (accountsRes.data || []).map((a: any) => ({
      ...a,
      balance: Number(a.balance),
      institution: instMap.get(a.institution_id),
    }));
    setAccounts(enriched);
    setGoalAccounts(goalAccountsRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const connectInstitution = async (institutionId: string, mockAccounts: { nickname: string; account_type: string; balance: number }[]) => {
    if (!user) return;
    const inserts = mockAccounts.map((a) => ({
      user_id: user.id,
      institution_id: institutionId,
      nickname: a.nickname,
      account_type: a.account_type,
      balance: a.balance,
      is_manual: false,
    }));
    await supabase.from("accounts").insert(inserts);
    await fetchData();
  };

  const addManualAccount = async (data: { nickname: string; account_type: string; balance: number; institution_id: string }) => {
    if (!user) return;
    await supabase.from("accounts").insert({ ...data, user_id: user.id, is_manual: true });
    await fetchData();
  };

  const deleteAccount = async (accountId: string) => {
    await supabase.from("accounts").delete().eq("id", accountId);
    await fetchData();
  };

  const assignGoal = async (accountId: string, goalName: string) => {
    if (!user) return;
    // Remove existing assignment for this account+goal
    await supabase.from("goal_accounts").delete().eq("account_id", accountId).eq("goal_name", goalName);
    await supabase.from("goal_accounts").insert({ user_id: user.id, account_id: accountId, goal_name: goalName });
    await fetchData();
  };

  const removeGoalAssignment = async (goalAccountId: string) => {
    await supabase.from("goal_accounts").delete().eq("id", goalAccountId);
    await fetchData();
  };

  const refreshAccount = async (accountId: string) => {
    await supabase.from("accounts").update({ last_synced_at: new Date().toISOString() }).eq("id", accountId);
    await fetchData();
  };

  return { accounts, institutions, goalAccounts, loading, refetch: fetchData, connectInstitution, addManualAccount, deleteAccount, assignGoal, removeGoalAssignment, refreshAccount };
};
