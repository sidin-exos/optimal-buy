

# Bulk AI UX Refactoring -- All Remaining Scenarios (Round 2)

## Summary
Refactor 22 scenarios from micro-field forms (selects, numbers, currencies) into 3-5 universal textarea blocks following the validated "3-Block Meta-Pattern". This eliminates UX friction, serialization bugs, and aligns with the AI-first extraction approach.

Already refactored (no changes needed): `make-vs-buy`, `tco-analysis`, `rfp-generator`.

## Scenarios with Explicit Replacement Specs (12 scenarios)

### 1. `cost-breakdown` (lines 87-112)
Remove 14 fields (including `MAIN_FOCUS_FIELD`, `totalCost`, `materialCost`, `laborCost`, `overheadCost`, `logisticsCost`, `toolingCost`, `profitMargin`, `volumePerYear`, `commodityIndex`, `laborRateReference`, `currencyExposure`).
Replace with 4 fields: `industryContext`, `productDescription` (text), `currentCosts` (textarea, required), `marketFactors` (textarea, optional).

### 2. `disruption-management` (lines 177-201)
Remove 12 fields (including `MAIN_FOCUS_FIELD`, `deficitSku`, `stockDays`, `altSuppliers`, `altProducts`, `substitutePrice`, `switchingTime`, `lostRevenuePerDay`, `inTransitStatus`, `forceMajeureClause`, `competitorResponse`).
Replace with 4 fields: `industryContext`, `crisisDescription` (textarea, required), `impactAssessment` (textarea, required), `alternativesContext` (textarea, optional).

### 3. `risk-assessment` (lines 202-244)
Remove 16 fields (including `MAIN_FOCUS_FIELD`, `annualValue`, all selects for market/regulatory/contract analysis, `recentIncidents`, `businessCriticality`, `recoveryTime`).
Replace with 5 fields: `industryContext`, `assessmentSubject` (text), `currentSituation` (textarea, required), `contractContext` (textarea, optional), `riskTolerance` (textarea, optional).

### 4. `software-licensing` (lines 274-327)
Remove 25 fields (including `MAIN_FOCUS_FIELD`, all user tier numbers, pricing currencies, contract selects, vendor lock-in selects).
Replace with 5 fields: `industryContext`, `softwareDetails` (textarea, required), `userMetrics` (textarea, required), `commercialTerms` (textarea, optional), `strategicFactors` (textarea, optional).

### 5. `risk-matrix` (lines 328-352)
Remove 11 fields (including `MAIN_FOCUS_FIELD`, all select fields for legal/financial/cyber/environmental risk).
Replace with 4 fields: `industryContext`, `supplierName` (text, required), `operationalRisks` (textarea, required), `commercialRisks` (textarea, optional).

### 6. `requirements-gathering` (lines 430-454)
Remove 12 fields (including `MAIN_FOCUS_FIELD`, `budget`, `userCount`, `itLandscape`, `dataSecurityLevel`, `urgency`, selects, `mustHaveFeatures`, `niceToHaveFeatures`, `scalability`, `languageSupport`).
Replace with 4 fields: `industryContext`, `businessGoal` (textarea, required), `technicalLandscape` (textarea, required), `featureRequirements` (textarea, optional).

### 7. `volume-consolidation` (lines 457-481)
Remove 12 fields (including `MAIN_FOCUS_FIELD`, `spendPerVendor`, `skuOverlap`, `unitOfMeasure`, `logisticsDistance`, `paymentTerms`, `orderFrequency`, `reliabilityIndex`, `volumeGrowthForecast`, `currentPenalties`, `taxRate`).
Replace with 4 fields: `industryContext`, `consolidationScope` (textarea, required), `logisticsTerms` (textarea, optional), `growthForecast` (textarea, optional).

### 8. `capex-vs-opex` (lines 482-506)
Remove 11 fields (including `MAIN_FOCUS_FIELD`, `purchasePrice`, `leaseRate`, `leaseTerm`, `maintenanceCost`, `residualValue`, `propertyTax`, `wacc`, `partsInflation`, `energyCost`, `trainingCost`).
Replace with 4 fields: `industryContext`, `assetDetails` (textarea, required), `lifecycleCosts` (textarea, optional), `financialParameters` (textarea, optional).

### 9. `saas-optimization` (lines 532-556)
Remove 12 fields (including `MAIN_FOCUS_FIELD`, `totalSeats`, `pricePerSeat`, `lastLoginDate`, `featureUsage`, `contractEndDate`, `noticePeriod`, `autoRenewal`, `ssoIntegration`, `duplicateApps`, `supportTier`).
Replace with 4 fields: `industryContext`, `subscriptionDetails` (textarea, required), `usageMetrics` (textarea, required), `redundancyContext` (textarea, optional).

### 10. `category-strategy` (lines 582-617)
Remove 14 fields (including `MAIN_FOCUS_FIELD`, `categoryName`, `annualSpend`, `supplierCount`, all selects, `currentStrategy`, `painPoints`, `innovation Needs`, `historicalSavings`, `benchmarkData`).
Replace with 4 fields: `industryContext`, `categoryOverview` (textarea, required), `marketDynamics` (textarea, required), `strategicGoals` (textarea, optional).

### 11. `supplier-dependency-planner` (lines 750-796)
Remove 18 fields (including `MAIN_FOCUS_FIELD`, `supplierName`, `serviceCategory`, `annualSpend`, `categoryTotalSpend`, all dependency/lock-in/market selects, `uniqueCapabilities`, `switchingCostEstimate`).
Replace with 4 fields: `industryContext`, `dependencyContext` (textarea, required), `lockInFactors` (textarea, required), `diversificationGoals` (textarea, optional).

### 12. `black-swan-scenario` (lines 829-875)
Remove 18 fields (including `MAIN_FOCUS_FIELD`, `assessmentScope` select, `scopeDetails`, `annualExposure`, all risk posture/response selects, `scenarioTypes`, `recentNearMisses`).
Replace with 4 fields: `industryContext`, `assessmentScope` (textarea, required), `riskPosture` (textarea, required), `scenarioSimulation` (textarea, optional).

## Scenarios with Auto-Design (10 scenarios)

For the remaining scenarios, I will apply the same meta-pattern: group micro-fields into 3-4 logical textareas, keeping `industryContext` as the first field.

### 13. `savings-calculation` (lines 507-531)
Remove 11 fields (including `MAIN_FOCUS_FIELD`, `baselinePrice`, `newPrice`, `volume`, `inflationIndex`, `fxRate`, `qualityCost`, `earlyPaymentDiscount`, `storageCost`, `contractTerm`, `switchingCosts`).
Replace with 4 fields:
- `industryContext` (textarea, required)
- `savingsScenario` (textarea, required) -- Label: "Savings Scenario & Baseline". Placeholder: "E.g., Negotiated widget price from $120 to $105/unit. Annual volume: 10,000 units. 3-year contract."
- `costAdjustments` (textarea, required) -- Label: "Cost Adjustments & Hidden Costs". Placeholder: "E.g., Inflation at 4%. FX impact: EUR/USD hedge. Switching costs: $25k one-time. Quality defect rate expected to drop."
- `reportingRequirements` (textarea, optional) -- Label: "Reporting & Audit Requirements". Placeholder: "E.g., Finance requires documented baseline and auditable methodology. Need hard vs soft savings split."

### 14. `sow-critic` (lines 355-379)
Remove 9 fields (`MAIN_FOCUS_FIELD`, `deliverables`, `acceptanceCriteria`, `timeline`, `responsibilities`, `clientResources`, `exclusions`, `changeProcess`, `penalties`, `warrantyPeriod`).
Replace with 3 fields:
- `industryContext` (textarea, required)
- `sowText` (textarea, required) -- Keep as-is, this is the core input
- `reviewPriorities` (textarea, optional) -- Label: "Review Priorities & Known Concerns". Placeholder: "E.g., Concerned about IP ownership, unclear liability caps, and missing change request process. Deliverables are vague."

### 15. `sla-definition` (lines 380-403)
Remove 10 fields (including `MAIN_FOCUS_FIELD`, `operatingHours`, `responseTime`, `resolutionTime`, `allowedDowntime`, `serviceCriticality`, `contactMethods`, `escalationProcess`, `reportingFrequency`, `qualityBonuses`).
Replace with 4 fields:
- `industryContext` (textarea, required)
- `serviceDescription` (textarea, required) -- Label: "Service Description & Criticality". Placeholder: "E.g., Cloud hosting for our e-commerce platform. Mission critical -- 99.9% uptime required. 24/7 operation."
- `performanceTargets` (textarea, required) -- Label: "Performance Targets & Response Times". Placeholder: "E.g., P1 response: 15 min. P2: 1 hour. Resolution: 4h for critical. Allowed downtime: 0.1%/month."
- `escalationAndPenalties` (textarea, optional) -- Label: "Escalation, Penalties & Bonuses". Placeholder: "E.g., Tier 1 to Tier 2 after 2h. 5% credit for SLA breach. Bonus: free month for zero incidents."

### 16. `procurement-project-planning` (lines 652-679)
Remove 14 fields (including `MAIN_FOCUS_FIELD`, `projectTitle`, `projectObjective`, `projectScope`, `keyInputs`, `expectedOutputs`, `budgetConstraint`, `timelineConstraint`, `resourceConstraint`, `stakeholders`, `riskFactors`, `successCriteria`, `strategicAlignment`, `dependencies`).
Replace with 4 fields:
- `industryContext` (textarea, required)
- `projectBrief` (textarea, required) -- Label: "Project Brief & Objectives". Placeholder: "E.g., 'Strategic Sourcing Transformation' -- Reduce procurement costs by 15% over 3 years. Scope: All indirect spend in North America."
- `constraintsAndResources` (textarea, required) -- Label: "Constraints, Resources & Stakeholders". Placeholder: "E.g., Budget: $500k. Team: 3 FTEs. Timeline: 12 months. Key stakeholders: CPO, CFO, Operations."
- `risksAndSuccess` (textarea, optional) -- Label: "Risks, Dependencies & Success Criteria". Placeholder: "E.g., Risk: scope creep, change resistance. Success: 15% savings achieved, 80% stakeholder adoption."

### 17. `pre-flight-audit` (lines 681-709)
Remove 10 fields (including `MAIN_FOCUS_FIELD`, `supplierWebsite`, `supplierName`, `plannedPurchase`, `estimatedValue`, `existingRelationship`, `researchFocus`, `urgency`, `redFlags`).
Replace with 4 fields:
- `industryContext` (textarea, required)
- `supplierIdentity` (textarea, required) -- Label: "Supplier Identity & Website". Placeholder: "E.g., Acme Corp (www.acme.com). New supplier. Planning to purchase IT managed services, ~$500k/year."
- `researchScope` (textarea, required) -- Label: "Research Focus & Known Concerns". Placeholder: "E.g., Focus on financial health and legal history. Heard rumors of cash flow issues. CEO recently changed."
- `decisionContext` (textarea, optional) -- Label: "Decision Timeline & Relationship Context". Placeholder: "E.g., Need intelligence within 2 weeks. Currently no relationship. Strategic partnership potential."

### 18. `category-risk-evaluator` (lines 710-749)
Remove 15 fields (including `MAIN_FOCUS_FIELD`, `categoryName`, `tenderStage`, `sowText`, `contractType`, `contractValue`, all market/regulatory selects, `pastIssues`).
Replace with 4 fields:
- `industryContext` (textarea, required)
- `categoryAndTender` (textarea, required) -- Label: "Category, Tender Stage & Contract Value". Placeholder: "E.g., IT Services for banking digital transformation. RFP active. Estimated value: $2M. Fixed price contract."
- `sowAndMarket` (textarea, required) -- Label: "SOW Summary & Market Dynamics". Placeholder: "E.g., Scope includes cloud migration and app modernization. Market is consolidating. Skills shortage driving prices up."
- `historicalRisks` (textarea, optional) -- Label: "Past Issues & Category Risks". Placeholder: "E.g., Previous vendor went bankrupt. Significant scope creep on similar projects. High regulatory exposure."

### 19. `specification-optimizer` (lines 797-828)
Remove 12 fields (including `MAIN_FOCUS_FIELD`, `specificationText`, `specificationCategory`, `estimatedValue`, `specSource`, `lastReviewed`, `competitiveMarket`, `safetyRequirements`, `performanceMargins`, `certificationRequirements`, `tolerances`).
Replace with 4 fields:
- `industryContext` (textarea, required)
- `specificationText` (textarea, required) -- Keep as-is, this is the core input
- `specContext` (textarea, required) -- Label: "Specification Context & Source". Placeholder: "E.g., Equipment spec from engineering team, last reviewed 4 years ago. Safety critical. Only 2 suppliers can meet current spec. Estimated purchase: $500k."
- `optimizationGoals` (textarea, optional) -- Label: "Optimization Goals & Constraints". Placeholder: "E.g., Want to open spec to more suppliers without compromising safety. Tolerances may be over-specified. Looking for 15-20% cost reduction."

### 20. `market-snapshot` (lines 876-904)
Keep mostly as-is -- already lean (5 fields). Only remove `industryContext` type change (text to textarea) and keep `region` as a select (it's functional here, not a micro-field). No changes needed -- this scenario is already well-designed.

### 21. `contract-template` (lines 905-948)
Remove `MAIN_FOCUS_FIELD` only. Keep `country` select and `timeTier` select (functional, not micro-fields). Keep `contractBrief`, `contractType`, `contractValue`, `specialRequirements`. This scenario is already mostly textarea-driven with functional selects.
Final fields (7): `industryContext`, `country` (select), `timeTier` (select), `contractBrief` (textarea), `contractType` (select), `contractValue` (text), `specialRequirements` (textarea). Just remove `MAIN_FOCUS_FIELD`.

### 22. Scenarios already OK (no changes)
- `spend-analysis-categorization` (lines 113-134) -- Already has 5 lean fields, mostly textareas. Keep as-is but remove `MAIN_FOCUS_FIELD`.
- `tail-spend-sourcing` (lines 135-154) -- Has some micro-fields (`purchaseAmount`, `urgency`, `alternativesExist`) but these are functional for tail spend routing. Keep as-is but remove `MAIN_FOCUS_FIELD`.
- `forecasting-budgeting` (lines 557-581) -- Already uses textareas + one functional select. No changes needed.
- `negotiation-preparation` (lines 618-651) -- Already mostly textareas with functional selects. Keep as-is but remove `MAIN_FOCUS_FIELD`.
- `supplier-review` (lines 155-176) -- Has some functional numeric fields (quality score, OTD%). Keep as-is but remove `MAIN_FOCUS_FIELD`.

## MAIN_FOCUS_FIELD Cleanup
Remove `MAIN_FOCUS_FIELD` from ALL scenarios where it still appears. The project brief / first textarea in each scenario already captures this intent. Affected scenarios: `cost-breakdown`, `spend-analysis-categorization`, `tail-spend-sourcing`, `supplier-review`, `disruption-management`, `risk-assessment`, `software-licensing`, `risk-matrix`, `sow-critic`, `sla-definition`, `requirements-gathering`, `volume-consolidation`, `capex-vs-opex`, `savings-calculation`, `saas-optimization`, `category-strategy`, `negotiation-preparation`, `procurement-project-planning`, `pre-flight-audit`, `category-risk-evaluator`, `specification-optimizer`, `black-swan-scenario`, `contract-template`.

Note: The `MAIN_FOCUS_FIELD` export itself will remain in the file (to avoid breaking any other imports) but will no longer be referenced by any scenario.

## Test Data Factory Updates

For every modified scenario in `test-data-factory.ts`, replace the old micro-field generators with `randomChoice([...])` arrays of realistic paragraph-style strings for the new textarea fields. All values will be plain strings.

### Scenarios needing full generator rewrites (17 total):
1. `cost-breakdown` -- new fields: `productDescription`, `currentCosts`, `marketFactors`
2. `disruption-management` -- new fields: `crisisDescription`, `impactAssessment`, `alternativesContext`
3. `risk-assessment` -- new fields: `assessmentSubject`, `currentSituation`, `contractContext`, `riskTolerance`
4. `software-licensing` -- new fields: `softwareDetails`, `userMetrics`, `commercialTerms`, `strategicFactors`
5. `risk-matrix` -- new fields: `supplierName`, `operationalRisks`, `commercialRisks`
6. `requirements-gathering` -- new fields: `businessGoal`, `technicalLandscape`, `featureRequirements`
7. `volume-consolidation` -- new fields: `consolidationScope`, `logisticsTerms`, `growthForecast`
8. `capex-vs-opex` -- new fields: `assetDetails`, `lifecycleCosts`, `financialParameters`
9. `savings-calculation` -- new fields: `savingsScenario`, `costAdjustments`, `reportingRequirements`
10. `saas-optimization` -- new fields: `subscriptionDetails`, `usageMetrics`, `redundancyContext`
11. `category-strategy` -- new fields: `categoryOverview`, `marketDynamics`, `strategicGoals`
12. `supplier-dependency-planner` -- currently has no generator, will add one with: `dependencyContext`, `lockInFactors`, `diversificationGoals`
13. `black-swan-scenario` -- currently has no generator, will add one with: `assessmentScope`, `riskPosture`, `scenarioSimulation`
14. `sow-critic` -- remove micro-fields, add `reviewPriorities`
15. `sla-definition` -- new fields: `serviceDescription`, `performanceTargets`, `escalationAndPenalties`
16. `procurement-project-planning` (key: `project-planning`) -- new fields: `projectBrief`, `constraintsAndResources`, `risksAndSuccess`
17. `pre-flight-audit` / `category-risk-evaluator` / `specification-optimizer` -- currently have no generators, will add them

### Scenarios needing minor generator cleanup (remove `mainFocus` only):
- `supplier-review`, `tail-spend-sourcing`, `spend-analysis-categorization`, `negotiation-preparation`, `contract-template`

## Files Modified
- `src/lib/scenarios.ts` -- All scenario `requiredFields` arrays
- `src/lib/test-data-factory.ts` -- All corresponding test data generators

## No Database or Edge Function Changes
All changes are frontend-only schema definitions and test data generators.

