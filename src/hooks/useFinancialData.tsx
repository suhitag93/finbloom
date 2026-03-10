import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  merchant_name: string | null;
  amount: number;
  date: string;
  category: string;
  subcategory: string | null;
  pending: boolean;
}

export interface InvestmentHolding {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string | null;
  name: string | null;
  quantity: number;
  current_value: number;
  cost_basis: number;
}

export interface Liability {
  id: string;
  user_id: string;
  account_id: string;
  liability_type: string;
  balance: number;
  minimum_payment: number;
  apr: number;
}

export const useFinancialData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [txRes, holdRes, liabRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(500),
      supabase.from("investment_holdings").select("*").eq("user_id", user.id),
      supabase.from("liabilities").select("*").eq("user_id", user.id),
    ]);

    setTransactions((txRes.data || []).map((t: any) => ({ ...t, amount: Number(t.amount) })));
    setHoldings((holdRes.data || []).map((h: any) => ({ ...h, quantity: Number(h.quantity), current_value: Number(h.current_value), cost_basis: Number(h.cost_basis) })));
    setLiabilities((liabRes.data || []).map((l: any) => ({ ...l, balance: Number(l.balance), minimum_payment: Number(l.minimum_payment), apr: Number(l.apr) })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived spending by category
  const spendingByCategory = transactions
    .filter((t) => t.amount > 0 && !t.pending)
    .reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "other";
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {});

  const totalSpending = Object.values(spendingByCategory).reduce((s, v) => s + v, 0);
  const totalInvestments = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalDebt = liabilities.reduce((s, l) => s + l.balance, 0);

  return {
    transactions,
    holdings,
    liabilities,
    loading,
    refetch: fetchData,
    spendingByCategory,
    totalSpending,
    totalInvestments,
    totalDebt,
  };
};
