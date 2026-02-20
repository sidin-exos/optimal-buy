

# Refactor `negotiation-preparation` Scenario (AI Audit Results)

## Summary
Apply the AI Auditor's findings to the `negotiation-preparation` scenario: remove 7 academic/theory fields that users struggle to fill and the AI ignores, keep the 10 core fields, and add 2 new contextual textarea fields for spend breakdowns and market leverage.

## Changes

### 1. Update Scenario Schema (`src/lib/scenarios.ts`)

**Remove these 7 fields** from `requiredFields` (lines 675-684):
- `buyingPower` (line 675)
- `marketAlternatives` (line 676)
- `switchingCost` (line 677)
- `supplierDependency` (line 678)
- `supplierBatna` (line 680)
- `niceToHaves` (line 683)
- `knownConstraints` (line 684)

**Keep these 10 fields** (unchanged):
- `industryContext` (required textarea)
- `mainFocus` (MAIN_FOCUS_FIELD constant)
- `negotiationSubject` (required text)
- `currentSpend` (required currency)
- `supplierName` (required text)
- `relationshipHistory` (optional select)
- `batna` (required textarea)
- `negotiationObjectives` (required textarea)
- `mustHaves` (optional textarea)
- `timeline` (optional select)

**Add 2 new fields** after the core fields:

- `spendBreakdown` -- textarea, optional. Label: "Spend Breakdown & Current Pricing Baseline". Placeholder: "E.g., Breakdown by hardware/SaaS, top 5 SKUs, current hourly rates, or existing payment terms..."
- `leverageContext` -- textarea, optional. Label: "Market Alternatives & Leverage Context". Placeholder: "Any known competitors, switching costs, dependencies on this supplier, or internal business constraints..."

### 2. Update Test Data Factory (`src/lib/test-data-factory.ts`)

**Note:** The test data factory uses key `"negotiation-prep"` (not `"negotiation-preparation"`). This is a pre-existing mismatch -- the generator key doesn't match the scenario ID. As part of this refactor:

- Rename the key from `"negotiation-prep"` to `"negotiation-preparation"` to match the scenario ID (fixes test data generation for this scenario).
- Remove old fields: `counterparty`, `negotiationType`, `relationshipYears`, `targetOutcome` (these don't match the scenario schema at all).
- Rebuild generator to match the actual 12-field schema (10 kept + 2 new), using `randomChoice` arrays for all fields.
- Add sample data for `spendBreakdown` (e.g., "$340k hardware, $180k SaaS licenses, $90k professional services") and `leverageContext` (e.g., "Two qualified alternatives shortlisted. Switching cost moderate -- 3 month migration. We represent ~8% of their revenue.").

### Field Diff Summary

```text
BEFORE (17 fields)                  AFTER (12 fields)
---------------------               ---------------------
industryContext    [KEEP]           industryContext
mainFocus          [KEEP]           mainFocus
negotiationSubject [KEEP]           negotiationSubject
currentSpend       [KEEP]           currentSpend
supplierName       [KEEP]           supplierName
relationshipHistory[KEEP]           relationshipHistory
buyingPower        [REMOVE]         batna
marketAlternatives [REMOVE]         negotiationObjectives
switchingCost      [REMOVE]         mustHaves
supplierDependency [REMOVE]         timeline
batna              [KEEP]           spendBreakdown      [NEW]
supplierBatna      [REMOVE]         leverageContext      [NEW]
negotiationObjectives [KEEP]
mustHaves          [KEEP]
niceToHaves        [REMOVE]
knownConstraints   [REMOVE]
timeline           [KEEP]
```

### Bonus Fix: Test Data Factory Key Mismatch
The existing generator used key `"negotiation-prep"` which doesn't match the scenario ID `"negotiation-preparation"`. This will be corrected so that the "Generate Test Case" button in the wizard actually populates data for this scenario.

### Files Modified
- `src/lib/scenarios.ts` -- scenario field definitions
- `src/lib/test-data-factory.ts` -- test data generator (key rename + field rebuild)

### No Database Changes
All changes are frontend-only schema definitions and test data generators. No migration needed.

