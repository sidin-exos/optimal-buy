

# Architecture Diagram v2.0 — Server-Side Pipeline Rewrite

## Problem

The current `ExosArchitectureDiagram` still reflects the old architecture where Grounding, Market Intel, and Validation lived on the **client side** (Customer Premises). In reality, these stages migrated to the **EXOS Cloud (Edge Functions + DB)**. The diagram has 3 sections but the boundaries are wrong — it shows Grounding and Market Intel in "Pre-Flight" when they now run server-side.

## v2.0 Architecture (3 Layers)

```text
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: CUSTOMER PREMISES — Client Pre-Flight                │
│                                                                 │
│  [User Input]  3-Block Meta-Pattern UI                          │
│       │        (Scenario Wizard, Industry, Supplier, Context)   │
│       ▼                                                         │
│  [Sentinel Anonymizer]  PII → [COMPANY_A] tokens                │
│       │                 Runs IN the browser                     │
│       ▼                                                         │
│  ─ ─ ─ ─ ─  Anonymized Request leaves browser  ─ ─ ─ ─ ─ ─    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Anonymized Payload
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: EXOS CLOUD SERVICES — Edge Functions + Postgres       │
│                                                                 │
│  [Server-Side Grounding]                                        │
│       │  Fetches industry_contexts, procurement_categories,     │
│       │  market_insights from Postgres → injects into prompt    │
│       ▼                                                         │
│  [AI Gateway]                                                   │
│       │  Lovable Gateway ←toggle→ Google AI Studio              │
│       │  Single-Pass  OR  Deep Analytics (3-cycle):             │
│       │    Analyst → Auditor → Synthesizer                      │
│       │  Models: Gemini 3 Flash, 2.5 Pro, GPT-5, GPT-5.2       │
│       ▼                                                         │
│  [Server-Side Validation]                                       │
│       │  Checks against validation_rules table                  │
│       │  Hallucination, unsafe content, required keywords       │
│       │  FAIL → Retry (up to 3x)                                │
│       ▼                                                         │
│  [LangSmith Observability]                                      │
│       │  Fire-and-forget tracing (no raw prompts)               │
│                                                                 │
│  ┌─ DB Layer ─────────────────────────────────────┐             │
│  │ industry_contexts │ procurement_categories      │             │
│  │ market_insights   │ validation_rules            │             │
│  │ saved_intel_configs                             │             │
│  └─────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                     Validated AI Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: CUSTOMER PREMISES — Client Post-Flight                │
│                                                                 │
│  [Entity Deanonymizer]  [COMPANY_A] → real PII (browser-only)   │
│       ▼                                                         │
│  [Local Token Integrity Check]  Verify no tokens lost/created   │
│       ▼                                                         │
│  [Output Engine]                                                │
│     Dashboard Renderer (parses <dashboard-data> JSON)           │
│     PDF Generator · Excel · Jira Exports                        │
│     128-bit Secure Shareable Links (5-day expiry)               │
└─────────────────────────────────────────────────────────────────┘
```

## Key Structural Changes from Current Diagram

| Element | Current Location | Correct Location |
|---|---|---|
| Grounding Engine (#5) | Pre-Flight (client) | **EXOS Cloud** (edge function) |
| Market Intel (#6) | Pre-Flight (client) | **EXOS Cloud** (edge function) |
| Knowledge Base | Pre-Flight (client) | **EXOS Cloud** (Postgres) |
| Validation (#10) | Post-Flight (client) | **EXOS Cloud** (server-side) + lightweight client check |
| InfoSec Gate | Pre-Flight | **Remove** — replaced by Sentinel Anonymizer as the trust boundary |
| LangSmith (#9) | Cloud Services | **EXOS Cloud** (same section as AI Gateway) |

## Implementation Approach

**Keep the custom React/Tailwind component approach** (not Mermaid). Reasons:
- We already have battle-tested primitives (`ArchitectureNode`, `ArchitectureContainer`, `ArchitectureArrow`)
- PNG/SVG export via `html-to-image` works perfectly with React DOM — would break with Mermaid canvas
- Full control over styling, dark theme compatibility, and responsive layout
- No new dependency needed

### File: `src/components/architecture/ExosArchitectureDiagram.tsx` — Full rewrite

**Layer 1 — Customer Premises (Pre-Flight):**
- User Input container: 4 nodes (Scenario Wizard, Industry Context, Supplier Data, Business Context) — keep as-is
- Arrow down
- Sentinel Anonymizer: single node with sublabel "PII masked to [COMPANY_A] tokens — runs in browser"
- Remove: Grounding Engine, Market Intel, Knowledge Base, InfoSec Gate — all moved to Layer 2

**Layer 2 — EXOS Cloud Services (Edge Functions + DB):**
- New container with `Server` icon, title "EXOS Cloud Services (Edge Functions + Postgres)"
- **Server-Side Grounding** sub-container: single node with DB icon, sublabel "Fetches industry_contexts, procurement_categories, market_insights → injects into system prompt"
- Arrow down
- **AI Gateway** sub-container: keep dual provider toggle (Lovable Gateway / Google AI Studio), models badge, Chain-of-Experts badge
- Arrow down
- **Server-Side Validation** sub-container: node with sublabel "validation_rules table", pass/fail indicator with retry loop
- **LangSmith Observability**: small sub-container (fire-and-forget, privacy-safe)
- **DB Layer**: a horizontal strip showing the 5 key tables as small badges (`industry_contexts`, `procurement_categories`, `market_insights`, `validation_rules`, `saved_intel_configs`)

**Layer 3 — Customer Premises (Post-Flight):**
- Entity Deanonymizer: node with sublabel "Tokens → real PII (browser-only)"
- Arrow down
- Local Token Integrity Check: small node — "Verify no tokens lost or hallucinated"
- Arrow down
- Output Engine: 5 nodes (Dashboard Renderer, PDF, Excel/Jira, Shareable Links, Insights)

**Legend update:** 3 layers instead of the current mixed labels.

### File: `src/pages/ArchitectureDiagram.tsx` — Minor updates

- Update subtitle text: "v2.0 — Server-side AI pipeline"
- Update the 4 info cards at bottom to reflect the 3-layer model:
  1. Client Pre-Flight: "User data enters via 3-Block Meta-Pattern. PII anonymized before leaving the browser."
  2. EXOS Cloud: "Server-side grounding, AI inference (single or multi-cycle), validation against DB rules, and LangSmith tracing."
  3. Client Post-Flight: "Tokens restored, integrity verified, results rendered as dashboards, PDF, Excel, Jira, or shareable links."

## Files Changed

| # | File | Action | Summary |
|---|---|---|---|
| 1 | `src/components/architecture/ExosArchitectureDiagram.tsx` | Rewrite | Restructure into 3 correct layers with server-side grounding/validation in Cloud |
| 2 | `src/pages/ArchitectureDiagram.tsx` | Edit | Update subtitle and info cards to match v2.0 |

## What Does NOT Change
- `ArchitectureNode.tsx`, `ArchitectureContainer.tsx`, `ArchitectureArrow.tsx` — primitives untouched
- PNG/SVG export logic — preserved
- No new dependencies
- Route `/architecture` unchanged

