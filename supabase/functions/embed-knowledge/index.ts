import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all knowledge_base rows without embeddings
    const { data: rows, error: fetchErr } = await supabase
      .from("knowledge_base")
      .select("id, title, content, category")
      .is("embedding", null);

    if (fetchErr) throw fetchErr;
    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No rows need embedding", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating embeddings for ${rows.length} rows`);

    let successCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const text = `${row.title || ""}\n\n${row.content}`.trim();

      try {
        // Use Lovable AI gateway embeddings endpoint
        const embResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/embeddings",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/text-embedding-3-small",
              input: text,
              dimensions: 1536,
            }),
          }
        );

        if (!embResponse.ok) {
          const errText = await embResponse.text();
          errors.push(`Row ${row.id}: Gateway ${embResponse.status} - ${errText}`);
          console.error(`Embedding failed for ${row.id}:`, errText);
          continue;
        }

        const embData = await embResponse.json();
        const embedding = embData.data?.[0]?.embedding;

        if (!embedding || !Array.isArray(embedding)) {
          errors.push(`Row ${row.id}: No embedding in response`);
          continue;
        }

        // Format as pgvector string
        const vectorStr = `[${embedding.join(",")}]`;

        const { error: updateErr } = await supabase
          .from("knowledge_base")
          .update({ embedding: vectorStr })
          .eq("id", row.id);

        if (updateErr) {
          errors.push(`Row ${row.id}: Update failed - ${updateErr.message}`);
        } else {
          successCount++;
          console.log(`Embedded: ${row.title} (${successCount}/${rows.length})`);
        }

        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        errors.push(`Row ${row.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return new Response(
      JSON.stringify({
        total: rows.length,
        success: successCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("embed-knowledge error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
