

## Test Data Generator — Full Field Coverage + Buyer Personas

### Scope
Single file update: `supabase/functions/generate-test-data/index.ts`

### Execution Order

1. Replace `SCENARIO_SCHEMAS` type from `Record<string, string[]>` to `Record<string, { required: string[]; optional: string[] }>`
2. Fix ID mismatch: remove `negotiation-prep`, ensure `negotiation-preparation` has correct fields
3. Add 5 missing scenarios with full field coverage
4. Update all 18 existing scenarios with missing fields
5. Add Buyer Personas system with random selection
6. Update `handleGenerateMode`, `handleMessyMode`, full mode, and `buildGenerationPrompt` to use new schema structure and inject personas
7. Deploy edge function

---

### Change 1: SCENARIO_SCHEMAS Type Migration

Replace the flat `string[]` structure with `{ required: string[]; optional: string[] }`:

```typescript
const SCENARIO_SCHEMAS: Record<string, { required: string[]; optional: string[] }> = {
  "make-vs-buy": {
    required: ["industryContext", "mainFocus", "internalSalary", "agencyFee"],
    optional: ["recruitingCost", "managementTime", "officeItPerHead", "agencyOnboardingSpeed", 
               "knowledgeRetentionRisk", "qualityBenchmark", "peakLoadCapacity", "strategicImportance"]
  },
  // ... all 29 scenarios
};
```

Required/optional split mirrors `src/lib/scenarios.ts` exactly (including 3 CEO overrides).

---

### Change 2: Fix ID Mismatch

- **Remove** the `negotiation-prep` entry (line 133-136) with wrong fields (`annualSpend`, `contractEndDate`, `relationshipYears`, `alternativeCount`, `spendTrend`, `leverage`)
- **Keep** `negotiation-preparation` entry (line 188-191) and expand it with all 17 fields from scenarios.ts

Also update `HIGH_FRICTION_SCENARIOS` (line 973-976) to use `negotiation-preparation` instead of `negotiation-prep`.

Also update `TRICK_LIBRARY` key `negotiation-prep` (line 323) to `negotiation-preparation` and update its `targetFields` references.

---

### Change 3: Add 5 Missing Scenarios

| Scenario | Required Fields | Optional Fields |
|----------|----------------|-----------------|
| `pre-flight-audit` | `industryContext`, `mainFocus`, `supplierWebsite`, `supplierName` | `plannedPurchase`, `estimatedValue`, `existingRelationship`, `researchFocus`, `urgency`, `redFlags` |
| `category-risk-evaluator` | `industryContext`, `mainFocus`, `categoryName`, `tenderStage`, `contractValue` | `sowText`, `contractType`, `marketConcentration`, `marketTrends`, `priceVolatility`, `supplyRisk`, `regulatoryExposure`, `technologyChange`, `substitutability`, `pastIssues` |
| `supplier-dependency-planner` | `industryContext`, `mainFocus`, `supplierName`, `serviceCategory`, `annualSpend`, `strategicImportance`, `diversificationGoal` | `categoryTotalSpend`, `spendConcentration`, `revenueShare`, `uniqueCapabilities`, `contractTerms`, `terminationPenalty`, `dataPortability`, `integrationDepth`, `knowledgeDependency`, `alternativeSuppliers`, `switchingTimeEstimate`, `switchingCostEstimate`, `timeHorizon` |
| `specification-optimizer` | `industryContext`, `mainFocus`, `specificationText`, `specificationCategory`, `safetyRequirements` | `estimatedValue`, `specSource`, `lastReviewed`, `competitiveMarket`, `performanceMargins`, `certificationRequirements`, `tolerances` |
| `black-swan-scenario` | `industryContext`, `mainFocus`, `assessmentScope`, `scopeDetails`, `annualExposure`, `scenarioTypes` | `businessImpact`, `singleSourceItems`, `geographicConcentration`, `tierVisibility`, `inventoryBuffer`, `recentNearMisses`, `alternativesReady`, `responsePlaybook`, `financialReserve`, `insuranceCoverage`, `acceptableDowntime`, `investmentWillingness` |

---

### Change 4: Update Existing Scenarios with Missing Fields

Complete field list for all 18 scenarios that had gaps (showing what gets added):

| Scenario | Fields Added |
|----------|-------------|
| `cost-breakdown` | `logisticsCost`, `toolingCost`, `profitMargin`, `commodityIndex`, `laborRateReference`, `currencyExposure` (all optional) |
| `tail-spend-sourcing` | `quotesCount`, `warranty`, `deliveryCost`, `returnRisk`, `alternativesExist` (all optional) |
| `disruption-management` | `inTransitStatus`, `competitorResponse` (optional) |
| `risk-assessment` | `commodityDependency`, `contractType`, `liabilityProtection`, `terminationRights`, `priceAdjustmentMechanism`, `currentChallenges`, `supplyChainVisibility`, `recentIncidents` (all optional) |
| `tco-analysis` | `integrationCost`, `consumablesCost`, `laborCost`, `insuranceCost`, `proprietaryComponents`, `alternativeSuppliers`, `dataPortability`, `technologyObsolescence`, `marketPriceTrend`, `regulatoryChanges`, `inflationAssumption`, `currencyExposure`, `interestRate`, `decommissioningCost`, `dataMigrationCost`, `downtimeRisk`, `downtimeCostPerHour` (all optional) |
| `software-licensing` | `usageBasedRate`, `implementationCost`, `longTermDiscount`, `annualEscalation`, `paymentTerms`, `terminationClause`, `dataExportability`, `integrationDependency`, `switchingCostEstimate`, `alternativeProducts`, `proprietaryFeatures`, `vendorStability`, `complianceRequirements`, `currentSolution`, `currentAnnualCost` (all optional) |
| `risk-matrix` | `environmentalRisk`, `sanctionsRisk`, `insurance`, `siteAudits` (optional) |
| `sow-critic` | `clientResources`, `exclusions`, `changeProcess`, `penalties`, `warrantyPeriod` (optional) |
| `sla-definition` | `contactMethods`, `reportingFrequency`, `qualityBonuses` (optional) |
| `rfp-generator` | `mainFocus` (optional -- already optional in scenarios.ts) |
| `requirements-gathering` | `itLandscape`, `niceToHaveFeatures`, `scalability`, `languageSupport` (optional) |
| `negotiation-preparation` | Full rewrite with all 17 fields: required = `industryContext`, `mainFocus`, `negotiationSubject`, `currentSpend`, `supplierName`, `batna`, `negotiationObjectives`; optional = `relationshipHistory`, `buyingPower`, `marketAlternatives`, `switchingCost`, `supplierDependency`, `supplierBatna`, `mustHaves`, `niceToHaves`, `knownConstraints`, `timeline` |
| `procurement-project-planning` | `resourceConstraint`, `stakeholders`, `riskFactors`, `successCriteria`, `strategicAlignment`, `dependencies` (optional) |
| `saas-optimization` | `ssoIntegration`, `duplicateApps`, `supportTier` (optional) |
| `capex-vs-opex` | `propertyTax`, `partsInflation`, `energyCost`, `trainingCost` (optional) |
| `savings-calculation` | `fxRate`, `qualityCost`, `earlyPaymentDiscount`, `storageCost`, `switchingCosts` (optional) |
| `category-strategy` | `innovationNeeds`, `contractStatus`, `stakeholders`, `historicalSavings`, `benchmarkData` (optional) |
| `volume-consolidation` | `volumeGrowthForecast`, `currentPenalties`, `taxRate` (optional) |

Note: `spend-analysis-categorization`, `forecasting-budgeting`, `market-snapshot`, `contract-template`, `make-vs-buy`, `supplier-review` are already complete -- no changes needed.

---

### Change 5: Buyer Personas

Add persona definitions and selection logic:

```typescript
const BUYER_PERSONAS = [
  {
    id: "rushed-junior",
    name: "The Rushed Junior Buyer",
    description: "A junior procurement specialist who is short on time. Provides minimal, vague context. Uses informal language, abbreviations, and often leaves optional fields blank.",
    optionalFillRate: "30-40%"
  },
  {
    id: "methodical-manager",
    name: "The Methodical Category Manager",
    description: "An experienced category manager. Provides highly detailed, structured, and strategic context. Fills out almost all optional fields with precise industry terminology.",
    optionalFillRate: "85-95%"
  },
  {
    id: "cfo-finance",
    name: "The CFO / Finance Leader",
    description: "A senior finance executive focused purely on numbers, risk, and ROI. Provides very short text context but is extremely precise with financial figures (currencies, percentages). Often ignores technical or operational optional fields.",
    optionalFillRate: "40-60% (financial fields prioritized)"
  },
  {
    id: "frustrated-stakeholder",
    name: "The Frustrated Stakeholder (Business Unit)",
    description: "A non-procurement user (e.g., Marketing or IT Director) forced to use the system. Complains in the text fields, provides messy narrative data instead of structured facts, and misunderstands procurement terminology.",
    optionalFillRate: "50-70% (filled but often with wrong format)"
  }
];

function selectPersona(requestedPersona?: string) {
  if (requestedPersona) {
    const found = BUYER_PERSONAS.find(p => p.id === requestedPersona);
    if (found) return found;
  }
  return BUYER_PERSONAS[Math.floor(Math.random() * BUYER_PERSONAS.length)];
}
```

---

### Change 6: Update Request Parsing

Add `persona` to the request body parsing (optional string field):

```typescript
const persona = requireString(body.persona, "persona", { optional: true, maxLength: 100 });
```

Pass it into `handleGenerateMode`, `handleMessyMode`, and full mode.

---

### Change 7: Update Prompt Injection

**`handleGenerateMode`** system prompt addition:

```
BUYER PERSONA:
You are generating test data from the perspective of this user persona: "${selectedPersona.name}"
${selectedPersona.description}

Adjust your output accordingly:
- Tone and verbosity of text fields should match this persona
- Optional field fill rate should be approximately ${selectedPersona.optionalFillRate}

FIELD REQUIREMENTS:
REQUIRED FIELDS (MUST always be filled):
${schema.required.map(f => `- ${f}`).join('\n')}

OPTIONAL FIELDS (fill according to persona behavior):
${schema.optional.map(f => `- ${f}`).join('\n')}
```

**`handleMessyMode`** -- always uses "frustrated-stakeholder" persona (natural fit for chaotic data), but can be overridden.

**Full mode** (`buildGenerationPrompt`) -- persona injected into the system prompt, field list uses `[...schema.required, ...schema.optional]`.

---

### Change 8: Update All Consumers of SCENARIO_SCHEMAS

4 locations need updating:

| Location | Current | New |
|----------|---------|-----|
| `handleGenerateMode` (line 817) | `SCENARIO_SCHEMAS[scenarioType] \|\| ["industryContext"]` | `SCENARIO_SCHEMAS[scenarioType] \|\| { required: ["industryContext"], optional: [] }` then `const fields = [...schema.required, ...schema.optional]` |
| `handleMessyMode` (line 988) | Same pattern | Same fix, plus pass required/optional distinction to prompt |
| Full mode handler (line 635) | Same pattern | Same fix |
| `buildGenerationPrompt` (line 1080) | Takes `fields: string[]` | Takes `schema: { required: string[]; optional: string[] }` and distinguishes in prompt |

**`parseGeneratedData`** (line 1205) continues to accept `string[]` -- callers pass `[...schema.required, ...schema.optional]`.

---

### Change 9: Metadata Enhancement

Include persona info in response metadata for all modes:

```typescript
metadata: {
  // ... existing fields
  persona: selectedPersona.id,
  personaName: selectedPersona.name,
  requiredFieldCount: schema.required.length,
  optionalFieldCount: schema.optional.length,
}
```

---

### Impact Summary

| Metric | Before | After |
|--------|--------|-------|
| Scenarios in SCENARIO_SCHEMAS | 24 (1 with wrong ID) | 29 (all correct) |
| Total fields covered | ~200 | ~350 |
| Required/optional distinction | None | Full split for all 29 |
| Buyer personas | None | 4 personas with behavioral profiles |
| Modes supporting personas | 0 | 3 (generate, messy, full) |

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-test-data/index.ts` | All changes above |

### Deployment

Single edge function deploy: `generate-test-data`

