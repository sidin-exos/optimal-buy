

# Update: EXOS Architecture Diagram Based on PROJECT_CONTEXT.md

## Overview

Refine the `ExosArchitectureDiagram.tsx` to accurately reflect the actual pipeline implementation from the codebase, while preserving the existing Miro-style visual design and color scheme.

---

## Current vs Actual Architecture Comparison

| Current Diagram | Actual Code (graph.ts) | Action |
|----------------|------------------------|--------|
| 4 Cloud AI Agents: Auditor, Optimizer, Strategist, Validator | Single "AI Reasoning" step via `sentinel-analysis` edge function | **Simplify** to single "Cloud AI" node + model selector |
| Grounding as Stage 2 inside EXOS Intelligence | Grounding happens **before** pipeline starts (in GenericScenarioWizard) | **Move** grounding to preparation stage |
| 3 separate Validation checks | Single `validateResponse()` function | **Simplify** validation layer |
| No retry logic shown | Self-correction loop (up to 3 retries) | **Add** retry loop arrow |
| No observability layer | LangSmith tracing via REST API | **Add** LangSmith node |
| No provider selection | Lovable Gateway + Google AI Studio (BYOK) | **Add** provider toggle indicator |

---

## Updated Architecture Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER PREMISES                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ USER INPUT                                                             │  │
│  │  [1] Scenario Wizard  [2] Industry Context  [3] Supplier Data  [4] Business Context │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ CONTEXT PREPARATION (Pre-Pipeline)                                     │  │
│  │  [5] Grounding Engine  [6] Market Intel (Perplexity)                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ EXOS DECISION PIPELINE (graph.ts)                                      │  │
│  │                                                                         │  │
│  │  Stage 1              Stage 2                                          │  │
│  │  [7] Sentinel         [8] AI Reasoning ──────────────┐                 │  │
│  │      Anonymize           (via Edge Fn)              │                 │  │
│  │         │                     ↓                     │ Retry           │  │
│  │         │              [9] Validation ──────────────┘ Loop            │  │
│  │         │                     │      (up to 3x)                       │  │
│  │         │                     ↓                                        │  │
│  │         └───────────→ [10] Deanonymize                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ [INFOSEC GATE] API Audit & Approval                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                      "Masked Request" ↓ ↑ "AI Response"
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUD SERVICES (External)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AI GATEWAY                                                           │   │
│  │  [Lovable Gateway] ←→ Provider Toggle ←→ [Google AI Studio (BYOK)]  │   │
│  │                                                                       │   │
│  │  Models: Gemini 3 Flash · Gemini 2.5 Pro · GPT-5                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ OBSERVABILITY                                                        │   │
│  │  [LangSmith REST Client] ← Fire-and-Forget ← Pipeline Traces         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER PREMISES (Output)                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ OUTPUT                                                                 │  │
│  │  [11] Executive Reports  [12] Dashboards  [13] Roadmaps  [14] Insights│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Changes

### 1. Replace "Cloud AI Agents" Section

**Before:** Grid of 4 agents (Auditor, Optimizer, Strategist, Validator)

**After:** 
- Single "AI Gateway" container with provider toggle
- Two nodes: "Lovable Gateway" and "Google AI Studio (BYOK)"
- Model list badge showing available models
- LangSmith observability node below

### 2. Restructure EXOS Intelligence Section

**Before:** 3 stages in a row (Anonymizer → Grounding → Market Intel)

**After:** 
- **Context Preparation** (new container above pipeline): Grounding Engine + Market Intel
- **Decision Pipeline** (main container): Anonymize → AI Reasoning → Validation (with retry loop arrow) → Deanonymize

### 3. Add Retry Loop Visualization

- Curved arrow from Validation back to AI Reasoning
- Label: "Retry (up to 3x)"
- Color: warning orange

### 4. Simplify Validation Layer

**Before:** 3 separate checks (Hallucination, Calculation, Citation)

**After:** Single "Validation Check" node with sublabel "Anti-Hallucination · Consistency"

### 5. Add Observability Layer

- New small container in Cloud section
- LangSmith node with "REST API Tracing" sublabel
- Connected to pipeline with dashed line

---

## Visual Elements to Add

| Element | Icon | Color | Location |
|---------|------|-------|----------|
| Retry Loop Arrow | RotateCcw | Orange | Validation → AI Reasoning |
| Provider Toggle | ToggleLeft | Purple | Between gateway nodes |
| LangSmith Node | LineChart | Cyan | Observability container |
| Models Badge | Cpu | Purple | Below AI Gateway |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/architecture/ExosArchitectureDiagram.tsx` | Complete restructure of sections |
| `src/components/architecture/ArchitectureArrow.tsx` | Add support for curved/loop arrows (optional) |

---

## Node Numbering Update

| # | Node | Description |
|---|------|-------------|
| 1 | Scenario Wizard | User input form |
| 2 | Industry Context | Industry selector |
| 3 | Supplier Data | Contract/spend data |
| 4 | Business Context | Goals/constraints |
| 5 | Grounding Engine | Private context injection |
| 6 | Market Intel | Perplexity integration |
| 7 | Sentinel Anonymize | Data masking (stepAnonymize) |
| 8 | AI Reasoning | Edge function call (stepReasoning) |
| 9 | Validation Check | Anti-hallucination (stepValidate) |
| 10 | Deanonymize | Entity restoration (stepDeanonymize) |
| 11 | Executive Reports | PDF output |
| 12 | Dashboards | Interactive visualizations |
| 13 | Roadmaps | Action plans |
| 14 | Insights | Opportunities |

---

## Technical Notes

- Preserve existing color palette from `COLORS` object
- Keep `ArchitectureNode` and `ArchitectureContainer` components unchanged
- Add new icons from lucide-react: `RotateCcw`, `ToggleLeft`, `LineChart`, `Cpu`
- Maintain export functionality via html-to-image

