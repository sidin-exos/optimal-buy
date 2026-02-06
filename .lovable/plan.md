

# Fix: EXOS Architecture Diagram - Correct Pipeline Flow

## Overview

Update the `ExosArchitectureDiagram.tsx` to accurately reflect the actual `graph.ts` execution sequence, with proper positioning of Deanonymize and Validation stages.

---

## Issue Analysis

| Issue | Current Diagram | Actual Code (graph.ts) |
|-------|-----------------|------------------------|
| 1. Deanonymize position | Shown in Stage 3 before Cloud boundary | Should be **AFTER** AI response returns (line 271-278) |
| 2. Validation timing | Shown alongside AI Reasoning inside EXOS Pipeline | Validation runs **after** receiving AI response (line 246-256) |
| 3. Flow direction | Appears to be one-way through pipeline | Should show: Anonymize → Cloud → Validate → (Retry?) → Deanonymize |

---

## Corrected Flow Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER PREMISES (Pre-Flight)                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ USER INPUT: [1-4] Scenario · Industry · Supplier · Business Context     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ CONTEXT PREPARATION: [5-6] Grounding Engine · Market Intel              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [7] SENTINEL ANONYMIZE (stepAnonymize) - Mask Sensitive Data            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                         │
│  ┌────────────────────── INFOSEC GATE ─────────────────────────────────────┐│
│  │  API Audit · DLP · Logging                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                     "Anonymized Request" ↓
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLOUD SERVICES (External)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [8] AI GATEWAY (stepReasoning via sentinel-analysis Edge Function)      ││
│  │     Lovable Gateway ←→ Toggle ←→ Google AI Studio (BYOK)                ││
│  │     Models: Gemini 3 Flash · Gemini 2.5 Pro · GPT-5                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [9] LANGSMITH OBSERVABILITY (REST API Tracing)                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                       "AI Response" ↓
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER PREMISES (Post-Flight)                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [10] RESPONSE VALIDATION (stepValidate) - Anti-Hallucination Check      ││
│  │      • Token Integrity     • Golden Case Matching                        ││
│  │      • Hallucination Check • Unsafe Content Detection                    ││
│  │                                                                           ││
│  │            ┌────────── RETRY LOOP (up to 3x) ──────────┐                 ││
│  │            │  If validation fails → back to AI Gateway │                 ││
│  │            └────────────────────────────────────────────┘                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓ (If Validation Passes)                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [11] DEANONYMIZE (stepDeanonymize) - Entity Restoration                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ OUTPUT: [12-15] Executive Reports · Dashboards · Roadmaps · Insights    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Changes

### 1. Split Customer Premises into Pre-Flight and Post-Flight

**Before:** Single "Customer Premises" container with Deanonymize inside
**After:** Two distinct phases:
- **Pre-Flight:** Input → Context Prep → Anonymize → InfoSec Gate
- **Post-Flight:** Validation → Deanonymize → Output

### 2. Move Validation to Post-Flight (After Cloud Response)

**Before:** Validation shown alongside AI Reasoning in "Stage 2" box
**After:** Validation as dedicated container in "Post-Flight" section with explicit connection to:
- Token Integrity Check (checkTokenIntegrity)
- Hallucination Detection (checkForHallucinations)
- Unsafe Content Detection (checkForUnsafeContent)
- Golden Case Matching (matchGoldenCases)

### 3. Correct Deanonymize Position

**Before:** Shown as "Stage 3" before InfoSec Gate
**After:** Positioned after Validation passes, before Output

### 4. Add Retry Loop Arrow from Validation back to Cloud

**Visual:** Curved arrow from Validation container back up to Cloud section
**Label:** "Retry if FAIL (up to 3x)"
**Color:** Warning orange

---

## Updated Node Numbering

| # | Node | Phase | Function Reference |
|---|------|-------|-------------------|
| 1-4 | User Input (Scenario, Industry, Supplier, Business) | Pre-Flight | GenericScenarioWizard |
| 5 | Grounding Engine | Pre-Flight | grounding.ts |
| 6 | Market Intel | Pre-Flight | Perplexity API |
| 7 | Sentinel Anonymize | Pre-Flight | stepAnonymize() |
| 8 | AI Gateway | Cloud | stepReasoning() |
| 9 | LangSmith | Cloud | langsmith-client.ts |
| 10 | Response Validation | Post-Flight | stepValidate() |
| 11 | Deanonymize | Post-Flight | stepDeanonymize() |
| 12-15 | Output (Reports, Dashboards, Roadmaps, Insights) | Post-Flight | PDF components |

---

## Visual Layout Changes

### Section A: Pre-Flight (Green border)
```
┌── User Input ─────────────────────────┐
│ [1] [2] [3] [4]                       │
└───────────────────────────────────────┘
              ↓
┌── Context Preparation ────────────────┐
│ [5] Grounding → [6] Market Intel      │
└───────────────────────────────────────┘
              ↓
┌── Sentinel Anonymize ─────────────────┐
│ [7] Mask PII/Commercial Data          │
└───────────────────────────────────────┘
              ↓
┌── InfoSec Gate (Red) ─────────────────┐
│ API Audit · DLP · Logging             │
└───────────────────────────────────────┘
```

### Section B: Cloud Services (Purple dashed border)
```
┌── AI Gateway ─────────────────────────┐
│ [8] Lovable ↔ Toggle ↔ Google BYOK    │
│     Models: Gemini · GPT-5            │
└───────────────────────────────────────┘
              ↑ (Retry)
┌── Observability ──────────────────────┐
│ [9] LangSmith REST Client             │
└───────────────────────────────────────┘
```

### Section C: Post-Flight (Blue border)
```
          ┌────── RETRY LOOP ──────┐
          │                        │
          ↓                        │
┌── Response Validation ───────────│────┐
│ [10] Anti-Hallucination         ─┘    │
│      Token Integrity · Golden Cases   │
└───────────────────────────────────────┘
              ↓ (If PASS)
┌── Deanonymize ────────────────────────┐
│ [11] Entity Restoration               │
└───────────────────────────────────────┘
              ↓
┌── Output ─────────────────────────────┐
│ [12] [13] [14] [15]                   │
└───────────────────────────────────────┘
```

---

## Technical Implementation

### File to Modify
`src/components/architecture/ExosArchitectureDiagram.tsx`

### Key Changes

1. **Restructure main layout** from 2 sections to 3 sections:
   - Customer Premises (Pre-Flight)
   - Cloud Services (External)
   - Customer Premises (Post-Flight)

2. **Move Validation container** from inside "EXOS Decision Pipeline" to "Post-Flight"

3. **Move Deanonymize** from "Stage 3" to after Validation in "Post-Flight"

4. **Add Retry Loop visualization** with upward arrow from Validation back to Cloud

5. **Update legend** to include "Pre-Flight" and "Post-Flight" phases

---

## Code References Validated

| Step | File | Function | Line |
|------|------|----------|------|
| Anonymize | graph.ts | stepAnonymize | 69-80 |
| AI Call | graph.ts | stepReasoning | 85-124 |
| Validate | graph.ts | stepValidate | 129-161 |
| Retry Loop | graph.ts | while loop | 230-268 |
| Deanonymize | graph.ts | stepDeanonymize | 166-175 |

