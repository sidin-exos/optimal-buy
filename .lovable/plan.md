

## PROJECT_CONTEXT_FEB17 — Architecture Snapshot

Create a new file `docs/PROJECT_CONTEXT_2026-02-17.md` containing the current project state. It will be downloadable via the published site by also placing a copy at `public/PROJECT_CONTEXT_2026-02-17.md`.

---

### Content Structure

The document will follow the established format from previous snapshots, updated to reflect all changes since Feb 9:

**Milestone:** Security Hardening & Public Access Optimization

**Key Updates Since Feb 9:**

1. **Security Hardening**
   - `create_shared_report` RPC hardened: server-side ID generation via `gen_random_bytes(16)`, 1MB payload limit, `anon` access revoked (authenticated only)
   - All 10 public tables have RLS enabled

2. **Edge Functions (8 total)**
   - `chat-copilot` — auth gate removed for public onboarding access
   - `scenario-tutorial` — public, no auth
   - `sentinel-analysis` — authenticated, server-side grounding + LangSmith tracing
   - `market-intelligence` — Perplexity Sonar Pro
   - `market-snapshot` — authenticated, Perplexity + quality gate
   - `generate-market-insights` — admin only
   - `generate-test-data` — admin only
   - Shared utilities: `_shared/auth.ts`, `_shared/validate.ts`, `_shared/langsmith.ts`

3. **Frontend**
   - 29 procurement scenarios (updated count, reordered: Cost Breakdown and Spend Analysis moved to top)
   - Chat widget: typewriter auto-scroll bug fixed (removed per-character `onTextReveal`)
   - Technology page: "Commercial Data Safety" card with link to `/architecture`
   - 13 routes in App.tsx

4. **Database Tables (10)**
   - `chat_feedback`, `founder_metrics`, `industry_contexts`, `intel_queries`, `market_insights`, `procurement_categories`, `shared_reports`, `test_prompts`, `test_reports`, `user_roles`

5. **Key Files Reference** — updated inventory

6. **Observability** — LangSmith server-side only, "Production Quiet" mode

The file will also be placed in `/public` so users can download it directly via `https://optimal-buy.lovable.app/PROJECT_CONTEXT_2026-02-17.md`.

### Technical Details

```text
Files Created: 2

1. docs/PROJECT_CONTEXT_2026-02-17.md
   - Full context snapshot markdown

2. public/PROJECT_CONTEXT_2026-02-17.md
   - Same content, publicly accessible for download
```

