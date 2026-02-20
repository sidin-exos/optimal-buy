

# Fix Shadow Log Schema Mismatch + Orchestrator Resilience

## Problem Analysis

Two root causes identified:

### Problem 1: Results Not Visible (Critical)
The `RefactoringBacklog` component expects `shadow_log` to have this shape:
```text
{ field_evaluations: [{ field_name, action }], schema_gaps: [...] }
```

But the actual `shadow_log` written by `sentinel-analysis` has this shape:
```text
{ redundant_fields: ["mainFocus", ...], missing_context: [...], friction_score: 4, input_recommendation: "...", detected_input_format: "structured" }
```

The `extractEvaluations()` function finds no `field_evaluations` array, returns empty data, and the UI shows "No field evaluations found yet" despite 10 reports existing.

### Problem 2: Page Reboot During Long Batch (Minor)
A code deployment (hot reload) triggered mid-batch causes the page to refresh to `/`, losing orchestrator state. This is inherent to the dev environment but can be mitigated.

## Proposed Changes

### 1. Fix `RefactoringBacklog.tsx` -- Adapt `extractEvaluations()` to Real Schema

Update the parser to handle the actual shadow_log format:

- Map `redundant_fields` array entries to `{ field_name, action: "REDUNDANT_HIDE" }`
- Map `missing_context` entries to schema gaps with `action: "SCHEMA_GAP_DETECTED"`
- Preserve backward compatibility: if `field_evaluations` exists (future format), use it; otherwise fall back to the flat format
- Extract `friction_score` and `input_recommendation` for display in a new summary row

### 2. Fix `TestStatsCards.tsx` -- Verify Stats Display

Confirm the stats cards correctly aggregate data for the `rfp-generator` scenario (database shows 10 prompts / 10 reports, so this should already work once the page is loaded correctly).

### 3. Improve `TestPlanOrchestrator.tsx` -- Save Progress to localStorage

- After each completed item, persist `{ results, currentIndex, scenarioId }` to `localStorage`
- On mount, check for interrupted runs and offer to display the last results
- This way, if a hot reload occurs, the user doesn't lose visibility into what completed

## Technical Details

### `extractEvaluations()` Rewrite (RefactoringBacklog.tsx)

```text
INPUT (actual shadow_log):
{
  redundant_fields: ["mainFocus", "documentTypes"],
  missing_context: ["Specific software stack", "Current bandwidth specs"],
  friction_score: 4,
  input_recommendation: "Provide historical usage data...",
  detected_input_format: "structured"
}

OUTPUT (mapped to existing FieldAggregation types):
fields: [
  { field_name: "mainFocus", action: "REDUNDANT_HIDE" },
  { field_name: "documentTypes", action: "REDUNDANT_HIDE" }
]
gaps: [
  { suggested_field: "specific_software_stack", reason: "Specific software stack", frequency: 1, persona_source: "" }
]
```

All non-redundant fields from the scenario schema that are NOT in `redundant_fields` will be inferred as `CRITICAL_REQUIRE` (the AI kept them, meaning they were useful).

### localStorage Recovery (TestPlanOrchestrator.tsx)

- Key: `exos-orchestrator-results-{scenarioId}`
- Saved after each iteration and on completion
- On mount: if results exist, show them in the Results Summary section
- Clear on new run start

## Files Modified
- `src/components/testing/RefactoringBacklog.tsx` -- fix shadow_log parser to match real data format
- `src/components/testing/TestPlanOrchestrator.tsx` -- add localStorage persistence for batch results

## No Database or Edge Function Changes
The shadow_log format from sentinel-analysis is correct. Only the frontend parser needs to adapt to the actual schema.

