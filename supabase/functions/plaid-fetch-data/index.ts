import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID")!;
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("Plaid credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { item_id } = await req.json();
    if (!item_id) {
      return new Response(JSON.stringify({ error: "item_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get access token from plaid_connections
    const { data: connection, error: connError } = await supabase
      .from("plaid_connections")
      .select("access_token")
      .eq("user_id", user.id)
      .eq("item_id", item_id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "Plaid connection not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plaidBaseUrl = "https://sandbox.plaid.com";
    const access_token = connection.access_token;

    // Fetch accounts
    const accountsRes = await fetch(`${plaidBaseUrl}/accounts/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET, access_token }),
    });
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok) {
      console.error("Plaid accounts error:", accountsData);
      throw new Error("Failed to fetch accounts from Plaid");
    }

    // Get or create institution
    const plaidItem = accountsData.item;
    const instId = plaidItem?.institution_id;
    let institutionId: string;

    // Try to find existing institution by name, or create one
    const instName = instId || "Unknown Institution";
    let { data: existingInst } = await supabase
      .from("institutions")
      .select("id")
      .eq("name", instName)
      .maybeSingle();

    if (existingInst) {
      institutionId = existingInst.id;
    } else {
      // Fetch institution details from Plaid
      let instDisplayName = instName;
      let instLogo: string | null = null;
      if (instId) {
        try {
          const instRes = await fetch(`${plaidBaseUrl}/institutions/get_by_id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: PLAID_CLIENT_ID,
              secret: PLAID_SECRET,
              institution_id: instId,
              country_codes: ["US"],
            }),
          });
          const instData = await instRes.json();
          if (instRes.ok && instData.institution) {
            instDisplayName = instData.institution.name;
            instLogo = instData.institution.logo || null;
          }
        } catch (e) {
          console.warn("Could not fetch institution details:", e);
        }
      }

      const { data: newInst, error: instError } = await supabase
        .from("institutions")
        .insert({ name: instDisplayName, provider: "plaid", logo_url: instLogo, institution_type: "bank" })
        .select("id")
        .single();

      if (instError) throw new Error("Failed to create institution");
      institutionId = newInst.id;
    }

    // Upsert accounts
    const plaidAccountMap = new Map<string, string>(); // plaid_account_id -> our account id
    for (const acct of accountsData.accounts || []) {
      const accountType = mapPlaidAccountType(acct.type, acct.subtype);
      const balance = acct.balances?.current ?? 0;

      // Check if account already exists by nickname + institution
      const { data: existing } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("institution_id", institutionId)
        .eq("nickname", acct.name || acct.official_name || "Account")
        .maybeSingle();

      if (existing) {
        await supabase.from("accounts").update({
          balance: acct.type === "credit" ? -Math.abs(balance) : balance,
          account_type: accountType,
          last_synced_at: new Date().toISOString(),
        }).eq("id", existing.id);
        plaidAccountMap.set(acct.account_id, existing.id);
      } else {
        const { data: newAcct } = await supabase
          .from("accounts")
          .insert({
            user_id: user.id,
            institution_id: institutionId,
            nickname: acct.name || acct.official_name || "Account",
            account_type: accountType,
            account_subtype: acct.subtype || null,
            balance: acct.type === "credit" ? -Math.abs(balance) : balance,
            is_manual: false,
            last_synced_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (newAcct) plaidAccountMap.set(acct.account_id, newAcct.id);
      }
    }

    // Fetch transactions (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    try {
      const txRes = await fetch(`${plaidBaseUrl}/transactions/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET, access_token,
          start_date: startDate, end_date: endDate, options: { count: 500 },
        }),
      });
      const txData = await txRes.json();

      if (txRes.ok && txData.transactions) {
        for (const tx of txData.transactions) {
          const accountId = plaidAccountMap.get(tx.account_id);
          if (!accountId) continue;

          // Upsert by plaid_transaction_id
          await supabase.from("transactions").upsert({
            user_id: user.id,
            account_id: accountId,
            plaid_transaction_id: tx.transaction_id,
            merchant_name: tx.merchant_name || tx.name || "Unknown",
            amount: tx.amount,
            date: tx.date,
            category: tx.personal_finance_category?.primary || tx.category?.[0] || "other",
            subcategory: tx.personal_finance_category?.detailed || tx.category?.[1] || null,
            pending: tx.pending || false,
          }, { onConflict: "plaid_transaction_id" });
        }
      }
    } catch (e) {
      console.warn("Could not fetch transactions:", e);
    }

    // Fetch investments
    try {
      const invRes = await fetch(`${plaidBaseUrl}/investments/holdings/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET, access_token }),
      });
      const invData = await invRes.json();

      if (invRes.ok && invData.holdings) {
        const securities = new Map<string, any>();
        for (const sec of invData.securities || []) {
          securities.set(sec.security_id, sec);
        }

        for (const holding of invData.holdings) {
          const accountId = plaidAccountMap.get(holding.account_id);
          if (!accountId) continue;
          const security = securities.get(holding.security_id);

          await supabase.from("investment_holdings").upsert({
            user_id: user.id,
            account_id: accountId,
            symbol: security?.ticker_symbol || "N/A",
            name: security?.name || "Unknown Security",
            quantity: holding.quantity,
            current_value: holding.institution_value || (holding.quantity * (holding.institution_price || 0)),
            cost_basis: holding.cost_basis || 0,
            plaid_security_id: holding.security_id,
          }, { onConflict: "id" });
        }
      }
    } catch (e) {
      console.warn("Could not fetch investments:", e);
    }

    // Fetch liabilities
    try {
      const liabRes = await fetch(`${plaidBaseUrl}/liabilities/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: PLAID_CLIENT_ID, secret: PLAID_SECRET, access_token }),
      });
      const liabData = await liabRes.json();

      if (liabRes.ok && liabData.liabilities) {
        // Credit cards
        for (const cc of liabData.liabilities.credit || []) {
          const accountId = plaidAccountMap.get(cc.account_id);
          if (!accountId) continue;
          await supabase.from("liabilities").upsert({
            user_id: user.id,
            account_id: accountId,
            liability_type: "credit_card",
            balance: cc.last_statement_balance || 0,
            minimum_payment: cc.minimum_payment_amount || 0,
            apr: cc.aprs?.[0]?.apr_percentage || 0,
          }, { onConflict: "id" });
        }

        // Student loans
        for (const sl of liabData.liabilities.student || []) {
          const accountId = plaidAccountMap.get(sl.account_id);
          if (!accountId) continue;
          await supabase.from("liabilities").upsert({
            user_id: user.id,
            account_id: accountId,
            liability_type: "student_loan",
            balance: sl.outstanding_interest_amount + (sl.last_payment_amount || 0),
            minimum_payment: sl.minimum_payment_amount || 0,
            apr: sl.interest_rate_percentage || 0,
          }, { onConflict: "id" });
        }
      }
    } catch (e) {
      console.warn("Could not fetch liabilities:", e);
    }

    return new Response(
      JSON.stringify({ success: true, accounts_synced: plaidAccountMap.size }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("plaid-fetch-data error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapPlaidAccountType(type: string, subtype: string): string {
  if (type === "investment" || type === "brokerage") return "investment";
  if (type === "credit") return "credit_card";
  if (type === "loan") return "loan";
  if (subtype === "savings" || subtype === "money market" || subtype === "cd") return "savings";
  if (subtype === "401k" || subtype === "ira" || subtype === "roth" || subtype === "401a") return "retirement";
  if (subtype === "checking") return "checking";
  return subtype || type || "checking";
}
