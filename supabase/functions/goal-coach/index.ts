import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { goalType, answers, financialContext } = await req.json();

    const systemPrompt = `You are FinBloom's AI financial coach. You're warm, encouraging, and specific. Use a conversational tone like a supportive friend who's great with money. Use emoji sparingly (1-2 per response). Keep responses under 200 words.

You help users create personalized savings/investment goals based on their real financial data.

Given the user's goal type, their answers to follow-up questions, and their actual financial data, generate:
1. A recommended monthly contribution amount (be specific, reference their spending)
2. A realistic target date
3. 2-3 actionable insights referencing their ACTUAL spending categories and amounts
4. An encouraging closing message
5. A suggested target amount if not already clear

Respond in JSON format:
{
  "message": "Your conversational coaching message here...",
  "recommended_monthly": 250,
  "target_amount": 5000,
  "target_date": "2027-03-01",
  "title": "Emergency Fund",
  "insights": ["insight1", "insight2"]
}`;

    const userPrompt = `Goal type: ${goalType}

User's answers: ${JSON.stringify(answers)}

Financial context:
- Monthly spending: $${financialContext.totalSpending?.toFixed(0) || 'unknown'}
- Spending breakdown: ${JSON.stringify(financialContext.spendingByCategory || {})}
- Total investments: $${financialContext.totalInvestments?.toFixed(0) || '0'}
- Total debt: $${financialContext.totalDebt?.toFixed(0) || '0'}
- Available accounts: ${JSON.stringify(financialContext.accounts?.map((a: any) => ({ name: a.nickname, type: a.account_type, balance: a.balance })) || [])}

Please provide a personalized goal plan.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: content };
    } catch {
      parsed = { message: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("goal-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
