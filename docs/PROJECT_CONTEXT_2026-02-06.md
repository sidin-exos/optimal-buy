# Project EXOS: Context Snapshot (2026-02-06)

## 🏁 Milestone: LangSmith Integration & Pipeline Stabilization

**Status:** BETA (Backend + Frontend)

**Current Architecture:** Lovable Managed Supabase + Edge Functions + Client-Side Grounding

---

## 🛡️ Security & Infrastructure

- **Database:** Lovable Managed Supabase (shared infrastructure).
- **RLS Policies:** In Progress (being added incrementally).
  - Policies being defined for `test_prompts`, `test_reports`, `market_insights`.
  - `shared_reports`: Access via Security Definer functions only.
- **Secrets:** API Keys (Perplexity, Google AI Studio key via BYOK) managed in Supabase Edge Secrets.

## ⚡ Performance & Cost

- **Client-Side Context Injection:**
  - Grounding logic runs in browser via `grounding.ts` + `ai-context-templates.ts`.
  - Full XML payload (industry constraints, category KPIs, mock historical cases) assembled client-side and sent to edge function.
  - Includes mock historical cases and benchmarks (~500 extra tokens per request).
- **Eager Loading:**
  - `RecentQueries` component fires API calls and LangSmith traces on page load.
  - Results in unnecessary network traffic and tracing costs on every page reload.

## 👁️ Observability (LangSmith)

- **Status:** Active (Browser-Side + Server-Side).
- **Mode:** "Verbose" (`console.log` for config dumps, routing info, response lengths, success/skip messages).
- **Browser Client:**
  - Exposes `logTracingConfig()` with endpoint URL and API key presence.
  - Fire-and-forget tracing with exponential backoff retry logic.
- **Tracing:**
  - Parent Run: `sentinel-pipeline` (Chain)
  - Child Run: `google-ai-studio` / `ai-gateway` (LLM)
  - Browser-side LangSmith client with `logTracingConfig()` called during pipeline execution.

## 🏗️ Active Components

1. **Sentinel Pipeline:**
   - **Input:** User prompt anonymized client-side, full grounding XML assembled client-side, both sent as payload.
   - **Processing:** Edge function receives pre-built prompts, routes to AI gateway (Lovable or Google AI Studio).
   - **Output:** Raw AI response returned for client-side validation + de-anonymization.
   - **Retry:** 3 attempts with exponential backoff on 503s.

2. **Market Intelligence:**
   - Perplexity Sonar Pro API via edge function.
   - Search filters: recency, domain type.

3. **Shareable Reports:**
   - Security Definer functions for create/get.
   - Time-based expiry with opportunistic cleanup.

4. **graph.ts Pipeline:**
   - Self-contained orchestrator with own `EXOS_SYSTEM_PROMPT` constant.
   - Runs: anonymize → reason → validate → (retry or deanonymize).
   - Browser-side LangSmith tracing with `logTracingConfig()`.

## 📦 Edge Functions Inventory

| Function | Purpose |
|----------|---------|
| `sentinel-analysis` | AI inference (receives pre-built prompts) |
| `market-intelligence` | Perplexity-powered market research |
| `generate-market-insights` | Market insights generation |
| `generate-test-data` | Test data factory |

## 📂 Key Files Reference

- **Pipeline orchestrator:** `src/lib/ai/graph.ts`
- **Sentinel types:** `src/lib/sentinel/types.ts`
- **LangSmith client (browser):** `src/lib/ai/langsmith-client.ts`
- **LangSmith tracer (edge):** `supabase/functions/_shared/langsmith.ts`
- **Anonymizer:** `src/lib/sentinel/anonymizer.ts`
- **Grounding (client, active):** `src/lib/sentinel/grounding.ts`
- **Context templates:** `src/lib/ai-context-templates.ts`
