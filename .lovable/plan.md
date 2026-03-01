

## Plan: Apply Field Methodology v1 to All 29 Scenarios

### Context
The document defines the methodologically optimal field structure for each scenario, specifying:
- Scenario-specific block **labels** (replacing generic names)
- **Sub-prompt placeholder text** within each block (guided input)
- A **deviation type** (0 = 3-block sufficient, 1 = sub-prompts required, 1H = sub-prompts critical, 2 = structural deviation / file upload)

### Scope — What Changes

**File: `src/lib/scenarios.ts`**

#### A. Interface Extension
Add optional `deviationType` field to the `Scenario` interface:
```typescript
deviationType?: 0 | 1 | '1H' | 2;
```
This tags each scenario for future UX logic (e.g. data-gap warnings, file upload patterns).

#### B. Field Restructuring — All 29 Scenarios
For each scenario, update `requiredFields` to match the document's 3-block structure:

1. **Rename field labels** to match document (e.g. `"Asset or Service Definition"`, `"Supplier Proposal & Your Position"`)
2. **Replace placeholder text** with the document's sub-prompt/guided text (bullet-pointed structure for Type 1/1H scenarios)
3. **Consolidate fields** where the current code has 4+ fields but the document specifies 3 blocks — merge related fields into the appropriate block's placeholder guidance
4. **Preserve field IDs** where possible to avoid breaking existing saved data; only rename IDs when blocks are fundamentally restructured

#### C. Per-Scenario Changes (grouped by deviation type)

**Type 0 — 3-Block Sufficient (12 scenarios):** Update labels + placeholders only
- Specification Optimizer, RFP Generator, Tail Spend, Contract Template, Requirements Gathering, Procurement Project Planning, Risk Assessment, Negotiation Preparation, Category Strategy, Supplier Dependency Planner, Disruption Management, Market Snapshot

**Type 1 — Sub-Prompts Required (11 scenarios):** Update labels + add structured bullet-point placeholders
- TCO Analysis, Cost Breakdown, Savings Calculation, Forecasting & Budgeting, SaaS Optimization, SLA Definition, Category Risk Evaluator, Volume Consolidation

**Type 1H — Sub-Prompts Critical (4 scenarios):** Update labels + add mandatory-feel structured placeholders
- CAPEX vs OPEX (WACC + tax rate as explicit sub-prompts)
- Supplier Review (KPI metrics as labeled sub-prompts)
- Risk Matrix (risk register structured input format)
- Make vs Buy (bilateral Make/Buy cost structure)
- Pre-Flight Audit (legal entity vs trading name distinction)

**Type 2 — Structural Deviation (3 scenarios):** Update labels + placeholders, add `deviationType: 2` tag. File upload is **deferred** (requires architectural decision).
- Spend Analysis, SOW Critic, Software Licensing

#### D. Field Count Normalization
Most scenarios will be normalized to **3 textarea fields** matching the document's Block 1/2/3 structure. Exceptions:
- Scenarios with select/dropdown fields that are UX-critical (e.g. Contract Template's country picker, Market Snapshot's region selector) retain those as additional fields
- Block 1 is always `industryContext` (textarea, required or auto-injected)

### What Stays Untouched
- `dataRequirements` (collapsible advisory) — already populated
- `outputs` arrays — no changes
- `strategySelector` — no changes
- `icon`, `status`, `category` — no changes
- `GenericScenarioWizard.tsx` rendering logic — works with any field structure
- Type 2 file upload implementation — deferred to a separate ticket

### Technical Detail

Each scenario update follows this pattern (example — TCO Analysis):

**Before:**
```
fields: industryContext, assetDescription (text), ownershipPeriod (number), 
        capexBreakdown (textarea), opexBreakdown (textarea), riskFactors (textarea)
```

**After:**
```
fields: 
  industryContext (textarea) — label: "Industry & Business Context"
    placeholder: "Describe your industry, organisation size, and the procurement category..."
  assetDefinition (textarea) — label: "Asset or Service Definition"  
    placeholder: "• Asset or service name and description\n• Lifecycle duration (years)\n• Annual volume or usage rate\n• Quoted CAPEX or contract value (€)\n• Primary vendor or supplier (anonymised if needed)"
  opexFinancials (textarea) — label: "OPEX & Financial Parameters"
    placeholder: "• OPEX categories and estimated annual costs — list each: e.g. Maintenance €X / Logistics €Y / Training €Z / Disposal €W\n• WACC or internal discount rate (%)\n• Annual inflation assumption (%)\n• Currency"
```

This pattern repeats for all 29 scenarios, sourcing labels and placeholder text directly from the methodology document tables.

