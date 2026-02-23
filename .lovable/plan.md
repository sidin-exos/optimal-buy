

# Update Test Data Generator Schemas

## Summary
Fix the data contract mismatch between frontend scenarios and the `generate-test-data` Edge Function by updating 3 areas: `SCENARIO_SCHEMAS`, `TRICK_LIBRARY` target fields, and removing all `mainFocus` references from prompts.

## Changes (1 file)

### `supabase/functions/generate-test-data/index.ts`

**1. Replace `SCENARIO_SCHEMAS` (lines 155-322)**

Replace the entire constant with the 29-scenario mapping that mirrors `src/lib/scenarios.ts`:

```typescript
const SCENARIO_SCHEMAS: Record<string, ScenarioSchema> = {
  'make-vs-buy': { required: ['industryContext', 'projectBrief'], optional: ['makeCosts', 'buyCosts', 'strategicFactors'] },
  'cost-breakdown': { required: ['industryContext', 'productDescription', 'currentCosts'], optional: ['marketFactors'] },
  // ... all 29 scenarios as specified in the user's request
};
```

**2. Update `TRICK_LIBRARY` target fields (lines 330-636)**

Remap stale field IDs to match the new schema:

| Scenario | Old Field | New Field |
|---|---|---|
| supplier-review | `crisisSupport` | `incidentLog` |
| supplier-review | `financialStability` | `industryContext` (keep) |
| supplier-review | `strategicImportance` | `industryContext` (keep) |
| supplier-review | `socialResponsibility` | `industryContext` (keep) |
| software-licensing | `contractLength` | `commercialTerms` |
| software-licensing | `perUserMonthly` | `commercialTerms` |
| software-licensing | `powerUsers`, `regularUsers`, `occasionalUsers` | `userMetrics` |
| tco-analysis | `purchasePrice` | `capexBreakdown` |
| tco-analysis | `annualMaintenance` | `opexBreakdown` |
| tco-analysis | `vendorLockInRisk` | `riskFactors` |
| tco-analysis | `residualValue` | `riskFactors` |
| negotiation-preparation | `marketAlternatives` | `leverageContext` |
| negotiation-preparation | `switchingCost` | `leverageContext` |
| negotiation-preparation | `knownConstraints` | `timeline` |
| risk-assessment | `geopoliticalRisk` | `currentSituation` |
| risk-assessment | `businessCriticality` | `riskTolerance` |
| risk-assessment | `recoveryTime` | `riskTolerance` |
| risk-assessment | `supplierFinancialHealth` | `currentSituation` |
| make-vs-buy | `knowledgeRetentionRisk` | `strategicFactors` |
| make-vs-buy | `managementTime` | `makeCosts` |
| make-vs-buy | `strategicImportance` | `strategicFactors` |
| make-vs-buy | `peakLoadCapacity` | `projectBrief` |
| disruption-management | `altSuppliers`, `altProducts` | `alternativesContext` |
| disruption-management | `switchingTime`, `stockDays` | `crisisDescription` |
| disruption-management | `lostRevenuePerDay` | `impactAssessment` |

**3. Remove `mainFocus` from prompts**

- **Line 1023** (handleGenerateMode system prompt): Remove rule #3 that says `"mainFocus" field MUST describe the user's primary objective...`
- **Line 1029**: Remove the line `IMPORTANT: "mainFocus" is the user's stated priority. It may be DIFFERENT from the hidden trick.`

These are the only two `mainFocus` references in prompt text (the schema references are already handled by the full replacement in step 1).

## What Does NOT Change
- `src/lib/scenarios.ts` -- source of truth, untouched
- `src/lib/test-data-factory.ts` -- static fallback, already correct
- Draft mode handler -- no `mainFocus` in its prompts
- Messy mode handler -- no `mainFocus` in its prompts
- Full mode handler -- uses schema dynamically, fixed by step 1

