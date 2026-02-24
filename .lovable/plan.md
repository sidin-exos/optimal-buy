

# Fix #10: Replace Pipeline IQ Mock Data with Real Aggregation (Views + RPC)

## Architecture

```text
BEFORE:
  TestingPipeline.tsx → MOCK_ACCURACY_TREND (hardcoded array) → LineChart
                      → MOCK_DIRECTIVES (hardcoded array)     → Evolution Log

AFTER:
  SQL View: pipeline_iq_stats → aggregates test_reports by date → accuracy trend
  SQL RPC: get_evolutionary_directives() → extracts redundant fields from shadow_log JSONB
  usePipelineIQ.ts hooks → React Query wrappers
  TestingPipeline.tsx → real data + loading skeletons + dynamic labels
```

No new tables. Single Source of Truth from `test_reports`.

---

## Step 1: Database Migration — View + RPC

One migration with two objects:

**A. View `pipeline_iq_stats`**: Groups `test_reports` by `DATE(created_at)`, computes `accuracy` (success rate as percentage), `total_runs`, `avg_processing_time_ms`. Ordered by `batch_date ASC`. Granted to `authenticated` role.

**B. RPC `get_evolutionary_directives(limit_num)`**: Extracts `redundant_fields` from `shadow_log` JSONB across all test_reports, counts occurrences per field, returns top N as directives with `target_scenario = 'Global'`, `source_field_action = 'REDUNDANT_HIDE'`, and a generated `directive_text`. Uses `SECURITY DEFINER` (inherits service-role access to admin-only `test_reports`).

Both are read-only aggregations over existing data.

---

## Step 2: New Hook — `src/hooks/usePipelineIQ.ts`

Two React Query hooks:

- **`useAccuracyTrend()`**: Queries `pipeline_iq_stats` view via `supabase.from('pipeline_iq_stats').select('*')`. Returns `{ batch_date, total_runs, accuracy, avg_processing_time_ms }[]`. Transforms `accuracy` from percentage (0-100) to decimal (0-1) for the chart.

- **`useEvolutionaryDirectives()`**: Calls `supabase.rpc('get_evolutionary_directives', { limit_num: 5 })`. Returns `{ target_scenario, directive_text, source_field_action, occurrence_count }[]`.

Both use `staleTime: 60_000` (1 min cache — this is admin dashboard data, not real-time).

---

## Step 3: Update UI — `src/pages/TestingPipeline.tsx`

**Delete**:
- `MOCK_ACCURACY_TREND` constant (lines 30-38)
- `MOCK_DIRECTIVES` constant (lines 40-65)
- `import type { EvolutionaryDirective }` (no longer needed)

**Add**:
- Import `useAccuracyTrend`, `useEvolutionaryDirectives` from new hook
- Import `Skeleton` for loading states

**Chart changes**:
- Feed `accuracyData` (mapped to `{ batch: index+1, accuracy: row.accuracy }`) into `LineChart`
- `YAxis` domain stays `[0, 1]` (we convert percentage to decimal in the hook)
- Dynamic labels: compute `currentAccuracy` from last item, `delta` from `last - first`

**Evolution Log changes**:
- Map RPC results to cards. Use `occurrence_count` instead of `confidence_gain_projected`
- Adapt card layout: show occurrence count instead of projected gain, remove `generated_at` (not in RPC output)

**Loading states**:
- Show `Skeleton` components while either query is loading
- Show "No data yet" empty state when arrays are empty

---

## Files Changed

| # | File | Action | Summary |
|---|---|---|---|
| 1 | New migration SQL | Create | `pipeline_iq_stats` view + `get_evolutionary_directives` RPC |
| 2 | `src/hooks/usePipelineIQ.ts` | Create | Two React Query hooks querying the view and RPC |
| 3 | `src/pages/TestingPipeline.tsx` | Edit | Remove mocks, wire hooks, add loading/empty states, dynamic labels |

## What Does NOT Change
- `test_reports` table — no schema changes
- Refactoring Backlog — already reads shadow_log independently
- Edge functions — no changes needed
- `src/lib/testing/types.ts` — `EvolutionaryDirective` type stays (used elsewhere potentially), just unused in this page now

