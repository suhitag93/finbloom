import { supabase } from "@/integrations/supabase/client";

export interface DemoProfile {
  email: string;
  password: string;
  label: string;
  emoji: string;
  level: number;
  description: string;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    email: "seed@finbloom.app",
    password: "seed1234",
    label: "Seed 🌱",
    emoji: "🌱",
    level: 0,
    description: "Just getting started — no savings, no investments yet",
  },
  {
    email: "bloom@finbloom.app",
    password: "bloom1234",
    label: "Bloom 🌸",
    emoji: "🌸",
    level: 2,
    description: "Building momentum — emergency fund growing, some investments",
  },
  {
    email: "flourish@finbloom.app",
    password: "flourish1234",
    label: "Flourish 🌳",
    emoji: "🌳",
    level: 4,
    description: "Thriving — strong savings, diversified portfolio, low debt",
  },
];

// ─── Seed helpers per level ──────────────────────────────────────────────────

async function seedSeedProfile(userId: string) {
  await supabase.from("profiles").upsert({
    user_id: userId,
    full_name: "Jamie Seedling",
    age_group: "18-24",
    income_range: "$20k-$40k",
    employment_type: "part_time",
    location_type: "urban",
    household: "single",
    financial_confidence: "not_at_all",
    financial_accounts: ["checking"],
    connected_bank: true,
    goals: ["emergency_fund", "build_credit"],
    onboarding_completed: true,
  }, { onConflict: "user_id" });

  const { data: existingXP } = await supabase.from("xp_ledger").select("id").eq("user_id", userId).limit(1);
  if (!existingXP || existingXP.length === 0) {
    await supabase.from("xp_ledger").insert([
      { user_id: userId, xp_amount: 100, reason: "Completed onboarding", source_type: "onboarding" },
      { user_id: userId, xp_amount: 50, reason: "Set financial goals", source_type: "onboarding" },
      { user_id: userId, xp_amount: 20, reason: "First login streak", source_type: "engagement" },
    ]);
  }

  // Minimal accounts — just a checking with low balance
  const { data: existing } = await supabase.from("accounts").select("id").eq("user_id", userId).limit(1);
  if (!existing || existing.length === 0) {
    const { data: insts } = await supabase.from("institutions").select("id, name");
    if (insts) {
      const chase = insts.find((i) => i.name === "Chase")?.id;
      if (chase) {
        await supabase.from("accounts").insert([
          { user_id: userId, institution_id: chase, nickname: "Checking", account_type: "checking", balance: 420 },
          { user_id: userId, institution_id: chase, nickname: "Credit Card", account_type: "credit_card", balance: -2800 },
        ]);
      }
    }
  }
}

async function seedBloomProfile(userId: string) {
  await supabase.from("profiles").upsert({
    user_id: userId,
    full_name: "Morgan Bloom",
    age_group: "25-34",
    income_range: "$60k-$80k",
    employment_type: "full_time",
    location_type: "suburban",
    household: "partner",
    financial_confidence: "somewhat",
    financial_accounts: ["checking", "savings", "retirement"],
    connected_bank: true,
    goals: ["emergency_fund", "save_for_vacation", "invest"],
    onboarding_completed: true,
  }, { onConflict: "user_id" });

  const { data: existingXP } = await supabase.from("xp_ledger").select("id").eq("user_id", userId).limit(1);
  if (!existingXP || existingXP.length === 0) {
    await supabase.from("xp_ledger").insert([
      { user_id: userId, xp_amount: 100, reason: "Completed onboarding", source_type: "onboarding" },
      { user_id: userId, xp_amount: 200, reason: "Connected bank accounts", source_type: "banking" },
      { user_id: userId, xp_amount: 50, reason: "Set financial goals", source_type: "onboarding" },
      { user_id: userId, xp_amount: 150, reason: "First $1,000 saved", source_type: "achievement" },
      { user_id: userId, xp_amount: 100, reason: "Emergency fund started", source_type: "saving" },
      { user_id: userId, xp_amount: 200, reason: "Opened investment account", source_type: "investing" },
      { user_id: userId, xp_amount: 75, reason: "Completed weekly missions", source_type: "mission" },
      { user_id: userId, xp_amount: 100, reason: "7-day login streak", source_type: "engagement" },
      { user_id: userId, xp_amount: 150, reason: "Paid off credit card", source_type: "achievement" },
      { user_id: userId, xp_amount: 200, reason: "3-month emergency fund", source_type: "achievement" },
      { user_id: userId, xp_amount: 175, reason: "Consistent saver badge", source_type: "achievement" },
    ]);

    // Some achievements
    const { data: achievements } = await supabase.from("achievements").select("id, name")
      .in("name", ["First Drop", "Chain Breaker", "Week Warrior"]);
    if (achievements && achievements.length > 0) {
      await supabase.from("user_achievements").insert(
        achievements.map((a) => ({ user_id: userId, achievement_id: a.id }))
      );
    }

    // Missions
    const { data: missionsList } = await supabase.from("missions").select("id").limit(4);
    if (missionsList && missionsList.length > 0) {
      await supabase.from("user_missions").insert(
        missionsList.map((m, i) => ({
          user_id: userId, mission_id: m.id,
          progress_value: i < 2 ? 100 : Math.floor(Math.random() * 60) + 20,
          completed: i < 2,
          completed_at: i < 2 ? new Date().toISOString() : null,
        }))
      );
    }
  }

  const { data: existing } = await supabase.from("accounts").select("id").eq("user_id", userId).limit(1);
  if (!existing || existing.length === 0) {
    const { data: insts } = await supabase.from("institutions").select("id, name");
    if (insts) {
      const find = (n: string) => insts.find((i) => i.name === n)?.id;
      const inserts = [
        find("Chase") && { user_id: userId, institution_id: find("Chase")!, nickname: "Checking", account_type: "checking", balance: 4200 },
        find("Marcus by Goldman Sachs") && { user_id: userId, institution_id: find("Marcus by Goldman Sachs")!, nickname: "Emergency Savings", account_type: "savings", balance: 6500 },
        find("Vanguard") && { user_id: userId, institution_id: find("Vanguard")!, nickname: "Roth IRA", account_type: "retirement", balance: 8400 },
        find("Chase") && { user_id: userId, institution_id: find("Chase")!, nickname: "Freedom Card", account_type: "credit_card", balance: -900 },
      ].filter(Boolean);
      if (inserts.length) await supabase.from("accounts").insert(inserts);
    }
  }
}

async function seedFlourishProfile(userId: string) {
  await supabase.from("profiles").upsert({
    user_id: userId,
    full_name: "Taylor Flourish",
    age_group: "35-44",
    income_range: "$100k+",
    employment_type: "full_time",
    location_type: "urban",
    household: "family",
    financial_confidence: "very",
    financial_accounts: ["checking", "savings", "retirement", "brokerage"],
    connected_bank: true,
    goals: ["financial_independence", "invest", "save_for_home"],
    onboarding_completed: true,
  }, { onConflict: "user_id" });

  const { data: existingXP } = await supabase.from("xp_ledger").select("id").eq("user_id", userId).limit(1);
  if (!existingXP || existingXP.length === 0) {
    await supabase.from("xp_ledger").insert([
      { user_id: userId, xp_amount: 100, reason: "Completed onboarding", source_type: "onboarding" },
      { user_id: userId, xp_amount: 200, reason: "Connected bank accounts", source_type: "banking" },
      { user_id: userId, xp_amount: 500, reason: "6-month emergency fund", source_type: "achievement" },
      { user_id: userId, xp_amount: 400, reason: "Portfolio hit $50k", source_type: "achievement" },
      { user_id: userId, xp_amount: 300, reason: "Debt-free milestone", source_type: "achievement" },
      { user_id: userId, xp_amount: 250, reason: "Consistent investor", source_type: "investing" },
      { user_id: userId, xp_amount: 200, reason: "30-day login streak", source_type: "engagement" },
      { user_id: userId, xp_amount: 500, reason: "All missions completed", source_type: "mission" },
      { user_id: userId, xp_amount: 350, reason: "Savings rate above 30%", source_type: "saving" },
      { user_id: userId, xp_amount: 400, reason: "Diversified portfolio", source_type: "achievement" },
      { user_id: userId, xp_amount: 300, reason: "Emergency fund fully funded", source_type: "saving" },
      { user_id: userId, xp_amount: 500, reason: "Financial independence path", source_type: "achievement" },
      { user_id: userId, xp_amount: 250, reason: "Helped 3 friends join", source_type: "engagement" },
      { user_id: userId, xp_amount: 200, reason: "Monthly review streak", source_type: "engagement" },
      { user_id: userId, xp_amount: 350, reason: "Net worth milestone $100k", source_type: "achievement" },
      { user_id: userId, xp_amount: 400, reason: "Tax-optimized investing", source_type: "investing" },
      { user_id: userId, xp_amount: 300, reason: "Max retirement contribution", source_type: "investing" },
      { user_id: userId, xp_amount: 200, reason: "90-day streak", source_type: "engagement" },
      { user_id: userId, xp_amount: 500, reason: "Legacy builder badge", source_type: "achievement" },
    ]);

    // All achievements
    const { data: achievements } = await supabase.from("achievements").select("id");
    if (achievements && achievements.length > 0) {
      await supabase.from("user_achievements").insert(
        achievements.map((a) => ({ user_id: userId, achievement_id: a.id }))
      );
    }

    // All missions completed
    const { data: missionsList } = await supabase.from("missions").select("id");
    if (missionsList && missionsList.length > 0) {
      await supabase.from("user_missions").insert(
        missionsList.map((m) => ({
          user_id: userId, mission_id: m.id,
          progress_value: 100, completed: true,
          completed_at: new Date().toISOString(),
        }))
      );
    }
  }

  const { data: existing } = await supabase.from("accounts").select("id").eq("user_id", userId).limit(1);
  if (!existing || existing.length === 0) {
    const { data: insts } = await supabase.from("institutions").select("id, name");
    if (insts) {
      const find = (n: string) => insts.find((i) => i.name === n)?.id;
      const inserts = [
        find("Chase") && { user_id: userId, institution_id: find("Chase")!, nickname: "Premium Checking", account_type: "checking", balance: 12500 },
        find("Marcus by Goldman Sachs") && { user_id: userId, institution_id: find("Marcus by Goldman Sachs")!, nickname: "Emergency Fund", account_type: "savings", balance: 24000 },
        find("Marcus by Goldman Sachs") && { user_id: userId, institution_id: find("Marcus by Goldman Sachs")!, nickname: "House Fund", account_type: "savings", balance: 35000 },
        find("Vanguard") && { user_id: userId, institution_id: find("Vanguard")!, nickname: "401(k)", account_type: "retirement", balance: 68000 },
        find("Vanguard") && { user_id: userId, institution_id: find("Vanguard")!, nickname: "Brokerage", account_type: "brokerage", balance: 42000 },
      ].filter(Boolean);
      if (inserts.length) await supabase.from("accounts").insert(inserts);
    }
  }
}

export async function seedDemoProfile(userId: string, level: number) {
  if (level === 0) return seedSeedProfile(userId);
  if (level === 2) return seedBloomProfile(userId);
  return seedFlourishProfile(userId);
}

export async function loginDemoProfile(profile: DemoProfile, navigate: (path: string) => void) {
  // Try sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: profile.password,
  });

  if (!signInError && signInData.user) {
    await seedDemoProfile(signInData.user.id, profile.level);
    navigate("/dashboard");
    return;
  }

  // Create account
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: profile.email,
    password: profile.password,
  });
  if (signUpError) throw signUpError;

  if (signUpData.user) {
    await seedDemoProfile(signUpData.user.id, profile.level);
    navigate("/dashboard");
  }
}
