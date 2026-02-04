import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface IndustryCategory {
  industrySlug: string;
  industryName: string;
  categorySlug: string;
  categoryName: string;
  geography?: string; // e.g., "EU", "US", "APAC", "Global"
}

interface GenerateRequest {
  combinations: IndustryCategory[];
  validateOnly?: boolean;
  defaultGeography?: string; // Applied to combinations without explicit geography
}

// Plausible industry+category combinations with expected high confidence
const PLAUSIBLE_COMBINATIONS: IndustryCategory[] = [
  { industrySlug: "pharma-life-sciences", industryName: "Pharma & Life Sciences", categorySlug: "lab-supplies", categoryName: "Lab Supplies" },
  { industrySlug: "automotive-oem", industryName: "Automotive (OEM)", categorySlug: "raw-materials-steel", categoryName: "Raw Materials (Steel)" },
  { industrySlug: "retail", industryName: "Retail", categorySlug: "logistics-small-parcel", categoryName: "Logistics (Small Parcel)" },
  { industrySlug: "saas-enterprise", industryName: "SaaS (Enterprise)", categorySlug: "it-software-saas", categoryName: "IT Software (SaaS)" },
  { industrySlug: "healthcare", industryName: "Healthcare", categorySlug: "mro-maintenance", categoryName: "MRO (Maintenance)" },
  { industrySlug: "electronics", industryName: "Electronics", categorySlug: "semiconductors", categoryName: "Semiconductors" },
  { industrySlug: "food-beverage", industryName: "Food & Beverage", categorySlug: "packaging-primary", categoryName: "Packaging (Primary)" },
  { industrySlug: "construction-infra", industryName: "Construction & Infra", categorySlug: "construction-materials", categoryName: "Construction Materials" },
  { industrySlug: "aerospace-defense", industryName: "Aerospace & Defense", categorySlug: "electronic-components", categoryName: "Electronic Components" },
  { industrySlug: "chemicals", industryName: "Chemicals", categorySlug: "chemicals-specialty", categoryName: "Chemicals (Specialty)" },
];

const VALIDATION_PROMPT = `You are a procurement industry expert. Evaluate how plausible this industry+category combination is for procurement analysis.

Industry: {{INDUSTRY}}
Procurement Category: {{CATEGORY}}

Rate the plausibility on a scale of 0.0 to 1.0 where:
- 1.0 = Highly relevant (this category is core to this industry's procurement)
- 0.7-0.9 = Relevant (common procurement category for this industry)
- 0.4-0.6 = Somewhat relevant (occasionally procured)
- 0.1-0.3 = Low relevance (rare for this industry)
- 0.0 = Not relevant (makes no sense)

Respond with ONLY a JSON object:
{"confidence": 0.85, "reasoning": "Brief explanation"}`;

const MARKET_INSIGHTS_PROMPT = `You are a senior procurement intelligence analyst. Generate comprehensive market insights for the following industry and procurement category combination.

Industry: {{INDUSTRY}}
Procurement Category: {{CATEGORY}}
Geographic Focus: {{GEOGRAPHY}}

Provide a detailed market intelligence briefing covering:

1. **Current Market Conditions**: Supply/demand dynamics, pricing trends, capacity utilization in {{GEOGRAPHY}}
2. **Key Market Players**: Major suppliers in {{GEOGRAPHY}}, market shares, recent M&A activity
3. **Risk Signals**: Supply chain disruptions, geopolitical factors, regulatory changes affecting {{GEOGRAPHY}}
4. **Price Drivers**: Raw material costs, labor, energy, logistics specific to {{GEOGRAPHY}}
5. **Technology Trends**: Innovation, automation, sustainability initiatives in {{GEOGRAPHY}}
6. **Procurement Opportunities**: Timing recommendations, negotiation leverage points, alternative sources in {{GEOGRAPHY}}

Focus on actionable intelligence for procurement professionals operating in {{GEOGRAPHY}}. Include specific data points, percentages, and timeframes where possible. Reference {{GEOGRAPHY}}-specific regulations, standards, and market dynamics.

Structure your response with clear sections and bullet points. Be specific and quantitative.`;

async function validateCombination(
  apiKey: string,
  industry: string,
  category: string
): Promise<{ confidence: number; reasoning: string }> {
  const prompt = VALIDATION_PROMPT
    .replace("{{INDUSTRY}}", industry)
    .replace("{{CATEGORY}}", category);

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Validation API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.error("Failed to parse validation response:", content);
  }
  
  return { confidence: 0.5, reasoning: "Unable to parse validation response" };
}

async function generateMarketInsights(
  apiKey: string,
  industry: string,
  category: string,
  geography: string
): Promise<{ content: string; citations: string[]; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null }> {
  const prompt = MARKET_INSIGHTS_PROMPT
    .replace("{{INDUSTRY}}", industry)
    .replace("{{CATEGORY}}", category)
    .replace(/\{\{GEOGRAPHY\}\}/g, geography);

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: "You are a procurement intelligence analyst providing market insights. Be specific, quantitative, and actionable. Always cite sources." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      search_recency_filter: "month",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Market insights API error:", response.status, errorText);
    throw new Error(`Market insights API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
    usage: data.usage || null,
  };
}

function extractInsightArrays(content: string): { trends: string[]; risks: string[]; opportunities: string[] } {
  const trends: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];

  // Extract key trends (items after "Market Conditions" or "Trends")
  const trendMatches = content.match(/(?:trend|condition|dynamic)[s]?[:\s]*[-•*]\s*([^\n]+)/gi);
  if (trendMatches) {
    trends.push(...trendMatches.slice(0, 5).map(m => m.replace(/^[^:]+:\s*[-•*]\s*/, '').trim()));
  }

  // Extract risk signals
  const riskMatches = content.match(/(?:risk|disrupt|threat|concern)[s]?[:\s]*[-•*]\s*([^\n]+)/gi);
  if (riskMatches) {
    risks.push(...riskMatches.slice(0, 5).map(m => m.replace(/^[^:]+:\s*[-•*]\s*/, '').trim()));
  }

  // Extract opportunities
  const oppMatches = content.match(/(?:opportunit|recommend|leverage|advantage)[ies]*[:\s]*[-•*]\s*([^\n]+)/gi);
  if (oppMatches) {
    opportunities.push(...oppMatches.slice(0, 5).map(m => m.replace(/^[^:]+:\s*[-•*]\s*/, '').trim()));
  }

  return { trends, risks, opportunities };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { combinations, validateOnly, defaultGeography = "EU" } = body as GenerateRequest;

    // Use provided combinations or default plausible ones
    const targetCombinations = combinations?.length > 0 
      ? combinations 
      : PLAUSIBLE_COMBINATIONS.slice(0, 5);
    
    // Apply default geography to combinations that don't have one
    const combinationsWithGeo = targetCombinations.map(c => ({
      ...c,
      geography: c.geography || defaultGeography,
    }));

    const results: Array<{
      industry: string;
      category: string;
      confidence: number;
      success: boolean;
      error?: string;
      insightId?: string;
    }> = [];

    let totalTokens = 0;
    let totalCost = 0;

    for (const combo of combinationsWithGeo) {
      try {
        console.log(`Processing: ${combo.industryName} + ${combo.categoryName} [${combo.geography}]`);

        // Step 1: Validate combination plausibility
        const validation = await validateCombination(
          PERPLEXITY_API_KEY,
          combo.industryName,
          combo.categoryName
        );

        console.log(`Validation: confidence=${validation.confidence}, reason=${validation.reasoning}`);

        // Skip if confidence too low
        if (validation.confidence < 0.4) {
          results.push({
            industry: combo.industrySlug,
            category: combo.categorySlug,
            confidence: validation.confidence,
            success: false,
            error: `Low confidence: ${validation.reasoning}`,
          });
          continue;
        }

        if (validateOnly) {
          results.push({
            industry: combo.industrySlug,
            category: combo.categorySlug,
            confidence: validation.confidence,
            success: true,
          });
          continue;
        }

        // Step 2: Archive existing active insight
        await supabase
          .from("market_insights")
          .update({ is_active: false })
          .eq("industry_slug", combo.industrySlug)
          .eq("category_slug", combo.categorySlug)
          .eq("is_active", true);

        // Step 3: Generate market insights with geography focus
        const insights = await generateMarketInsights(
          PERPLEXITY_API_KEY,
          combo.industryName,
          combo.categoryName,
          combo.geography
        );

        if (insights.usage) {
          totalTokens += insights.usage.total_tokens;
          // Sonar-pro pricing: $5/1000 requests, roughly $0.003/1K tokens
          totalCost += (insights.usage.total_tokens / 1000) * 0.003;
        }

        // Extract structured data from content
        const { trends, risks, opportunities } = extractInsightArrays(insights.content);

        // Step 4: Store new insight
        const { data: insertedData, error: insertError } = await supabase
          .from("market_insights")
          .insert({
            industry_slug: combo.industrySlug,
            industry_name: combo.industryName,
            category_slug: combo.categorySlug,
            category_name: combo.categoryName,
            confidence_score: validation.confidence,
            content: insights.content,
            citations: insights.citations.map((url, i) => ({ index: i + 1, url })),
            key_trends: trends,
            risk_signals: risks,
            opportunities: opportunities,
            raw_response: { usage: insights.usage },
            model_used: "sonar-pro",
            processing_time_ms: Date.now() - startTime,
            is_active: true,
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(`Insert error: ${insertError.message}`);
        }

        results.push({
          industry: combo.industrySlug,
          category: combo.categorySlug,
          confidence: validation.confidence,
          success: true,
          insightId: insertedData?.id,
        });

      } catch (error) {
        console.error(`Error processing ${combo.industrySlug}+${combo.categorySlug}:`, error);
        results.push({
          industry: combo.industrySlug,
          category: combo.categorySlug,
          confidence: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          processingTimeMs,
          totalTokens,
          estimatedCost: `$${totalCost.toFixed(4)}`,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Generate market insights error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
