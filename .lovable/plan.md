

## Token Usage Tracking for Value QA

### Overview
Add dedicated integer columns for token metrics to `test_reports`, populate them from the edge function, and surface them in the frontend stats and JSON export.

### Changes

**1. Database Migration**
Add three integer columns to `test_reports`:
```text
prompt_tokens   integer DEFAULT 0
completion_tokens integer DEFAULT 0
total_tokens    integer DEFAULT 0
```
These enable simple AVG/SUM aggregations without parsing the existing `token_usage` JSONB column.

**2. Edge Function: `supabase/functions/sentinel-analysis/index.ts`**
Both insert paths (Google AI Studio at ~line 455 and Lovable Gateway at ~line 640) already compute a `usage` object with `{ prompt_tokens, completion_tokens, total_tokens }`. Add these three fields to each `.insert()` call:
- Google path (~line 455): add `prompt_tokens: usage?.prompt_tokens || 0`, etc.
- Gateway path (~line 640): add `prompt_tokens: data.usage?.prompt_tokens || 0`, etc.
- Error paths (429, 402, generic error at lines 577, 592, 608): leave as 0 (default).

**3. Frontend Types: `src/hooks/useTestDatabase.ts`**
Add to the `TestReport` interface:
```text
prompt_tokens: number;
completion_tokens: number;
total_tokens: number;
```

**4. Testing Types: `src/lib/testing/types.ts`**
Add to `ExecutionReport` interface:
```text
prompt_tokens: number;
completion_tokens: number;
total_tokens: number;
```

**5. Stats Hook: `src/hooks/useTestDatabase.ts`**
Update `useTestStats` to also select `prompt_tokens, completion_tokens, total_tokens` from `test_reports` and compute `avgTotalTokens` (average of `total_tokens` across successful reports).

**6. Stats Card: `src/components/testing/TestStatsCards.tsx`**
Add a 5th card: "Avg Tokens" showing `avgTotalTokens` with a `Zap` icon. Grid changes from `lg:grid-cols-4` to `lg:grid-cols-5`.

**7. JSON Export: `src/components/testing/TestSessionLog.tsx`**
Add `prompt_tokens`, `completion_tokens`, `total_tokens` to each report object in the `buildFeedbackJSON` function. These are explicit top-level fields (not buried in the JSONB `token_usage`).

### What Stays the Same
- The existing `token_usage` JSONB column is preserved for backward compatibility and rich metadata
- Error-path inserts default to 0 tokens (column defaults handle this)
- No RLS changes needed -- existing admin-only policies cover the new columns

### Technical Notes
- Both LLM providers already normalize usage to `{ prompt_tokens, completion_tokens, total_tokens }`, so extraction is trivial
- Historical rows will have 0 in the new columns; only new runs will populate them
- The `avgTotalTokens` metric enables tracking whether relaxing fields reduces token consumption over time
