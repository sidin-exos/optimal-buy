
# Refactor `tail-spend-sourcing` Scenario (AI Audit Results)

## Summary
Apply the AI Auditor's findings to the `tail-spend-sourcing` scenario: remove 7 redundant fields that add friction, keep the 4 core fields, and add 2 new contextual textarea fields for unstructured vendor/technical data.

## Changes

### 1. Update Scenario Schema (`src/lib/scenarios.ts`)

**Remove these 7 fields** from the `requiredFields` array (lines 156-163):
- `warranty`
- `deliveryCost`
- `paymentTerms`
- `returnRisk`
- `catalogAvailable`
- `quotesCount`
- `approvalRequired`

**Keep these existing fields** (unchanged):
- `industryContext` (required textarea)
- `mainFocus` (MAIN_FOCUS_FIELD constant)
- `purchaseAmount` (required currency)
- `urgency` (required number)
- `alternativesExist` (optional select -- retained as it has analytical value)

**Add 2 new textarea fields** after the core fields:

```
vendorHistory:
  label: "Current Vendor Landscape & Historical Spend"
  type: textarea
  required: false
  placeholder: "E.g., We usually buy this from Vendor X for $Y, but they are out of stock. Last year we spent $10k on this category..."
  description: "Context about who you buy this from today and historical pricing."

technicalSpecs:
  label: "Technical Specifications / Requirements"
  type: textarea
  required: false
  placeholder: "Any specific technical details, specs, or compatibility requirements for the items you are sourcing..."
  description: "Paste any technical requirements, SKUs, or performance criteria."
```

### 2. Update Test Data Factory (`src/lib/test-data-factory.ts`)

Update the `tail-spend-sourcing` generator to match the new schema:
- Remove references to deleted fields (`warranty`, `deliveryCost`, `paymentTerms`, `returnRisk`, `catalogAvailable`, `quotesCount`, `approvalRequired`).
- Add sample data generators for the two new fields using randomized realistic text snippets.

### Field Diff Summary

```text
BEFORE (11 fields)                 AFTER (8 fields)
---------------------              ---------------------
industryContext  [KEEP]            industryContext
mainFocus        [KEEP]            mainFocus
purchaseAmount   [KEEP]            purchaseAmount
urgency          [KEEP]            urgency
catalogAvailable [REMOVE]          alternativesExist
quotesCount      [REMOVE]          vendorHistory      [NEW]
paymentTerms     [REMOVE]          technicalSpecs     [NEW]
warranty         [REMOVE]
deliveryCost     [REMOVE]
returnRisk       [REMOVE]
alternativesExist[KEEP]
approvalRequired [REMOVE]
```

### Files Modified
- `src/lib/scenarios.ts` -- scenario field definitions
- `src/lib/test-data-factory.ts` -- test data generator

### No Database Changes
All changes are frontend-only schema definitions and test data generators. No migration needed.
