

# Optimize Sentinel Pipeline: Clean Logs + Surgical Context Injection

## Overview

Three-phase refactor to move from debug-mode to production-quality: strip verbose logs, move context assembly from the client to the edge function, and slim down the client payload.

---

## Phase 1: Log Cleanup

### File: `supabase/functions/_shared/langsmith.ts`

- Update doc comment from "VERBOSE LOGGING" to "Production-ready"
- Remove all 8 `console.log` statements:
  - Constructor config dump (lines 33-40) -- security risk, leaks endpoint/key info
  - `createRun SKIPPED` (line 55)
  - `createRun:` (line 59)
  - `patchRun SKIPPED` (line 86)
  - `patchRun:` (line 90)
  - `POST /runs SUCCESS` (line 114)
  - `PATCH /runs SUCCESS` (line 138)
- Keep all 4 `console.error` lines (117, 120, 141, 144) -- these are critical for debugging failures

### File: `supabase/functions/sentinel-analysis/index.ts`

Remove these verbose `console.log` lines:
- Line 120: `Logged prompt: ${promptId}`
- Line 129: `Routing to local model`
- Line 148: `Routing to Google AI Studio`
- Lines 214-215: Google response length + processing time
- Line 228: `Logged report for prompt`
- Lines 266-268: AI gateway model/prompt lengths
- Lines 410-411: Response length + processing time
- Line 424: `Logged report for prompt`

Keep all `console.error`, `console.warn`, and the retry log (line 284).

---

## Phase 2: Server-Side Context Injection

### File: `supabase/functions/sentinel-analysis/index.ts`

**New behavior**: When `industrySlug` and/or `categorySlug` are provided and no explicit `systemPrompt` is given (or the prompt is the default base prompt), the edge function fetches the context rows from the database and builds the grounding XML server-side.

**Steps:**

1. After initializing the Supabase client, add a surgical DB fetch block:

```text
if (industrySlug) -> fetch from industry_contexts WHERE slug = industrySlug (.single())
if (categorySlug) -> fetch from procurement_categories WHERE slug = categorySlug (.single())
Use Promise.all for parallel execution
```

2. Add a helper function `buildGroundingXML(industry, category, scenarioData, scenarioType, anonymizedInput)` directly in the edge function file. This replicates the essential logic from `src/lib/sentinel/grounding.ts` and `src/lib/ai-context-templates.ts`:
   - Generates `<industry-context>` XML with constraints and KPIs from the fetched row
   - Generates `<category-context>` XML with characteristics and KPIs
   - Wraps with `<analysis-context>`, `<user-input>`, LLM configuration, Chain-of-Experts protocol, and processing instructions
   - Excludes the mock historical cases and benchmarks (these are placeholder data -- removing them saves ~500 tokens per call)

3. Update prompt resolution logic:
   - If `systemPrompt` is explicitly provided (non-empty) and is NOT the default base prompt, use it as-is (backward compat for `useQuickAnalysis` and `ModelConfigPanel` test pings)
   - Otherwise, build a lean system prompt server-side using the fetched context
   - The `userPrompt` becomes just the anonymized user input (no longer the full XML-grounded prompt)

4. The `AnalysisRequest` interface gets a new optional field: `serverSideGrounding?: boolean` -- set to `true` by the refactored client to signal the edge function should handle context injection

---

## Phase 3: Client Optimization

### File: `src/hooks/useSentinel.ts`

**Simplify the payload sent to the edge function:**

Current flow:
```text
Client: fetch industry/category objects
Client: run preparePipelineRequest() which runs anonymization + grounding + XML assembly
Client: send full systemPrompt + full groundedPrompt as userPrompt to edge function
```

New flow:
```text
Client: run anonymization only (still local for PII protection)
Client: send anonymizedInput + industrySlug + categorySlug + scenarioType + scenarioData
Edge:   fetch context from DB, build XML, call AI
```

Specific changes:
- Still call `preparePipelineRequest()` for anonymization (this must stay client-side for privacy)
- After anonymization, instead of sending `inferencePayload.systemPrompt` and `inferencePayload.userPrompt` (which contains the full grounded XML), send:
  - `userPrompt`: just `context.anonymizedInput`
  - `industrySlug`, `categorySlug`, `scenarioType`, `scenarioData` (already sent as metadata -- now promoted to functional inputs)
  - `serverSideGrounding: true` flag
- Remove `groundingContext` and `anonymizationMetadata` from the payload (no longer needed as metadata since the server does its own grounding)
- The `systemPrompt` field is no longer sent for Sentinel pipeline calls (server builds it)

**No changes needed to:**
- `useQuickAnalysis()` -- still sends raw `systemPrompt`/`userPrompt`, no slugs, works as before
- `src/lib/sentinel/orchestrator.ts` -- still used for anonymization and post-inference validation/de-anonymization
- `src/lib/sentinel/grounding.ts` -- still exists for any future client-side use, but no longer called in the main pipeline path

---

## Backward Compatibility

| Caller | Impact |
|--------|--------|
| `useSentinel.analyze()` | Refactored to send lean payload with `serverSideGrounding: true` |
| `useQuickAnalysis()` | No change -- sends explicit `systemPrompt`/`userPrompt`, no slugs |
| `ModelConfigPanel` test ping | No change -- sends raw prompts directly |
| `graph.ts` pipeline | No change for now -- uses its own `EXOS_SYSTEM_PROMPT` constant |

---

## Token/Bandwidth Savings

- **Network payload**: ~3000-4000 fewer chars sent per request (XML context no longer in request body)
- **Token savings**: ~500-800 tokens per call from removing mock historical cases and benchmarks that were padding the prompt
- **Log volume**: ~15 fewer log lines per invocation across both files

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/_shared/langsmith.ts` | Remove 8 `console.log`, update doc comment |
| `supabase/functions/sentinel-analysis/index.ts` | Remove ~10 verbose logs, add DB fetch + `buildGroundingXML` helper, update prompt resolution |
| `src/hooks/useSentinel.ts` | Send lean payload (slugs + anonymized input), add `serverSideGrounding` flag |

