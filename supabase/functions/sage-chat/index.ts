import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create user-scoped client to get user identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for DB reads
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch user context for personalization
    const { data: userContext } = await supabase
      .from("user_context")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, financial_confidence, financial_personality, finbloom_level, xp_points, goals, income_range")
      .eq("user_id", user.id)
      .maybeSingle();

    // 3. Retrieve relevant knowledge via full-text search
    const searchTerms = message.split(/\s+/).slice(0, 8).join(" ");
    const { data: knowledgeResults } = await supabase.rpc("match_knowledge", {
      search_query: searchTerms,
      match_count: 4,
    });

    // 4. Fetch recent conversation history (last 10 messages)
    const { data: recentMessages } = await supabase
      .from("conversations")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const conversationHistory = (recentMessages || []).reverse();

    // 5. Save the user message
    await supabase.from("conversations").insert({
      user_id: user.id,
      role: "user",
      content: message.trim(),
    });

    // 6. Build system prompt with context
    const knowledgeContext = knowledgeResults?.length
      ? knowledgeResults
          .map((k: { title: string; content: string; category: string }) =>
            `[${k.category}] ${k.title}: ${k.content}`
          )
          .join("\n\n")
      : "";

    const personaInfo = userContext
      ? `User persona: ${userContext.persona_type || "unknown"}. ` +
        `Financial stage: ${userContext.financial_stage || "unknown"}. ` +
        `Primary goal: ${userContext.primary_goal || "not set"}. ` +
        `Money feelings: ${userContext.money_feeling?.join(", ") || "unknown"}.`
      : "";

    const profileInfo = profile
      ? `Name: ${profile.full_name || "friend"}. ` +
        `Confidence: ${profile.financial_confidence || "unknown"}. ` +
        `Level: ${profile.finbloom_level}. XP: ${profile.xp_points}. ` +
        `Income: ${profile.income_range || "unknown"}.`
      : "";

    const systemPrompt = `You are Sage, the personal financial wellness coach inside finBloom. 

PERSONALITY:
- Warm, direct, and a little irreverent — like a knowledgeable best friend who understands money
- Never judgmental about where someone is financially
- Celebrate progress, no matter how small
- Use "you" language, speak directly to the person
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail
- Use occasional emoji sparingly (1-2 per message max) for warmth
- Never use financial jargon without explaining it

WHAT YOU DO:
- Help users understand their finances without shame or overwhelm
- Provide emotional support around money anxiety and avoidance
- Give practical, actionable next steps
- Reference finBloom features (missions, goals, XP) when relevant
- Ask thoughtful follow-up questions to deepen understanding

WHAT YOU DON'T DO:
- Give specific investment recommendations or tax advice
- Promise specific financial outcomes
- Make the user feel bad about their situation
- Use overly formal or corporate language
- Provide legal or licensed financial planning advice

${personaInfo ? `\nUSER CONTEXT:\n${personaInfo}` : ""}
${profileInfo ? `\nUSER PROFILE:\n${profileInfo}` : ""}

${knowledgeContext ? `\nRELEVANT KNOWLEDGE (use naturally, don't quote directly):\n${knowledgeContext}` : ""}

Remember: Financial psychological safety comes first. Make engaging with money feel safe, rewarding, and achievable.`;

    // 7. Build messages array
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message.trim() },
    ];

    // 8. Call Lovable AI Gateway with streaming
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          stream: true,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    // 9. Create a transform stream that collects the full response for saving
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Process in background: forward stream + collect full response
    (async () => {
      let fullResponse = "";
      const reader = aiResponse.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          await writer.write(encoder.encode(chunk));

          // Extract content from SSE for saving
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullResponse += content;
            } catch { /* partial JSON, skip */ }
          }
        }

        // Save assistant response to conversations
        if (fullResponse.trim()) {
          await supabase.from("conversations").insert({
            user_id: user.id,
            role: "assistant",
            content: fullResponse.trim(),
          });
        }
      } catch (e) {
        console.error("Stream processing error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("sage-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
