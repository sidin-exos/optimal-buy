

# Refactor Industry Constraints and KPIs

## Summary
Update all 30 industry records in the `industry_contexts` table, replacing the current 10 constraints + 10 KPIs per industry with an optimized 5 + 5 set. This reduces noise in AI grounding prompts and focuses on the most impactful regulatory/operational signals.

## What Changes

- **Before**: Each industry has ~10 constraints and ~10 KPIs (many generic or low-signal)
- **After**: Each industry has exactly 5 constraints and 5 KPIs (curated, high-signal)
- **Scope**: All 30 industries updated via SQL UPDATE statements

## Name Mapping (User JSON to DB Slugs)

Some names in your JSON differ slightly from the database. Here is how they map:

| Your JSON Name | DB Name | Slug |
|---|---|---|
| Media & Ent. | Media & Entertainment | media-entertainment |
| Prof. Services | Professional Services | professional-services |
| Industrial Mfg. | Industrial Manufacturing | industrial-manufacturing |
| Food & Bev. | Food & Beverage | food-beverage |
| (all others) | (exact match) | (exact match) |

**Decision**: I will keep the existing DB names (e.g., "Media & Entertainment") unchanged. Only `constraints` and `kpis` arrays will be updated.

## Technical Details

- **Method**: 30 individual UPDATE statements executed via the data insert tool (not migrations, since this is data not schema)
- **Target table**: `industry_contexts`
- **Columns updated**: `constraints` (text[]), `kpis` (text[]), `updated_at` (auto via now())
- **No schema changes** -- table structure stays identical
- **No code changes** -- frontend components (`IndustryContextEditor`, `ContextPreview`, `useContextData`) and the edge function (`sentinel-analysis`) all read constraints/kpis dynamically from DB, so they adapt automatically

## Impact Analysis

- **AI Grounding Prompts**: Will be shorter and more focused (50% fewer constraint/KPI tokens per prompt)
- **IndustryContextEditor UI**: Users will see 5 toggleable constraints + 5 toggleable KPIs instead of 10 each
- **ContextPreview**: Will show up to 5 constraints/KPIs (currently capped at 5 in preview anyway)
- **Sentinel Analysis**: Server-side grounding XML will be leaner

## Execution Order

1. Execute 30 UPDATE statements against `industry_contexts` table (batched for efficiency)
2. Verify with a SELECT query that all rows updated correctly

## No Files Modified
This is a data-only change. No code files need updating.
