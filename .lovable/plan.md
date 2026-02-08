

# Server-Side LangSmith Tracing Implementation

## Summary

Create a shared `LangSmithTracer` class for Deno Edge Functions and instrument `sentinel-analysis` and `market-intelligence` with hierarchical parent/child trace spans. All tracing is fire-and-forget -- zero impact on response latency.

---

## File 1: Create `supabase/functions/_shared/langsmith.ts`

A lightweight, Deno-compatible tracing utility (~90 lines):

- **`LangSmithTracer` class**
  - Constructor reads `VITE_LANGCHAIN_API_KEY`, `VITE_LANGCHAIN_PROJECT`, `VITE_LANGCHAIN_ENDPOINT` from `Deno.env`
  - Accepts `env` and `feature` constructor params for automatic tag injection
  - `isEnabled()` -- returns false if API key missing or tracing not `"true"`
  - `createRun(name, runType, inputs, opts?)` -- POST to `/runs`, returns UUID immediately, fetch is fire-and-forget
  - `patchRun(runId, outputs?, error?)` -- PATCH to `/runs/{id}`, fire-and-forget
- **No retries** (unlike browser client) -- edge function lifetime is limited, fire-and-forget is sufficient
- **No external deps** -- pure `fetch` + `crypto.randomUUID()`
- All calls wrapped in try/catch with `console.error` on failure

---

## File 2: Modify `supabase/functions/sentinel-analysis/index.ts`

### Changes:
1. Add `import { LangSmithTracer } from "../_shared/langsmith.ts"` at top
2. Add `env?: string` to `AnalysisRequest` interface
3. After parsing request body, instantiate tracer and create parent run:

```text
const tracer = new LangSmithTracer({ env: body.env, feature: "sentinel_analysis" });
const parentRunId = tracer.createRun("sentinel-analysis", "chain", {
  model, scenarioType, industrySlug, categorySlug,
  systemPromptLength: systemPrompt.length,
  userPromptLength: userPrompt.length,
});
```

4. Before each AI call (Google AI Studio path + Lovable Gateway path), create child LLM run:

```text
const llmRunId = tracer.createRun("ai-gateway-call", "llm",
  { model, promptLengths: { system: systemPrompt.length, user: userPrompt.length } },
  { parentRunId }
);
```

5. After AI response, patch child run with outputs (content length, token usage, latency)
6. Before returning final response, patch parent run with success/error status
7. On error paths, patch parent run with error string

**No prompt content is sent to LangSmith** -- only metadata (lengths, model, scenario type, slugs).

---

## File 3: Modify `supabase/functions/market-intelligence/index.ts`

### Changes:
1. Add `import { LangSmithTracer } from "../_shared/langsmith.ts"`
2. Add `env?: string` to `IntelRequest` interface
3. After parsing body, create parent run:

```text
const tracer = new LangSmithTracer({ env: body.env, feature: "market_intelligence" });
const parentRunId = tracer.createRun("market-intelligence", "chain", {
  queryType, queryLength: query.length, recencyFilter, domainFilter,
});
```

4. After Perplexity response, create + patch child LLM run:

```text
const llmRunId = tracer.createRun("perplexity-sonar-pro", "llm",
  { model: "sonar-pro", queryType },
  { parentRunId }
);
tracer.patchRun(llmRunId, {
  summaryLength: summary.length, citationCount: citations.length, tokenUsage, processingTimeMs,
});
```

5. Patch parent run before returning response
6. On error catch block, patch parent with error

---

## What This Does NOT Touch

- Client-side `src/lib/ai/langsmith-client.ts` -- unchanged
- `generate-market-insights` and `generate-test-data` -- deferred to a follow-up
- Database schema -- no changes
- UI -- no changes
- Existing request/response contracts -- unchanged (the `env` field is optional, defaults to `"production"`)

---

## Expected Result in LangSmith

The "EXOS" project will show:
- **Hierarchical traces**: parent "chain" runs with child "llm" runs
- **Tags**: `env:production` / `env:dev`, `feature:sentinel_analysis` / `feature:market_intelligence`, model name
- **Metadata**: scenario type, industry/category slugs, query type, processing time
- **No PII**: only lengths, model names, and slugs

