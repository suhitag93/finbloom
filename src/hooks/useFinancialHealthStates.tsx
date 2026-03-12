import { useMemo } from "react";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useGoals } from "@/hooks/useGoals";
import { useProfile } from "@/hooks/useProfile";

export type HealthState = "needs_work" | "room_to_grow" | "starting" | "being_managed" | "healthy";

export interface CategoryHealth {
  state: HealthState;
  icon: string;
  label: string;
  tooltip: string;
  /** Lower = more urgent (used for the max-one-⚠️ rule) */
  urgency: number;
}

const STATE_META: Record<HealthState, { icon: string; label: string }> = {
  needs_work: { icon: "⚠️", label: "Needs work" },
  room_to_grow: { icon: "🌰", label: "Room to grow" },
  starting: { icon: "🌱", label: "Starting" },
  being_managed: { icon: "🪴", label: "Being managed" },
  healthy: { icon: "🌻", label: "Healthy" },
};

const STATE_SCORE: Record<HealthState, number> = {
  needs_work: 20,
  room_to_grow: 40,
  starting: 50,
  being_managed: 70,
  healthy: 95,
};

/** Estimate monthly expenses from recent transactions */
function estimateMonthlyExpenses(transactions: { amount: number; date: string; pending: boolean }[]): number {
  const spending = transactions.filter((t) => t.amount > 0 && !t.pending);
  if (spending.length === 0) return 2000; // fallback
  const total = spending.reduce((s, t) => s + t.amount, 0);
  // estimate based on available date range
  const dates = spending.map((t) => new Date(t.date).getTime());
  const rangeMs = Math.max(Date.now() - Math.min(...dates), 30 * 86400000);
  const months = rangeMs / (30 * 86400000);
  return total / Math.max(months, 1);
}

function getAgeFromProfile(profile: any): number | null {
  if (!profile) return null;
  if (profile.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
    return age;
  }
  // Estimate from age_group
  const ageGroupMap: Record<string, number> = {
    "18-24": 21, "25-34": 30, "35-44": 40, "45-54": 50, "55-64": 60, "65+": 70,
  };
  return profile.age_group ? ageGroupMap[profile.age_group] ?? null : null;
}

function getIncomeEstimate(profile: any): number {
  const map: Record<string, number> = {
    "Under $30k": 25000, "$30k-$50k": 40000, "$50k-$75k": 62500,
    "$75k-$100k": 87500, "$100k-$150k": 125000, "$150k+": 175000,
  };
  return profile?.income_range ? map[profile.income_range] ?? 50000 : 50000;
}

function computeSavingsState(
  accounts: Account[],
  monthlyExpenses: number,
  goals: any[],
): CategoryHealth {
  const savingsAccounts = accounts.filter(
    (a) => a.account_type === "savings" || a.account_subtype === "savings"
  );
  const totalSavings = savingsAccounts.reduce((s, a) => s + a.balance, 0);
  const weeksOfExpenses = (totalSavings / monthlyExpenses) * 4;

  // Check if goal was just created (within 30 days)
  const recentGoal = goals.some(
    (g) => g.status === "active" && Date.now() - new Date(g.created_at).getTime() < 30 * 86400000
  );
  const hasSavingsHistory = savingsAccounts.length > 0 && savingsAccounts.some(
    (a) => a.last_synced_at && Date.now() - new Date(a.last_synced_at).getTime() < 30 * 86400000
  );

  if (savingsAccounts.length === 0 || totalSavings === 0 || weeksOfExpenses < 2) {
    return {
      state: "needs_work", ...STATE_META.needs_work, urgency: 1,
      tooltip: savingsAccounts.length === 0
        ? "You don't have a savings account connected yet. Starting with even $25/month makes a difference. → Start a savings mission"
        : "Your savings are below 2 weeks of expenses. Small, consistent deposits add up fast. → Set up auto-save",
    };
  }

  if (weeksOfExpenses < 4) {
    return {
      state: "room_to_grow", ...STATE_META.room_to_grow, urgency: 2,
      tooltip: "You have savings started — great first step. Building toward 1 month of expenses is your next milestone. → View savings goal",
    };
  }

  if (!hasSavingsHistory || recentGoal) {
    return {
      state: "starting", ...STATE_META.starting, urgency: 3,
      tooltip: "You just started — that already puts you ahead of most. Keep going. → Continue your mission",
    };
  }

  const monthsOfExpenses = totalSavings / monthlyExpenses;
  if (monthsOfExpenses < 3) {
    return {
      state: "being_managed", ...STATE_META.being_managed, urgency: 4,
      tooltip: "You're actively tending to this. Consistency is everything here. → See your progress",
    };
  }

  return {
    state: "healthy", ...STATE_META.healthy, urgency: 5,
    tooltip: "This area is thriving. You've built something real here. 💚",
  };
}

function computeDebtState(
  totalDebt: number,
  annualIncome: number,
): CategoryHealth {
  const dti = totalDebt / Math.max(annualIncome, 1);

  if (totalDebt === 0) {
    return {
      state: "healthy", ...STATE_META.healthy, urgency: 5,
      tooltip: "This area is thriving. You've built something real here. 💚",
    };
  }

  if (dti >= 0.4) {
    return {
      state: "needs_work", ...STATE_META.needs_work, urgency: 1,
      tooltip: "Your debt-to-income ratio is above 40%. Focusing on the highest-interest debt first can make a big impact. → Start a debt payoff plan",
    };
  }

  if (dti >= 0.2) {
    return {
      state: "room_to_grow", ...STATE_META.room_to_grow, urgency: 2,
      tooltip: "Debt exists and is being reduced — you're heading in the right direction. → View debt breakdown",
    };
  }

  // Below 20% DTI with some debt
  return {
    state: "being_managed", ...STATE_META.being_managed, urgency: 4,
    tooltip: "You're actively tending to this. Consistency is everything here. → See your progress",
  };
}

function computeSpendingState(
  transactions: { amount: number; date: string; pending: boolean }[],
): CategoryHealth {
  const spending = transactions.filter((t) => t.amount > 0 && !t.pending);
  if (spending.length === 0) {
    return {
      state: "starting", ...STATE_META.starting, urgency: 3,
      tooltip: "You just started — that already puts you ahead of most. Keep going. → Continue your mission",
    };
  }

  // Check date range for "first month"
  const dates = spending.map((t) => new Date(t.date).getTime());
  const spanDays = (Math.max(...dates) - Math.min(...dates)) / 86400000;
  if (spanDays < 35) {
    return {
      state: "starting", ...STATE_META.starting, urgency: 3,
      tooltip: "This is your first month of tracked spending. We're building your picture. → Continue your mission",
    };
  }

  // Simple heuristic: compare last 30 days vs prior 30 days as a proxy for "budget"
  const now = Date.now();
  const recent = spending.filter((t) => now - new Date(t.date).getTime() < 30 * 86400000);
  const prior = spending.filter((t) => {
    const age = now - new Date(t.date).getTime();
    return age >= 30 * 86400000 && age < 60 * 86400000;
  });

  const recentTotal = recent.reduce((s, t) => s + t.amount, 0);
  const priorTotal = prior.reduce((s, t) => s + t.amount, 0);
  const budget = priorTotal > 0 ? priorTotal : recentTotal; // use prior as "budget"
  const variance = budget > 0 ? (recentTotal - budget) / budget : 0;

  if (variance > 0.2) {
    return {
      state: "needs_work", ...STATE_META.needs_work, urgency: 1,
      tooltip: "Spending is over 20% above your usual pattern. A quick review can reveal easy wins. → Review spending",
    };
  }
  if (variance > 0.05) {
    return {
      state: "room_to_grow", ...STATE_META.room_to_grow, urgency: 2,
      tooltip: "Spending is slightly above your usual range. Small adjustments can keep you on track. → View spending breakdown",
    };
  }
  if (variance > -0.05) {
    return {
      state: "being_managed", ...STATE_META.being_managed, urgency: 4,
      tooltip: "You're actively tending to this. Consistency is everything here. → See your progress",
    };
  }

  return {
    state: "healthy", ...STATE_META.healthy, urgency: 5,
    tooltip: "This area is thriving. You've built something real here. 💚",
  };
}

function computeInvestingState(
  totalInvestments: number,
  age: number | null,
): CategoryHealth {
  const effectiveAge = age ?? 30;

  if (totalInvestments === 0) {
    if (effectiveAge > 35) {
      return {
        state: "needs_work", ...STATE_META.needs_work, urgency: 1,
        tooltip: "You don't have any investments yet. Even small contributions now can grow significantly over time. → Start an investing mission",
      };
    }
    return {
      state: "starting", ...STATE_META.starting, urgency: 3,
      tooltip: "You just started — that already puts you ahead of most. Keep going. → Continue your mission",
    };
  }

  // Simple age-based target: invest at least (age * $500)
  const target = effectiveAge * 500;
  const ratio = totalInvestments / target;

  if (ratio < 0.3) {
    return {
      state: "room_to_grow", ...STATE_META.room_to_grow, urgency: 2,
      tooltip: "You've started investing — great first step. Growing your contributions will accelerate your progress. → View investment plan",
    };
  }
  if (ratio < 0.8) {
    return {
      state: "being_managed", ...STATE_META.being_managed, urgency: 4,
      tooltip: "You're actively tending to this. Consistency is everything here. → See your progress",
    };
  }

  return {
    state: "healthy", ...STATE_META.healthy, urgency: 5,
    tooltip: "This area is thriving. You've built something real here. 💚",
  };
}

export interface FinancialHealthStates {
  savings: CategoryHealth;
  debt: CategoryHealth;
  spending: CategoryHealth;
  investing: CategoryHealth;
  overallScore: number;
  loading: boolean;
}

/**
 * Enforce max-one-⚠️ rule: if multiple categories are "needs_work",
 * keep ⚠️ only on the most urgent one, demote others to "room_to_grow".
 */
function enforceMaxOneWarning(
  categories: Record<string, CategoryHealth>,
): Record<string, CategoryHealth> {
  const needsWork = Object.entries(categories).filter(
    ([, v]) => v.state === "needs_work"
  );
  if (needsWork.length <= 1) return categories;

  // Keep the most urgent (lowest urgency number — but they're all 1 for needs_work, so pick first by key order)
  // Use a tiebreaker: savings > debt > spending > investing priority
  const priorityOrder = ["savings", "debt", "spending", "investing"];
  const sorted = needsWork.sort(
    (a, b) => priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0])
  );
  const keepKey = sorted[0][0];

  const result = { ...categories };
  for (const [key] of needsWork) {
    if (key !== keepKey) {
      result[key] = {
        ...result[key],
        state: "room_to_grow",
        icon: STATE_META.room_to_grow.icon,
        label: STATE_META.room_to_grow.label,
        urgency: 2,
      };
    }
  }
  return result;
}

export const useFinancialHealthStates = (): FinancialHealthStates => {
  const { accounts, loading: accLoading } = useAccounts();
  const { transactions, holdings, liabilities, loading: finLoading, totalInvestments, totalDebt } = useFinancialData();
  const { goals, loading: goalsLoading } = useGoals();
  const { profile, loading: profLoading } = useProfile();

  const loading = accLoading || finLoading || goalsLoading || profLoading;

  return useMemo(() => {
    if (loading) {
      const placeholder: CategoryHealth = {
        state: "starting", ...STATE_META.starting, urgency: 3,
        tooltip: "Loading your data...",
      };
      return {
        savings: placeholder, debt: placeholder,
        spending: placeholder, investing: placeholder,
        overallScore: 50, loading: true,
      };
    }

    const monthlyExpenses = estimateMonthlyExpenses(transactions);
    const age = getAgeFromProfile(profile);
    const annualIncome = getIncomeEstimate(profile);

    const raw = {
      savings: computeSavingsState(accounts, monthlyExpenses, goals),
      debt: computeDebtState(totalDebt, annualIncome),
      spending: computeSpendingState(transactions),
      investing: computeInvestingState(totalInvestments, age),
    };

    const adjusted = enforceMaxOneWarning(raw);

    const overallScore = Math.round(
      (STATE_SCORE[adjusted.savings.state] +
        STATE_SCORE[adjusted.debt.state] +
        STATE_SCORE[adjusted.spending.state] +
        STATE_SCORE[adjusted.investing.state]) / 4
    );

    return {
      savings: adjusted.savings,
      debt: adjusted.debt,
      spending: adjusted.spending,
      investing: adjusted.investing,
      overallScore,
      loading: false,
    };
  }, [loading, accounts, transactions, holdings, liabilities, goals, profile, totalInvestments, totalDebt]);
};
