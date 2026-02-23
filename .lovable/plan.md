

# Add Region Focus + Detailed Output to Market Intelligence

## What Changes

### 1. New "Region Focus" Parameter
Add a dropdown to the Query Builder with these options:
- Global (default -- no regional bias)
- Europe (EU/EEA)
- North America (US/Canada)
- Asia-Pacific (APAC)
- Middle East & Africa (MEA)
- Latin America (LATAM)

The selected region gets injected into the Perplexity system prompt as a regional directive, e.g.:
> "Focus your analysis on the **European (EU/EEA)** market. Prioritize sources and data relevant to this region."

### 2. Always-Detailed Output
All queries will produce detailed, deep-dive responses by:
- Adding `max_tokens: 4096` to the Perplexity API call (currently unlimited/default ~1024)
- Appending a "depth directive" to every system prompt: *"Provide a comprehensive, detailed analysis. Include specific data points, percentages, named entities, and actionable recommendations."*

No UI toggle needed since all outputs should be detailed.

### 3. Database Migration
Add a nullable `region_filter` text column to `intel_queries` so query history records which region was selected.

---

## Files Changed (4 files + 1 migration)

### Migration: Add `region_filter` column
```sql
ALTER TABLE public.intel_queries ADD COLUMN region_filter text;
```

### File 1: `src/hooks/useMarketIntelligence.ts`
- Add `RegionFilter` type: `'global' | 'europe' | 'north-america' | 'asia-pacific' | 'mea' | 'latam'`
- Add `regionFilter?: RegionFilter` to `IntelQueryParams`
- Add `REGION_OPTIONS` constant with labels for the dropdown
- Add `region_filter` to `IntelQuery` interface

### File 2: `src/components/intelligence/QueryBuilder.tsx`
- Add `regionFilter` state (default: `"global"`)
- Add a new Select dropdown labeled "Region Focus" between Time Range and Advanced Options
- Pass `regionFilter` in `onSubmit` params (skip if `"global"`)

### File 3: `supabase/functions/market-intelligence/index.ts`
- Add `regionFilter` to `IntelRequest` interface
- Validate with `requireStringEnum` (optional)
- Build a `REGION_PROMPTS` map that returns a regional directive string per region
- Append `REGION_PROMPTS[regionFilter]` + the depth directive to every system prompt
- Set `max_tokens: 4096` in the Perplexity API body
- Store `region_filter` in the `intel_queries` insert

### File 4: `src/integrations/supabase/types.ts`
- Auto-generated after migration (no manual edit)

---

## Technical Details

**Region prompt injection example** (appended to the query-type system prompt):

```text
REGIONAL FOCUS: European (EU/EEA) market.
Prioritize sources, regulations, suppliers, and pricing data relevant to this region.
If global data is referenced, clearly distinguish it from region-specific findings.

DEPTH: Provide a comprehensive, detailed analysis with specific data points,
percentages, named entities, timelines, and actionable recommendations.
Structure your response with clear headers and sub-sections.
```

**Perplexity API body change:**
```typescript
const perplexityBody = {
  model: "sonar-pro",
  max_tokens: 4096,  // NEW: ensures detailed output
  messages: [
    { role: "system", content: systemPrompt + regionDirective + depthDirective },
    { role: "user", content: enrichedQuery }
  ],
  // ... existing filters
};
```

**Zero breaking changes:** `regionFilter` is optional everywhere. Existing queries without it continue to work as "Global" with the same detailed depth.

