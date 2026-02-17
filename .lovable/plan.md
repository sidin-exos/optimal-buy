

## Upgrade: "Budgeting Assistant" → "Predictive Budgeting & Forecasting"

### Summary

Replace the old parameter-heavy budgeting scenario with a streamlined forecasting engine that explicitly fuses internal historical data with external Market Intelligence. The key strategic addition is a visible `categoryContext` field -- a first for the scenario system -- signaling to the user that external market data is being injected into their forecast.

### Changes Across 4 Files

**1. `src/lib/scenarios.ts`**
- Add `TrendingUp` to the lucide-react import (line 2 area)
- Replace the `budgeting-assistant` block (lines 549-573) with `forecasting-budgeting`:
  - `icon: TrendingUp` (replaces `Wallet`)
  - `category: "planning"`, `status: "available"`, `strategySelector: "costVsRisk"`
  - 6 fields per spec: `industryContext` (text), `categoryContext` (text, new), `historicalSpendData` (textarea), `knownFutureEvents` (textarea), `budgetConstraints` (text), `forecastHorizon` (select)
  - 5 narrative outputs with explicit Market Intelligence overlay
  - No `MAIN_FOCUS_FIELD` -- the scenario is self-describing via its structured fields

**Note on `categoryContext` field**: This is a new field type for the scenario system. It follows the same pattern as `industryContext` (auto-injected, optional, handled by `BusinessContextField` and the category selector). The existing `GenericScenarioWizard` already supports category selection and passes `categorySlug` to the edge function for server-side grounding -- this field makes that integration visible to the user.

**2. `src/lib/dashboard-mappings.ts`**
- Remove `"budgeting-assistant"` key (line 132)
- Add `"forecasting-budgeting": ["sensitivity-spider", "cost-waterfall", "timeline-roadmap", "risk-matrix"]`
- Sensitivity spider promoted to primary position (probabilistic sensitivity is the core output)

**3. `src/lib/test-data-factory.ts`**
- Remove `"budgeting-assistant"` generator (lines 527-549)
- Add `"forecasting-budgeting"` generator producing:
  - Multi-line quarterly CSV-style historical spend text (8-12 quarters, 3-4 categories)
  - Realistic future events list with dates and cost estimates
  - Budget constraints text
  - Random forecast horizon selection
  - Category context placeholder (populated by wizard)

**4. `supabase/functions/generate-test-data/index.ts`**
- Remove `"budgeting-assistant"` field list (lines 153-156)
- Add `"forecasting-budgeting"` with field IDs: `industryContext`, `categoryContext`, `historicalSpendData`, `knownFutureEvents`, `budgetConstraints`, `forecastHorizon`

### Edge Function Prompt Enhancement

The sentinel-analysis edge function already handles server-side grounding via `categorySlug`. No structural changes needed. However, the `buildServerGroundedPrompts` function will naturally include the category context XML when the user selects a category -- this means the AI will already cross-reference historical spend data with category-specific inflation trends and supply chain risks from the grounding context.

The spec's directive ("cross-reference historicalSpendData with industryContext and categoryContext") is satisfied by the existing architecture: the scenario data fields (including `historicalSpendData`) are passed as `<user-input>` XML, while industry/category grounding is injected into the system prompt via `<grounding-context>`. The AI sees both simultaneously during inference.

### What This Does NOT Change
- No new components needed
- No database changes
- No new edge functions
- The existing Market Insights banner in `GenericScenarioWizard` will automatically surface when a matching industry+category insight exists, appending real-time market data to the analysis payload via `_marketInsights`

### Technical Details

```text
Files Modified: 4

1. src/lib/scenarios.ts
   - Import: add TrendingUp to lucide-react imports
   - Replace lines 549-573 (budgeting-assistant block)
   - New field: categoryContext (type: "text", required: false)
   - icon: TrendingUp, category: "planning", strategySelector: "costVsRisk"

2. src/lib/dashboard-mappings.ts
   - Line 132: replace budgeting-assistant with forecasting-budgeting
   - Dashboard order: sensitivity-spider, cost-waterfall, timeline-roadmap, risk-matrix

3. src/lib/test-data-factory.ts
   - Lines 527-549: replace budgeting-assistant generator
   - Generate realistic multi-quarter CSV text + future events list

4. supabase/functions/generate-test-data/index.ts
   - Lines 153-156: replace field list for new scenario ID
```
