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
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Find demo user
    const { data: users } = await supabase.auth.admin.listUsers();
    const demoUser = users?.users?.find((u) => u.email === DEMO_EMAIL);
    if (!demoUser) {
      return new Response(JSON.stringify({ error: "Demo user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = demoUser.id;

    // Call the seed function internally by re-running the same logic
    // First clear all demo data
    await supabase.from("goal_milestones").delete().eq("user_id", userId);
    await supabase.from("goal_accounts").delete().eq("user_id", userId);
    await supabase.from("investment_holdings").delete().eq("user_id", userId);
    await supabase.from("liabilities").delete().eq("user_id", userId);
    await supabase.from("transactions").delete().eq("user_id", userId);
    await supabase.from("accounts").delete().eq("user_id", userId);
    await supabase.from("goals").delete().eq("user_id", userId);
    await supabase.from("user_missions").delete().eq("user_id", userId);
    await supabase.from("user_achievements").delete().eq("user_id", userId);
    await supabase.from("xp_ledger").delete().eq("user_id", userId);

    // Reset XP on profile via bypass
    // The seed function will re-award XP
    // Call the seed function via HTTP
    const seedUrl = `${supabaseUrl}/functions/v1/seed-demo-account`;
    const seedRes = await fetch(seedUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    const seedResult = await seedRes.json();

    return new Response(JSON.stringify({ success: true, seed: seedResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Reset demo error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
