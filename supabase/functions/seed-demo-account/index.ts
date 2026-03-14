import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_EMAIL = "demo@growwithfinbloom.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const demoPassword = Deno.env.get("DEMO_USER_PASSWORD")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Check if demo user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let demoUser = existingUsers?.users?.find((u) => u.email === DEMO_EMAIL);

    if (!demoUser) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { full_name: "Alex", is_demo: true },
      });
      if (error) throw error;
      demoUser = data.user;
    }

    const userId = demoUser!.id;

    // Seed profile
    await supabase.from("profiles").upsert({
      user_id: userId,
      full_name: "Alex",
      age_group: "25-34",
      income_range: "$60k-$80k",
      employment_type: "full_time",
      location_type: "urban",
      household: "single",
      financial_confidence: "somewhat",
      financial_personality: "The Nurturer",
      financial_accounts: ["checking", "savings", "credit_card", "retirement", "brokerage"],
      connected_bank: true,
      goals: ["emergency_fund", "debt_payoff", "invest"],
      onboarding_completed: true,
    }, { onConflict: "user_id" });

    // Seed institutions (get existing)
    const { data: insts } = await supabase.from("institutions").select("id, name");
    const find = (n: string) => insts?.find((i) => i.name === n)?.id;

    // Clear existing demo data
    await supabase.from("accounts").delete().eq("user_id", userId);
    await supabase.from("transactions").delete().eq("user_id", userId);
    await supabase.from("goals").delete().eq("user_id", userId);
    await supabase.from("user_missions").delete().eq("user_id", userId);
    await supabase.from("user_achievements").delete().eq("user_id", userId);
    await supabase.from("xp_ledger").delete().eq("user_id", userId);
    await supabase.from("investment_holdings").delete().eq("user_id", userId);

    // Seed 8 accounts across 3 institutions
    const chaseId = find("Chase");
    const marcusId = find("Marcus by Goldman Sachs");
    const vanguardId = find("Vanguard");

    const accountInserts = [
      { user_id: userId, institution_id: chaseId!, nickname: "Checking", account_type: "checking", balance: 3420 },
      { user_id: userId, institution_id: chaseId!, nickname: "Savings", account_type: "savings", balance: 8750 },
      { user_id: userId, institution_id: chaseId!, nickname: "Freedom Card", account_type: "credit_card", balance: -2100 },
      { user_id: userId, institution_id: marcusId!, nickname: "High-Yield Savings", account_type: "savings", balance: 5200 },
      { user_id: userId, institution_id: marcusId!, nickname: "Emergency Fund", account_type: "savings", balance: 3400 },
      { user_id: userId, institution_id: vanguardId!, nickname: "Roth IRA", account_type: "retirement", balance: 12800 },
      { user_id: userId, institution_id: vanguardId!, nickname: "Brokerage", account_type: "brokerage", balance: 4600 },
      { user_id: userId, institution_id: vanguardId!, nickname: "Target Date Fund", account_type: "retirement", balance: 8900 },
    ].filter((a) => a.institution_id);

    const { data: insertedAccounts } = await supabase.from("accounts").insert(accountInserts).select("id, nickname, account_type");

    // Seed 30 days of transactions
    const categories = ["food_and_drink", "shopping", "transportation", "entertainment", "bills", "groceries", "health", "subscription"];
    const merchants: Record<string, string[]> = {
      food_and_drink: ["Sweetgreen", "Blue Bottle", "Chipotle", "Local Bistro"],
      shopping: ["Target", "Amazon", "Zara", "Bookshop"],
      transportation: ["Uber", "Metro Card", "Gas Station"],
      entertainment: ["Netflix", "Spotify", "AMC Theatres"],
      bills: ["Electric Co", "Internet Provider", "Phone Bill"],
      groceries: ["Whole Foods", "Trader Joe's", "Local Market"],
      health: ["CVS", "Yoga Studio", "Dr. Smith"],
      subscription: ["iCloud", "NYT Digital", "Gym Membership"],
    };

    const checkingId = insertedAccounts?.find((a) => a.nickname === "Checking")?.id;
    const ccId = insertedAccounts?.find((a) => a.account_type === "credit_card")?.id;

    if (checkingId && ccId) {
      const txns = [];
      for (let d = 0; d < 30; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split("T")[0];
        const numTxns = Math.floor(Math.random() * 3) + 1;
        for (let t = 0; t < numTxns; t++) {
          const cat = categories[Math.floor(Math.random() * categories.length)];
          const merchantList = merchants[cat] || ["Unknown"];
          const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
          const amount = Math.round((Math.random() * 80 + 5) * 100) / 100;
          txns.push({
            user_id: userId,
            account_id: Math.random() > 0.4 ? checkingId : ccId,
            amount,
            category: cat,
            merchant_name: merchant,
            date: dateStr,
            pending: d === 0 && Math.random() > 0.7,
          });
        }
      }
      // Add income
      txns.push({ user_id: userId, account_id: checkingId, amount: -2800, category: "income", merchant_name: "Employer Direct Deposit", date: new Date().toISOString().split("T")[0], pending: false });
      await supabase.from("transactions").insert(txns);
    }

    // Seed 2 goals
    const emergencyAccountId = insertedAccounts?.find((a) => a.nickname === "Emergency Fund")?.id;
    const { data: goals } = await supabase.from("goals").insert([
      { user_id: userId, title: "Emergency Fund", goal_type: "savings", target_amount: 10000, current_amount: 3400, description: "3 months of expenses", status: "active", linked_account_id: emergencyAccountId || null },
      { user_id: userId, title: "Pay Off Credit Card", goal_type: "debt_payoff", target_amount: 2100, current_amount: 380, description: "Freedom Card balance", status: "active" },
    ]).select("id");

    // Seed missions
    const { data: missionsList } = await supabase.from("missions").select("id").limit(5);
    if (missionsList && missionsList.length > 0) {
      await supabase.from("user_missions").insert(
        missionsList.map((m, i) => ({
          user_id: userId,
          mission_id: m.id,
          progress_value: i < 3 ? 100 : Math.floor(Math.random() * 60) + 20,
          completed: i < 3,
          completed_at: i < 3 ? new Date().toISOString() : null,
        }))
      );
    }

    // Seed achievements (2 earned)
    const { data: achievements } = await supabase.from("achievements").select("id, name").limit(5);
    if (achievements && achievements.length >= 2) {
      await supabase.from("user_achievements").insert(
        achievements.slice(0, 2).map((a) => ({ user_id: userId, achievement_id: a.id }))
      );
    }

    // Award XP to reach 740 total via ledger entries
    const xpEntries = [
      { xp: 100, source: "onboarding", reason: "Completed onboarding" },
      { xp: 200, source: "banking", reason: "Connected bank accounts" },
      { xp: 50, source: "onboarding", reason: "Set financial goals" },
      { xp: 100, source: "engagement", reason: "7-day login streak" },
      { xp: 75, source: "mission", reason: "Completed weekly mission" },
      { xp: 65, source: "mission", reason: "Completed savings mission" },
      { xp: 50, source: "mission", reason: "Completed budget review" },
      { xp: 100, source: "saving", reason: "Emergency fund started" },
    ];
    for (const e of xpEntries) {
      await supabase.rpc("award_xp", {
        p_user_id: userId,
        p_xp_amount: e.xp,
        p_source_type: e.source,
        p_reason: e.reason,
        p_source_id: crypto.randomUUID(),
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Seed demo error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
