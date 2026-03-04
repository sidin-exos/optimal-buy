# Claude Instructions — EXOS Project (2026-03-04)

## Project Overview

**EXOS** is a procurement intelligence SaaS platform built on:
- **Frontend:** React + TypeScript (Vite), hosted via Lovable
- **Backend:** Supabase (Private project: `EXOS-Production`) — PostgreSQL + Edge Functions (Deno/TypeScript)
- **AI Gateway:** Lovable Cloud / Google AI Studio (provider fallback)
- **Observability:** LangSmith (server-side only, production-quiet mode)
- **Auth:** Google OAuth via Supabase Auth

**Published URL:** `https://optimal-buy.lovable.app`

---

## Architecture Principles

1. **Server-side grounding only.** All AI context injection happens inside `sentinel-analysis` edge function — never on the client. The legacy `src/lib/sentinel/grounding.ts` is kept for reference but is not active.
2. **Surgical context injection.** Only the specific `industry_contexts` and `procurement_categories` rows matching the request slugs are fetched, keeping input tokens low (~60% reduction vs full-table fetch).
3. **Centralized chatbot intelligence.** All chatbot system prompt constants live in `supabase/functions/_shared/chatbot-instructions.ts`. Never duplicate prompt text across edge functions.
4. **Security Definer RPCs for cross-role writes.** When a lower-privilege role needs to write to an admin-protected table, use a `SECURITY DEFINER` RPC (e.g., `save_intel_to_knowledge_base`, `create_shared_report`).
5. **Anon-friendly public features, auth-gated analysis.** Public chatbots and scenario tutorials require no auth. Sentinel analysis and market intelligence require authenticated users.

---

## Key File Locations

| Purpose | Path |
|---------|------|
| Scenario definitions (29 scenarios) | `src/lib/scenarios.ts` |
| AI context templates | `src/lib/ai-context-templates.ts` |
| Pipeline orchestrator | `src/lib/ai/graph.ts` |
| Sentinel types | `src/lib/sentinel/types.ts` |
| PII anonymizer (client) | `src/lib/sentinel/anonymizer.ts` |
| Dashboard mappings | `src/lib/dashboard-mappings.ts` |
| Chat service | `src/lib/chat-service.ts` |
| Scenario chat service | `src/lib/scenario-chat-service.ts` |
| Excel report export | `src/lib/report-export-excel.ts` |
| Jira report export | `src/lib/report-export-jira.ts` |
| Saved intel configs hook | `src/hooks/useSavedIntelConfigs.ts` |
| Context data hook | `src/hooks/useContextData.ts` |
| Test data factory | `src/lib/test-data-factory.ts` |
| **Edge: auth helper** | `supabase/functions/_shared/auth.ts` |
| **Edge: validation helper** | `supabase/functions/_shared/validate.ts` |
| **Edge: LangSmith tracer** | `supabase/functions/_shared/langsmith.ts` |
| **Edge: chatbot intelligence** | `supabase/functions/_shared/chatbot-instructions.ts` |
| **Edge: anonymizer** | `supabase/functions/_shared/anonymizer.ts` |
| **Edge: sentinel analysis** | `supabase/functions/sentinel-analysis/index.ts` |
| **Edge: chat copilot** | `supabase/functions/chat-copilot/index.ts` |
| **Edge: scenario chat** | `supabase/functions/scenario-chat-assistant/index.ts` |

---

## Edge Functions (8 + shared)

| Function | Auth | Purpose |
|----------|------|---------|
| `chat-copilot` | Public | Onboarding chatbot — full coaching intelligence |
| `scenario-chat-assistant` | Public | Per-scenario coaching — 4-phase protocol |
| `scenario-tutorial` | Public | Contextual tips per scenario + industry/category |
| `sentinel-analysis` | Authenticated | AI inference, server-side grounding, LangSmith tracing |
| `market-intelligence` | Authenticated | Perplexity Sonar Pro market research |
| `market-snapshot` | Authenticated | Perplexity + quality gate |
| `generate-market-insights` | Admin only | Market insights generation |
| `generate-test-data` | Admin only | Test data factory |

### Sentinel Analysis — Retry & Fallback
- 3 attempts with exponential backoff on 503s.
- Provider fallback: Google AI Studio → Lovable Gateway on 429/5xx.

---

## Database (14 Tables, RLS on all)

| Table | Access Pattern |
|-------|---------------|
| `chat_feedback` | Anon insert (ratings), admin read |
| `contact_submissions` | Public insert |
| `founder_metrics` | Admin only |
| `industry_contexts` | Public read |
| `intel_queries` | Public read (transparency) |
| `market_insights` | Service Role write, client read — via `save_intel_to_knowledge_base` RPC |
| `procurement_categories` | Public read |
| `saved_intel_configs` | User-scoped CRUD (`auth.uid() = user_id`) |
| `scenario_feedback` | Anon insert |
| `shared_reports` | Via Security Definer functions only |
| `test_prompts` | Admin only |
| `test_reports` | Admin only |
| `user_roles` | Via `has_role` Security Definer RPC |
| `validation_rules` | Admin write, public read |

### Security-Critical RPCs
- `save_intel_to_knowledge_base` — SECURITY DEFINER, authenticated users → `market_insights`
- `create_shared_report` / `get_shared_report` — SECURITY DEFINER, 128-bit server-side ID, 1MB limit, 5-day expiry
- `get_evolutionary_directives` — Aggregates validation signals
- `has_role` — SECURITY DEFINER role check (avoids RLS recursion)

---

## Chatbot Intelligence Layer

All intelligence is centralized in `_shared/chatbot-instructions.ts`:

```typescript
export const BOT_IDENTITY: string;           // Section 1: persona + hard boundaries
export const CONVERSATION_ARCHITECTURE: string; // Section 2: opening, 4-phase coaching
export const SCENARIO_NAV_GUIDANCE: Record<string, { triggerPhrases: string; navigationGuidance: string }>;
export const SCENARIO_COACHING_CARDS: Record<string, {
  purpose: string; minRequired: string; enhanced: string;
  commonFailure: string; financialImpact: string;
  gdprGuardrail: string; coachingTips: string;
}>;
export const GDPR_PROTOCOL: string;          // Section 5: PII interception
export const ESCALATION_PROTOCOL: string;    // Section 6: confused users, out-of-scope
export const QUICK_REFERENCES: string;       // Section 7: glossary, confidence tiers
```

### Token Budgets
- `chat-copilot`: ~3,000 tokens (identity + architecture + GDPR + escalation + scenario nav)
- `scenario-chat-assistant`: ~1,500 tokens (abbreviated identity + coaching protocol + ONE scenario card + GDPR)

### Hard Boundaries (never violate)
- Never ask for raw PII
- Never give legal, tax, or financial advice
- Never fabricate data or cite sources not in grounding context
- Never replicate the Sentinel analysis engine in chat

---

## Frontend Conventions

### Scenario UX — 3-Block Meta-Pattern
Every scenario form follows this structure (22 of 29 refactored):
1. `industryContext` (textarea, required) — Industry & business context
2. 2–3 scenario-specific textareas (required) — Core data blocks
3. 1–2 optional textareas — Additional context, benchmarks, constraints

### Routes (16 in `App.tsx`)
`/`, `/features`, `/reports`, `/pricing`, `/faq`, `/report`, `/dashboards`, `/market-intelligence`, `/architecture`, `/dev-workflow`, `/testing-pipeline`, `/org-chart`, `/auth`, `/account`, `/admin/dashboard`, `*` (404)

### Authentication
- Google OAuth via Supabase Auth
- Client-side tracing disabled (LangSmith key must not be exposed)

---

## Known Mocks / Outstanding Work

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Stripe Integration | Pricing page has no real payment flow |
| P0 | Consolidation Wizard AI | `mockResults` hardcoded in `ConsolidationWizard.tsx` |
| P1 | Chat Persistence | History lost on reload — store in `chat_messages` table |
| P2 | PDF Export Stubs | Some dashboard visuals use placeholder data |
| P2 | pgvector Search | Knowledge base search is basic text match |
| P2 | Scheduled Reports Cron | Configs saved, not auto-executed |
| P3 | Demo Mode Labels | Only Dashboard Showcase has demo banner |
| P3 | Enterprise Trigger Gate | UI-only gate, no tier check |
| P3 | Founder Dashboard Metrics | Manual entry only |
| P3 | Deep Analysis Pipeline | UI animation only — no real multi-stage pipeline |

---

## Coding Guidelines

- **No client-side secrets.** API keys (Perplexity, Google, LangSmith, Lovable) live in Supabase Edge Secrets only.
- **Validate at edge function boundary.** Use `_shared/validate.ts` for input validation, size limits, and type coercion. Do not trust client payloads.
- **Anonymize before AI calls.** Use `_shared/anonymizer.ts` (edge) or `src/lib/sentinel/anonymizer.ts` (client) before sending user content to any LLM.
- **LangSmith tracing is fire-and-forget.** Never `await` LangSmith calls in the critical path. Use `_shared/langsmith.ts` helpers.
- **Keep grounding server-side.** Do not fetch `industry_contexts` or `procurement_categories` from the client for AI use.
- **Shared reports have a 1MB payload limit** enforced at DB level — respect this when serializing report data.
- **Lazy load non-critical UI.** Follow the `RecentQueries` "pull" model pattern — load on user interaction, not on page mount.

---

## Documentation Snapshots

| File | Milestone |
|------|-----------|
| `docs/PROJECT_CONTEXT_2026-02-06.md` | LangSmith Integration |
| `docs/PROJECT_CONTEXT_2026-02-09.md` | Infrastructure Independence |
| `docs/PROJECT_CONTEXT_2026-02-17.md` | Security Hardening |
| `docs/PROJECT_CONTEXT_2026-02-20.md` | UX Meta-Pattern Refactoring |
| `docs/PROJECT_CONTEXT_2026-02-24.md` | Market Intelligence Expansion & Mocks Audit |
| `docs/PROJECT_CONTEXT_2026-03-04.md` | Chatbot Intelligence Layer & UX Polish |
