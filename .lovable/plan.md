

## New Scenario: Market Snapshot

### Summary

A Perplexity Sonar Pro-powered scenario that produces a structured regional competitive landscape analysis. Unlike other scenarios that use the Sentinel pipeline (Lovable AI), this one routes through the **market-intelligence** edge function (Perplexity) for real-time web-grounded research, then applies a post-analysis quality gate using the Sentinel pipeline to benchmark the output against user-defined success criteria.

### Architecture Decision: Two-Phase Pipeline

This scenario is unique because it requires **two AI calls**:

```text
Phase 1: Market Research (Perplexity Sonar Pro)
   Input: Region + Industry + Analysis Focus + Optional Success Criteria
   Output: Structured competitive landscape with citations

Phase 2: Quality Gate (Lovable AI / Sentinel)
   Input: Phase 1 output + Success Criteria (user-defined + AI-inferred)
   Output: Completeness score, gap analysis, clarification requests, suggested follow-up sources
```

**Option A (Recommended): Single new edge function `market-snapshot`**
- Handles both phases server-side in sequence
- Cleaner UX (one loading state), lower latency (no client round-trip between phases)
- LangSmith tracing captures both phases as child spans

**Option B: Reuse existing edge functions separately**
- Call `market-intelligence` then `sentinel-analysis` from the client
- More modular but adds client-side orchestration complexity and double loading states

Recommending **Option A** for better UX and simpler error handling.

### Changes Across 5 Files + 1 New Edge Function

**1. `src/lib/scenarios.ts` -- Add scenario definition**

```text
id: "market-snapshot"
title: "Market Snapshot"
icon: Radar (already imported)
category: "planning"
status: "available"
strategySelector: none (research scenario, not strategic tradeoff)

Fields:
  - industryContext (text, required: false) -- auto-injected
  - region (select, required: true)
    Options: Germany, France, UK, Netherlands, Spain, Italy, Poland,
             USA, Canada, Mexico, Brazil,
             China, Japan, South Korea, India, Australia,
             UAE, Saudi Arabia, South Africa
  - analysisScope (textarea, required: true)
    "What do you want to know? E.g., 'Top 5 logistics providers,
     their market share, pricing models, and recent M&A activity'"
  - successCriteria (textarea, required: false)
    "What does a good answer look like? E.g., 'Must include revenue
     figures, market share %, and at least 3 cited sources per player'"
  - timeframe (select, required: true)
    Options: Current Snapshot, Past Month, Past Quarter, Past Year

Outputs:
  - Regional Competitive Landscape (Major Players & Market Share)
  - Player Profiles (Strengths, Weaknesses, Recent Moves)
  - Completeness Scorecard (Definition of Success Benchmark)
  - Gap Analysis & Clarification Requests
  - Recommended Sources for Further Discovery
```

**2. `src/lib/dashboard-mappings.ts` -- Add mapping**
```text
"market-snapshot": ["supplier-scorecard", "decision-matrix", "risk-matrix", "data-quality"]
```
- Supplier scorecard for player comparison
- Decision matrix for weighted player ranking
- Risk matrix for regional risk factors
- Data quality for completeness scoring

**3. `src/lib/test-data-factory.ts` -- Add generator**
- Random region selection from the country list
- Realistic analysis scope examples (logistics providers, raw material suppliers, SaaS vendors)
- Sample success criteria text
- Random timeframe selection

**4. `supabase/functions/generate-test-data/index.ts` -- Add field list**
```text
"market-snapshot": ["industryContext", "region", "analysisScope", "successCriteria", "timeframe"]
```

**5. NEW: `supabase/functions/market-snapshot/index.ts` -- Two-phase edge function**

Phase 1 (Perplexity Sonar Pro):
- System prompt enforces **strict regional filtering**: "You are analyzing ONLY the {region} market. Do NOT include players, data, or trends from other regions unless they directly impact {region}."
- Maps timeframe to `search_recency_filter`
- Returns structured analysis with citations

Phase 2 (Quality Gate via Lovable AI):
- Takes Phase 1 output + user's success criteria
- If user provided no criteria, AI generates reasonable ones from the analysis scope
- Scores output completeness (0-100) against each criterion
- Identifies gaps (missing data points, unverified claims)
- Generates clarification questions for the user if critical info was missing
- Suggests specific sources/databases for further research
- Returns combined payload with both the analysis and the quality assessment

Key implementation details:
- Uses `PERPLEXITY_API_KEY` (already configured via connector)
- Uses `LOVABLE_API_KEY` for the quality gate phase
- LangSmith tracing with parent chain + two child spans
- Authentication via shared `authenticateRequest`
- Validation via shared `validate.ts`
- Stores results in `intel_queries` table (reuses existing table)

**6. `src/hooks/useMarketSnapshot.ts` -- New hook (optional)**

Could reuse `useSentinel` but the two-phase response structure (analysis + quality gate) is different enough to warrant a dedicated hook. However, the GenericScenarioWizard already handles edge function responses generically through the Sentinel pipeline.

**Simpler approach**: Route through the existing Sentinel hook but have the `market-snapshot` edge function called directly. The GenericScenarioWizard already supports custom edge function routing -- we just need to add a conditional in the wizard's analysis step.

**Decision**: Use a **thin wrapper** -- the wizard calls `market-snapshot` edge function directly (like `market-intelligence` does), bypassing the Sentinel anonymization pipeline since this is a research query, not a sensitive internal analysis.

### Post-Analysis Clarification Flow

When the quality gate detects gaps, the response includes a `clarifications` array. The results view will show:
- The main analysis (always shown)
- A "Completeness Score" badge (e.g., 72/100)
- A collapsible "Gaps & Follow-up" section with:
  - Missing data points flagged by the quality gate
  - Suggested clarifying questions
  - Recommended external sources (industry databases, trade associations, government statistics)

This requires a small addition to the results rendering in `GenericScenarioWizard` or a dedicated results component for market-snapshot.

### Regional Filtering Strategy

The region constraint is enforced at **three levels**:
1. **Prompt-level**: System prompt explicitly restricts analysis to the selected region
2. **Domain-level**: Perplexity `search_domain_filter` can optionally prioritize regional sources (e.g., `.de` domains for Germany)
3. **Quality gate**: The completeness check verifies that cited sources and data points are region-relevant

### Technical Details

```text
Files Modified: 4
  1. src/lib/scenarios.ts -- Add market-snapshot object
  2. src/lib/dashboard-mappings.ts -- Add mapping
  3. src/lib/test-data-factory.ts -- Add generator
  4. supabase/functions/generate-test-data/index.ts -- Add field list

Files Created: 1
  5. supabase/functions/market-snapshot/index.ts -- Two-phase edge function

Integration Points:
  - Perplexity Sonar Pro (Phase 1) -- existing connector
  - Lovable AI Gateway (Phase 2) -- existing LOVABLE_API_KEY
  - LangSmith tracing -- existing _shared/langsmith.ts
  - intel_queries table -- existing, reused for storage
  - GenericScenarioWizard -- needs conditional to call market-snapshot
    instead of sentinel-analysis for this scenario ID
```

### What This Does NOT Include (Future Iterations)
- Pre-flight clarification check (user chose post-analysis only)
- Scheduled/recurring snapshots (roadmap)
- Comparison between regions (could be a follow-up scenario)
- Custom domain filtering UI (Perplexity handles source selection automatically)

