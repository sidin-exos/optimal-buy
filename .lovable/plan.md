

## Spend Analysis & Categorization Scenario

### Spec Issues Found (Auto-corrected)

1. **Category mismatch**: Spec says `"analytics"` -- not a valid value. Will use `"analysis"` (matches existing cost/TCO scenarios).
2. **Missing required fields**: Spec omits `icon`, `status`, `industryContext`, and `mainFocus` -- all mandatory per existing patterns.
3. **Missing dashboard mapping**: No dashboards specified. Will assign relevant ones.

### Changes

**1. `src/lib/scenarios.ts`**
- Add `PieChart` icon (already imported, fits spend categorization)
- Add scenario object with:
  - `category: "analysis"`, `status: "available"`
  - `industryContext` field + `MAIN_FOCUS_FIELD` (standard pattern)
  - `rawSpendData` (textarea), `timeframe` (text), `businessGoal` (text, optional) per spec
- No `strategySelector` needed (data analysis, not strategic tradeoff)

**2. `src/lib/dashboard-mappings.ts`**
- Add mapping: `"spend-analysis-categorization": ["cost-waterfall", "kraljic-quadrant", "supplier-scorecard", "data-quality"]`
- Rationale: Cost waterfall for spend breakdown, Kraljic for category positioning, Supplier scorecard for vendor concentration, Data quality for confidence scoring

### Technical Details

```text
Scenario Object:
  id: "spend-analysis-categorization"
  icon: PieChart (already imported)
  category: "analysis"
  status: "available"
  strategySelector: none
  fields: industryContext, mainFocus, rawSpendData, timeframe, businessGoal
  outputs: 4 items per spec
  dashboards: cost-waterfall, kraljic-quadrant, supplier-scorecard, data-quality
```

No new components, edge functions, or database changes needed -- the existing `GenericScenarioWizard` handles everything dynamically.

