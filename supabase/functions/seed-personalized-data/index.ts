import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Financial calibration ────────────────────────────────────────────────────

/** Estimated monthly take-home by income bracket */
const MONTHLY_INCOME: Record<string, number> = {
  "<50k": 2800,
  "50k-100k": 4800,
  "100k-200k": 8000,
  "200k+": 14000,
};

const INCOME_LABEL: Record<string, string> = {
  salaried: "Direct Deposit – Payroll",
  self_employed: "Client Payment – ACH",
  business_owner: "Business Revenue Transfer",
  student: "Work-Study Deposit",
};

/** Transaction amount ranges [min, max] per category per income bracket */
const SPEND_RANGE: Record<string, Record<string, [number, number]>> = {
  "<50k": {
    food_and_drink: [8, 22],
    groceries: [35, 90],
    transportation: [8, 40],
    entertainment: [8, 20],
    shopping: [15, 55],
    bills: [45, 130],
    subscription: [8, 18],
    health: [12, 45],
    childcare: [200, 450],
  },
  "50k-100k": {
    food_and_drink: [12, 45],
    groceries: [60, 180],
    transportation: [12, 65],
    entertainment: [15, 55],
    shopping: [25, 110],
    bills: [80, 200],
    subscription: [10, 30],
    health: [20, 80],
    childcare: [400, 900],
  },
  "100k-200k": {
    food_and_drink: [18, 75],
    groceries: [90, 280],
    transportation: [20, 90],
    entertainment: [25, 100],
    shopping: [45, 220],
    bills: [130, 380],
    subscription: [12, 45],
    health: [30, 130],
    childcare: [700, 1600],
  },
  "200k+": {
    food_and_drink: [25, 130],
    groceries: [140, 450],
    transportation: [30, 150],
    entertainment: [40, 180],
    shopping: [80, 400],
    bills: [200, 600],
    subscription: [15, 80],
    health: [50, 200],
    childcare: [1200, 2800],
  },
};

/** Merchant lists per household type and category */
const MERCHANTS: Record<string, Record<string, string[]>> = {
  single: {
    food_and_drink: ["Sweetgreen", "Blue Bottle Coffee", "Chipotle", "Dig Inn", "Blank Street Coffee"],
    groceries: ["Whole Foods", "Trader Joe's", "Instacart"],
    transportation: ["Uber", "Lyft", "MTA Metro Card"],
    entertainment: ["Netflix", "Spotify", "AMC Theatres", "Eventbrite"],
    shopping: ["Amazon", "Target", "Zara", "ASOS"],
    bills: ["Con Edison", "Verizon Wireless", "Internet Provider"],
    subscription: ["iCloud Storage", "NYT Digital", "Gym Membership", "Hulu"],
    health: ["CVS Pharmacy", "Equinox", "Dr. Smith – Copay"],
  },
  partnered: {
    food_and_drink: ["Local Bistro", "Blue Bottle Coffee", "Date Night Restaurant", "Corner Café"],
    groceries: ["Whole Foods", "Costco", "Trader Joe's", "Instacart"],
    transportation: ["Shell Gas", "Uber", "Parking Garage"],
    entertainment: ["Fandango", "Spotify Family", "Broadway Tickets"],
    shopping: ["Target", "HomeGoods", "Crate & Barrel", "Amazon"],
    bills: ["Electricity Co", "Phone Bill", "Internet", "Rent Payment"],
    subscription: ["Netflix", "Apple One", "Gym Membership"],
    health: ["CVS Pharmacy", "Kaiser – Copay", "Yoga Studio"],
  },
  partner_kids: {
    food_and_drink: ["McDonald's", "Panera Bread", "Family Diner", "Chipotle"],
    groceries: ["Costco", "Target Grocery", "Trader Joe's", "Stop & Shop"],
    transportation: ["Shell Gas", "Uber", "School Bus Pass"],
    entertainment: ["Disney+", "Roblox", "Chuck E. Cheese", "Movie Tickets"],
    shopping: ["Target", "Carter's", "Amazon", "Old Navy"],
    bills: ["Electric Company", "Internet", "School Activity Fee"],
    subscription: ["Amazon Prime", "Netflix", "Spotify"],
    health: ["CVS Pharmacy", "Pediatrician – Copay", "Walgreens"],
    childcare: ["Bright Horizons", "Afternoon Care Program", "Summer Camp Deposit"],
  },
  single_parent: {
    food_and_drink: ["Chipotle", "Family Diner", "Panera Bread"],
    groceries: ["Walmart Grocery", "Target", "Aldi", "Costco"],
    transportation: ["Shell Gas", "Uber", "School Bus"],
    entertainment: ["Netflix", "YouTube Premium"],
    shopping: ["Amazon", "Target", "Thrift Store"],
    bills: ["Electric Company", "Internet", "Phone Bill"],
    subscription: ["Amazon Prime", "Disney+"],
    health: ["CVS Pharmacy", "Walgreens", "Pediatrician – Copay"],
    childcare: ["YMCA After School", "Babysitter", "Daycare Center"],
  },
};

/** Category spend weights per household type — drives how transactions are distributed */
const CATEGORY_WEIGHTS: Record<string, Record<string, number>> = {
  single: {
    food_and_drink: 0.30,
    shopping: 0.20,
    transportation: 0.15,
    entertainment: 0.15,
    health: 0.10,
    subscription: 0.10,
  },
  partnered: {
    groceries: 0.25,
    food_and_drink: 0.20,
    shopping: 0.20,
    bills: 0.15,
    transportation: 0.10,
    entertainment: 0.10,
  },
  partner_kids: {
    groceries: 0.25,
    childcare: 0.20,
    shopping: 0.15,
    health: 0.15,
    transportation: 0.15,
    bills: 0.10,
  },
  single_parent: {
    groceries: 0.25,
    childcare: 0.20,
    health: 0.15,
    shopping: 0.15,
    transportation: 0.15,
    bills: 0.10,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let rand = Math.random() * total;
  for (const [cat, weight] of entries) {
    rand -= weight;
    if (rand <= 0) return cat;
  }
  return entries[0][0];
}

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/** Account balance targets by confidence tier, expressed as months-of-income multiples */
function deriveBalances(confidence: string, monthlyIncome: number) {
  const m = monthlyIncome;
  if (confidence === "advanced") {
    return {
      checking: Math.round(m * 2.5),
      savings: Math.round(m * 4.5),
      emergencySavings: Math.round(m * 4.0),
      creditCard: Math.round(m * 0.15),
      retirement: Math.round(m * 8.0),
      brokerage: Math.round(m * 4.5),
      studentLoan: 7500,
    };
  }
  if (confidence === "intermediate") {
    return {
      checking: Math.round(m * 1.2),
      savings: Math.round(m * 2.2),
      emergencySavings: Math.round(m * 1.5),
      creditCard: Math.round(m * 0.5),
      retirement: Math.round(m * 3.0),
      brokerage: Math.round(m * 1.5),
      studentLoan: 18000,
    };
  }
  // beginner
  return {
    checking: Math.round(m * 0.4),
    savings: Math.round(m * 0.2),
    emergencySavings: Math.round(m * 0.1),
    creditCard: Math.round(m * 0.9),
    retirement: Math.round(m * 0.5),
    brokerage: 0,
    studentLoan: 32000,
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // ── Authenticate ──────────────────────────────────────────────────────────
    const jwt = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
    const { data: { user }, error: authErr } = await createClient(supabaseUrl, anonKey).auth.getUser(jwt);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = user.id;

    // ── Read profile ──────────────────────────────────────────────────────────
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });
    }

    const incomeRange: string = profile.income_range ?? "50k-100k";
    const confidence: string = profile.financial_confidence ?? "beginner";
    const household: string = profile.household ?? "single";
    const employmentType: string = profile.employment_type ?? "salaried";
    const financialAccounts: string[] = profile.financial_accounts ?? ["checking"];
    const userGoals: string[] = profile.goals ?? [];

    const monthlyIncome = MONTHLY_INCOME[incomeRange] ?? 4800;
    const balances = deriveBalances(confidence, monthlyIncome);
    const has = (acct: string) => financialAccounts.includes(acct);

    // ── Clear existing user data ──────────────────────────────────────────────
    await Promise.all([
      supabase.from("accounts").delete().eq("user_id", userId),
      supabase.from("transactions").delete().eq("user_id", userId),
      supabase.from("goals").delete().eq("user_id", userId),
      supabase.from("investment_holdings").delete().eq("user_id", userId),
      supabase.from("liabilities").delete().eq("user_id", userId),
      supabase.from("user_missions").delete().eq("user_id", userId),
      supabase.from("user_achievements").delete().eq("user_id", userId),
      supabase.from("xp_ledger").delete().eq("user_id", userId),
    ]);

    // ── Institutions ──────────────────────────────────────────────────────────
    const { data: insts } = await supabase.from("institutions").select("id, name");
    const inst = (name: string) => insts?.find((i: any) => i.name === name)?.id as string | undefined;
    const chaseId = inst("Chase");
    const marcusId = inst("Marcus by Goldman Sachs");
    const vanguardId = inst("Vanguard");

    // ── Accounts ──────────────────────────────────────────────────────────────
    const accountRows: any[] = [];

    // Always seed checking — it anchors transactions
    if (chaseId) {
      accountRows.push({
        user_id: userId, institution_id: chaseId,
        nickname: "Checking", account_type: "checking", balance: balances.checking,
      });
    }

    if (has("savings") && marcusId) {
      accountRows.push({
        user_id: userId, institution_id: marcusId,
        nickname: "High-Yield Savings", account_type: "savings", balance: balances.savings,
      });
    }

    // Emergency fund bucket — seed whenever user has savings or set emergency_fund goal
    if ((has("savings") || userGoals.includes("emergency_fund")) && marcusId) {
      accountRows.push({
        user_id: userId, institution_id: marcusId,
        nickname: "Emergency Fund", account_type: "savings", balance: balances.emergencySavings,
      });
    }

    if (has("credit_cards") && chaseId) {
      accountRows.push({
        user_id: userId, institution_id: chaseId,
        nickname: "Freedom Card", account_type: "credit_card", balance: -balances.creditCard,
      });
    }

    if (has("401k") && vanguardId) {
      accountRows.push({
        user_id: userId, institution_id: vanguardId,
        nickname: "401(k)", account_type: "retirement", balance: balances.retirement,
      });
    }

    if (has("roth_ira") && vanguardId) {
      accountRows.push({
        user_id: userId, institution_id: vanguardId,
        nickname: "Roth IRA", account_type: "retirement",
        balance: Math.round(balances.retirement * 0.6),
      });
    }

    if (has("brokerage") && vanguardId) {
      accountRows.push({
        user_id: userId, institution_id: vanguardId,
        nickname: "Brokerage", account_type: "brokerage", balance: balances.brokerage,
      });
    }

    const { data: insertedAccounts } = await supabase
      .from("accounts").insert(accountRows).select("id, nickname, account_type");

    const acct = (type: string) => insertedAccounts?.find((a: any) => a.account_type === type)?.id as string | undefined;
    const acctByNick = (nick: string) => insertedAccounts?.find((a: any) => a.nickname === nick)?.id as string | undefined;

    const checkingId = acct("checking");
    const ccId = acct("credit_card");
    const retirementId = acct("retirement");
    const brokerageId = acct("brokerage");
    const savingsId = acctByNick("High-Yield Savings");
    const emergencyId = acctByNick("Emergency Fund");

    // ── Transactions (60 days) ────────────────────────────────────────────────
    if (checkingId) {
      const spendRanges = SPEND_RANGE[incomeRange] ?? SPEND_RANGE["50k-100k"];
      const catWeights = CATEGORY_WEIGHTS[household] ?? CATEGORY_WEIGHTS.single;
      const householdMerchants = MERCHANTS[household] ?? MERCHANTS.single;

      // Route ~45% of non-bill transactions through credit card when available
      const txAccount = (cat: string) =>
        ccId && cat !== "bills" && cat !== "childcare" && Math.random() > 0.55
          ? ccId
          : checkingId;

      const txns: any[] = [];

      for (let d = 0; d < 60; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split("T")[0];

        // 1–3 spending transactions per day
        const numTxns = Math.floor(Math.random() * 3) + 1;
        for (let t = 0; t < numTxns; t++) {
          const cat = weightedRandom(catWeights);
          const [min, max] = spendRanges[cat] ?? [10, 50];
          const merchantList = householdMerchants[cat] ?? ["Purchase"];
          txns.push({
            user_id: userId,
            account_id: txAccount(cat),
            amount: randBetween(min, max),
            category: cat,
            merchant_name: merchantList[Math.floor(Math.random() * merchantList.length)],
            date: dateStr,
            pending: d === 0 && Math.random() > 0.7,
          });
        }

        // Recurring bills roughly twice a month
        if (d % 15 === 3 || d % 15 === 14) {
          const [min, max] = spendRanges.bills ?? [60, 200];
          const billMerchants = householdMerchants.bills ?? ["Bill Payment"];
          txns.push({
            user_id: userId,
            account_id: checkingId,
            amount: randBetween(min, max),
            category: "bills",
            merchant_name: billMerchants[Math.floor(Math.random() * billMerchants.length)],
            date: dateStr,
            pending: false,
          });
        }
      }

      // Bi-weekly paychecks (negative = money in)
      const incomeLabel = INCOME_LABEL[employmentType] ?? "Direct Deposit";
      const paycheck = Math.round(monthlyIncome / 2);
      const payDate1 = new Date(); payDate1.setDate(payDate1.getDate() - 3);
      const payDate2 = new Date(); payDate2.setDate(payDate2.getDate() - 17);
      const payDate3 = new Date(); payDate3.setDate(payDate3.getDate() - 31);
      txns.push(
        { user_id: userId, account_id: checkingId, amount: -paycheck, category: "income", merchant_name: incomeLabel, date: payDate1.toISOString().split("T")[0], pending: false },
        { user_id: userId, account_id: checkingId, amount: -paycheck, category: "income", merchant_name: incomeLabel, date: payDate2.toISOString().split("T")[0], pending: false },
        { user_id: userId, account_id: checkingId, amount: -paycheck, category: "income", merchant_name: incomeLabel, date: payDate3.toISOString().split("T")[0], pending: false },
      );

      await supabase.from("transactions").insert(txns);
    }

    // ── Goals ─────────────────────────────────────────────────────────────────
    const goalRows: any[] = [];

    if (userGoals.includes("emergency_fund")) {
      const target = Math.round(monthlyIncome * 3);
      goalRows.push({
        user_id: userId, goal_type: "savings", title: "Emergency Fund",
        description: `Build ${Math.round((balances.emergencySavings / target) * 100)}% of 3 months of expenses`,
        target_amount: target, current_amount: balances.emergencySavings,
        status: "active", linked_account_id: emergencyId ?? savingsId ?? null,
      });
    }

    if ((userGoals.includes("pay_debt") || userGoals.includes("debt_payoff")) && has("credit_cards")) {
      goalRows.push({
        user_id: userId, goal_type: "debt_payoff", title: "Pay Off Credit Card",
        description: "Freedom Card – eliminate the balance",
        target_amount: balances.creditCard,
        current_amount: Math.round(balances.creditCard * 0.15),
        status: "active", linked_account_id: ccId ?? null,
      });
    }

    if (userGoals.includes("buy_home") || userGoals.includes("save_for_home")) {
      const target = Math.round(monthlyIncome * 36);
      goalRows.push({
        user_id: userId, goal_type: "savings", title: "House Down Payment",
        description: "Saving toward a 20% down payment",
        target_amount: target,
        current_amount: Math.round(balances.savings * 0.4),
        status: "active", linked_account_id: savingsId ?? null,
      });
    }

    if (userGoals.includes("retirement") && (has("401k") || has("roth_ira"))) {
      goalRows.push({
        user_id: userId, goal_type: "savings", title: "Retirement Savings",
        description: "Max out tax-advantaged accounts this year",
        target_amount: 23000, // 2024 401(k) contribution limit
        current_amount: Math.round(balances.retirement * 0.12),
        status: "active", linked_account_id: retirementId ?? null,
      });
    }

    if (userGoals.includes("start_investing") || userGoals.includes("invest")) {
      goalRows.push({
        user_id: userId, goal_type: "savings", title: "Start Investing",
        description: "Open and fund your first investment account",
        target_amount: Math.round(monthlyIncome * 2),
        current_amount: has("brokerage") ? balances.brokerage : 0,
        status: "active", linked_account_id: brokerageId ?? null,
      });
    }

    if (goalRows.length > 0) {
      await supabase.from("goals").insert(goalRows);
    }

    // ── Liabilities ───────────────────────────────────────────────────────────
    const liabilityRows: any[] = [];

    if (has("credit_cards") && ccId) {
      const apr = confidence === "advanced" ? 15.99 : confidence === "intermediate" ? 21.99 : 27.49;
      liabilityRows.push({
        user_id: userId, account_id: ccId, liability_type: "credit_card",
        balance: balances.creditCard,
        minimum_payment: Math.max(25, Math.round(balances.creditCard * 0.02)),
        apr,
      });
    }

    if (has("student_loans") && checkingId) {
      liabilityRows.push({
        user_id: userId, account_id: checkingId, liability_type: "student_loan",
        balance: balances.studentLoan,
        minimum_payment: Math.round(balances.studentLoan * 0.01),
        apr: 5.05,
      });
    }

    if (liabilityRows.length > 0) {
      await supabase.from("liabilities").insert(liabilityRows);
    }

    // ── Investment holdings ───────────────────────────────────────────────────
    const holdingRows: any[] = [];
    const investingAccountId = retirementId ?? brokerageId;

    if (investingAccountId && (has("401k") || has("roth_ira") || has("brokerage"))) {
      const totalInvested = balances.retirement + balances.brokerage;
      const holdings = [
        { symbol: "VOO", name: "Vanguard S&P 500 ETF", pct: 0.45, price: 485 },
        { symbol: "VTI", name: "Vanguard Total Stock Market ETF", pct: 0.30, price: 240 },
        { symbol: "BND", name: "Vanguard Total Bond Market ETF", pct: 0.15, price: 74 },
        { symbol: "VXUS", name: "Vanguard Total International Stock ETF", pct: 0.10, price: 58 },
      ];

      for (const h of holdings) {
        const value = Math.round(totalInvested * h.pct);
        if (value < 100) continue;
        const gainRatio = confidence === "advanced" ? 0.72 : confidence === "intermediate" ? 0.85 : 0.95;
        const costBasis = Math.round(value * gainRatio);
        const quantity = Math.round((value / h.price) * 100) / 100;
        holdingRows.push({
          user_id: userId, account_id: investingAccountId,
          symbol: h.symbol, name: h.name,
          quantity, current_value: value, cost_basis: costBasis,
        });
      }

      if (holdingRows.length > 0) {
        await supabase.from("investment_holdings").insert(holdingRows);
      }
    }

    // ── Missions ──────────────────────────────────────────────────────────────
    const { data: missionsList } = await supabase.from("missions").select("id").limit(5);
    if (missionsList && missionsList.length > 0) {
      const completedCount = confidence === "advanced" ? 3 : confidence === "intermediate" ? 2 : 1;
      await supabase.from("user_missions").insert(
        missionsList.map((m: any, i: number) => ({
          user_id: userId, mission_id: m.id,
          progress_value: i < completedCount ? 100 : Math.floor(Math.random() * 55) + 10,
          completed: i < completedCount,
          completed_at: i < completedCount ? new Date().toISOString() : null,
        }))
      );
    }

    // ── Achievements ──────────────────────────────────────────────────────────
    const { data: achievements } = await supabase.from("achievements").select("id").limit(5);
    const earnedCount = confidence === "advanced" ? 3 : confidence === "intermediate" ? 1 : 0;
    if (achievements && earnedCount > 0) {
      await supabase.from("user_achievements").insert(
        achievements.slice(0, earnedCount).map((a: any) => ({ user_id: userId, achievement_id: a.id }))
      );
    }

    // ── XP ────────────────────────────────────────────────────────────────────
    const xpEntries: { xp: number; source: string; reason: string }[] = [
      { xp: 100, source: "onboarding", reason: "Completed onboarding" },
      { xp: 50, source: "onboarding", reason: "Set financial goals" },
      { xp: 50, source: "sample_data", reason: "Started with personalized snapshot" },
    ];

    if (accountRows.length >= 3) xpEntries.push({ xp: 50, source: "onboarding", reason: "Multiple accounts linked" });
    if (accountRows.length >= 5) xpEntries.push({ xp: 50, source: "onboarding", reason: "Diverse account portfolio" });

    const completedCount = confidence === "advanced" ? 3 : confidence === "intermediate" ? 2 : 1;
    for (let i = 0; i < completedCount; i++) {
      xpEntries.push({ xp: 50 + i * 15, source: "mission", reason: `Completed starter mission ${i + 1}` });
    }

    for (const e of xpEntries) {
      await supabase.rpc("award_xp", {
        p_user_id: userId,
        p_xp_amount: e.xp,
        p_source_type: e.source,
        p_reason: e.reason,
        p_source_id: crypto.randomUUID(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        seeded: {
          accounts: accountRows.length,
          transactions: "~60 days",
          goals: goalRows.length,
          liabilities: liabilityRows.length,
          holdings: holdingRows.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("seed-personalized-data error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
