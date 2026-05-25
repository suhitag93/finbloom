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

    const SAGE_SYSTEM_PROMPT = Deno.env.get("SAGE_SYSTEM_PROMPT");
    if (!SAGE_SYSTEM_PROMPT) {
      throw new Error("SAGE_SYSTEM_PROMPT is not configured");
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

    // Parse body once and validate
    const body = await req.json();
    const messages = body?.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    if (!lastUserMsg) {
      return new Response("Invalid request", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (typeof lastUserMsg.content === "string" && lastUserMsg.content.length > 500) {
      return new Response(
        JSON.stringify({
          error: "message_too_long",
          message: "Please keep messages under 500 characters.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const message = typeof lastUserMsg.content === "string" ? lastUserMsg.content : "";
    if (message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for DB reads
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Rate limit: 20 Sage calls per day ---
    const today = new Date().toISOString().slice(0, 10);
    const { data: rootState } = await supabase
      .from("root_state")
      .select("sage_calls_today, sage_reset_date")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!rootState) {
      await supabase.from("root_state").insert({ user_id: user.id, sage_calls_today: 0, sage_reset_date: today });
    } else if (rootState.sage_reset_date < today) {
      await supabase.from("root_state").update({ sage_calls_today: 0, sage_reset_date: today }).eq("user_id", user.id);
    } else if (rootState.sage_calls_today >= 20) {
      return new Response(
        JSON.stringify({ error: "daily_limit_reached", message: "You've had a full day of conversations with Sage. Come back tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const systemPrompt = `${SAGE_SYSTEM_PROMPT}

User context:

Progression tier: ${userContext?.persona_type || "unknown"}

Relationship context: ${userContext?.financial_stage || "unknown"}

Recent behavioral summary: ${profileInfo}

Relevant knowledge:
${knowledgeContext}`;

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
          model: "claude-haiku-4-5-20251001",
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

    // Increment sage_calls_today now that streaming has begun
    await supabase.rpc("increment_sage_calls", { p_user_id: user.id });

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
