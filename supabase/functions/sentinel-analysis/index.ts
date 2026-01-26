import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * EXOS Sentinel Analysis Edge Function
 * 
 * Processes procurement analysis requests through the full pipeline:
 * 1. Receives pre-processed (anonymized + grounded) context from client
 * 2. Calls AI gateway with grounded prompt
 * 3. Returns response for client-side validation and de-anonymization
 * 
 * Future: Support for local Mistral model endpoint
 */

interface AnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  useLocalModel?: boolean;
  localModelEndpoint?: string;
  stream?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      systemPrompt, 
      userPrompt, 
      model = "google/gemini-3-flash-preview",
      useLocalModel = false,
      localModelEndpoint,
      stream = false
    }: AnalysisRequest = await req.json();

    // Validate required fields
    if (!systemPrompt || !userPrompt) {
      return new Response(
        JSON.stringify({ error: "Missing systemPrompt or userPrompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Future: Route to local Mistral model if configured
    if (useLocalModel && localModelEndpoint) {
      console.log(`[Sentinel] Routing to local model at ${localModelEndpoint}`);
      
      // Placeholder for local model call
      // When Mistral is deployed, implement the call here
      return new Response(
        JSON.stringify({ 
          error: "Local model endpoint not yet implemented",
          message: "Configure your Mistral model endpoint and uncomment the local model logic"
        }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
      /*
      // Example local model call (uncomment when ready):
      const localResponse = await fetch(localModelEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral-small",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });
      
      if (!localResponse.ok) {
        throw new Error(`Local model error: ${localResponse.status}`);
      }
      
      const localData = await localResponse.json();
      return new Response(
        JSON.stringify({
          content: localData.choices?.[0]?.message?.content || "",
          model: "mistral-small-local",
          source: "local"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      */
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[Sentinel] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Sentinel] Calling AI gateway with model: ${model}`);
    console.log(`[Sentinel] Prompt length: ${userPrompt.length} chars`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4, // Lower temperature for more consistent procurement analysis
        max_tokens: 4096,
        stream
      }),
    });

    // Handle rate limits and payment required
    if (aiResponse.status === 429) {
      console.warn("[Sentinel] Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (aiResponse.status === 402) {
      console.warn("[Sentinel] Payment required");
      return new Response(
        JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[Sentinel] AI gateway error: ${aiResponse.status}`, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle streaming response
    if (stream) {
      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Handle non-streaming response
    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log(`[Sentinel] Response received: ${content.length} chars`);

    return new Response(
      JSON.stringify({
        content,
        model,
        source: "cloud",
        usage: data.usage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Sentinel] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
