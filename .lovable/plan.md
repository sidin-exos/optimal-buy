

# Make All 14 Dashboards Data-Driven with Structured AI JSON

## Summary

Create a parser for `<dashboard-data>` JSON blocks appended by the AI, update all 14 dashboard components with a `parsedData` fallback pattern, update the renderer and report page, and inject prompt instructions into the edge function.

## Files Changed (19)

### 1. New: `src/lib/dashboard-data-parser.ts`

Define typed interfaces for all 14 dashboard data shapes and two utility functions:

**Interfaces:**

| Key | Interface Fields |
|---|---|
| `actionChecklist` | `actions: { action: string; priority: "critical"\|"high"\|"medium"\|"low"; status: "done"\|"in-progress"\|"pending"\|"blocked"; owner?: string; dueDate?: string }[]` |
| `decisionMatrix` | `criteria: { name: string; weight: number }[]; options: { name: string; scores: number[] }[]` |
| `costWaterfall` | `components: { name: string; value: number; type: "cost"\|"reduction" }[]; currency?: string` |
| `timelineRoadmap` | `phases: { name: string; startWeek: number; endWeek: number; status: "completed"\|"in-progress"\|"upcoming"; milestones?: string[] }[]; totalWeeks?: number` |
| `kraljicQuadrant` | `items: { id: string; name: string; supplyRisk: number; businessImpact: number; spend?: string }[]` |
| `tcoComparison` | `data: { year: string; [key: string]: number\|string }[]; options: { id: string; name: string; color: string; totalTCO: number }[]; currency?: string` |
| `licenseTier` | `tiers: { name: string; users: number; costPerUser: number; totalCost: number; color: string; recommended?: number }[]; currency?: string` |
| `sensitivitySpider` | `variables: { name: string; baseCase: number; lowCase: number; highCase: number; unit?: string }[]; baseCaseTotal?: number; currency?: string` |
| `riskMatrix` | `risks: { supplier: string; impact: "high"\|"medium"\|"low"; probability: "high"\|"medium"\|"low"; category: string }[]` |
| `scenarioComparison` | `scenarios: { id: string; name: string; color: string }[]; radarData: { metric: string; [key: string]: number\|string }[]; summary: { criteria: string; [key: string]: string }[]` |
| `supplierScorecard` | `suppliers: { name: string; score: number; trend: "up"\|"down"\|"stable"; spend: string }[]` |
| `sowAnalysis` | `clarity: number; sections: { name: string; status: "complete"\|"partial"\|"missing"; note: string }[]; recommendations?: string[]` |
| `negotiationPrep` | `batna: { strength: number; description: string }; leveragePoints: { point: string; tactic: string }[]; sequence: { step: string; detail: string }[]` |
| `dataQuality` | `fields: { field: string; status: "complete"\|"partial"\|"missing"; coverage: number }[]; limitations?: { title: string; impact: string }[]` |

**Functions:**

- `extractDashboardData(text: string): DashboardData | null`
  - Regex: `/<dashboard-data>([\s\S]*?)<\/dashboard-data>/`
  - Sanitize extracted string: strip `` ```json ``, `` ``` ``, leading/trailing whitespace
  - `JSON.parse` in try/catch, return `null` on failure

- `stripDashboardData(text: string): string`
  - Removes entire `<dashboard-data>...</dashboard-data>` block from text
  - Returns clean markdown

### 2. Update: `src/components/reports/DashboardRenderer.tsx`

- Import `extractDashboardData` and `useMemo`
- Call `const parsedData = useMemo(() => extractDashboardData(analysisResult || ''), [analysisResult])`
- Pass relevant sub-object to each dashboard in the switch:

```
case "action-checklist": return <ActionChecklistDashboard parsedData={parsedData?.actionChecklist} />
case "risk-matrix":      return <RiskMatrixDashboard parsedData={parsedData?.riskMatrix} />
// ... etc for all 14
```

### 3. Update: All 14 Dashboard Components

Each component gets a new optional `parsedData` prop. The pattern for each:

**ActionChecklistDashboard** -- add `parsedData?: ActionChecklistData` to props. Map parsed actions (assigning sequential IDs) or fall back to `defaultActions`.

**DecisionMatrixDashboard** -- add `parsedData?: DecisionMatrixData`. Use `parsedData.criteria` and `parsedData.options` (assigning sequential IDs) or fall back to defaults.

**CostWaterfallDashboard** -- add `parsedData?: CostWaterfallData`. Use `parsedData.components` or default; use `parsedData.currency` or `"$"`.

**TimelineRoadmapDashboard** -- add `parsedData?: TimelineRoadmapData`. Use `parsedData.phases` (assigning sequential IDs) or default.

**KraljicQuadrantDashboard** -- add `parsedData?: KraljicData`. Use `parsedData.items` or default.

**TCOComparisonDashboard** -- add `parsedData?: TCOComparisonData`. Use `parsedData.data`, `parsedData.options`, or defaults.

**LicenseTierDashboard** -- add `parsedData?: LicenseTierData`. Use `parsedData.tiers` or default.

**SensitivitySpiderDashboard** -- add `parsedData?: SensitivityData`. Use `parsedData.variables`, `parsedData.baseCaseTotal` or defaults.

**RiskMatrixDashboard** -- add `parsedData?: RiskMatrixData`. Map `parsedData.risks` into the existing array shape (with sequential IDs) or use hardcoded data.

**ScenarioComparisonDashboard** -- add `parsedData?: ScenarioComparisonData`. Use parsed scenarios/radarData/summary or defaults.

**SupplierPerformanceDashboard** -- add `parsedData?: SupplierScorecardData`. Use `parsedData.suppliers` or default.

**SOWAnalysisDashboard** -- add `parsedData?: SOWAnalysisData`. Use parsed clarity/sections/recommendations or defaults.

**NegotiationPrepDashboard** -- add `parsedData?: NegotiationPrepData`. Use parsed batna/leveragePoints/sequence or defaults.

**DataQualityDashboard** -- add `parsedData?: DataQualityData`. Use parsed fields/limitations or defaults.

**Zero breaking changes** -- if `parsedData` is undefined, every dashboard renders its hardcoded defaults exactly as before.

### 4. Update: `src/pages/GeneratedReport.tsx`

- Import `stripDashboardData` from `@/lib/dashboard-data-parser`
- After line 115 (`const safeAnalysisResult = analysisResult ?? '';`), add:
  ```typescript
  const displayAnalysis = stripDashboardData(safeAnalysisResult);
  ```
- Replace `safeAnalysisResult` with `displayAnalysis` in the "Detailed Analysis" section (lines 299-340) where markdown is rendered
- Keep `safeAnalysisResult` (with the JSON block) passed to `DashboardRenderer` and `ReportExportButtons` so dashboards can extract their data

### 5. Update: `supabase/functions/sentinel-analysis/index.ts`

**In `buildServerGroundedPrompts` system prompt (line 220-232):**

After rule 8, add rule 9:

```
9. At the VERY END of your response, append a <dashboard-data> XML block containing valid JSON with structured data for relevant dashboards. Example:
<dashboard-data>{"actionChecklist":{"actions":[{"action":"...","priority":"high","status":"pending","owner":"..."}]},"riskMatrix":{"risks":[{"supplier":"...","impact":"high","probability":"medium","category":"..."}]}}</dashboard-data>
Only include dashboard keys relevant to the scenario analysis. Use REAL values from your analysis. Do NOT wrap the JSON in markdown code blocks inside the XML tags.
```

**In `SYNTHESIZER_SYSTEM_PROMPT` (line 95-113):**

After the existing instructions, add:

```
IMPORTANT: At the VERY END of your final output, you MUST append a <dashboard-data> XML block containing valid JSON with structured visualization data extracted from your analysis. Do NOT wrap the JSON in markdown code blocks. Include only dashboard keys relevant to the scenario.
```

## What Does NOT Change

- Dashboard showcase page (`/reports`) -- continues using hardcoded data as gallery
- PDF dashboard visuals -- separate system, untouched
- DashboardSmokeTest -- tests with no data (fallback path)
- `dashboard-mappings.ts` -- already updated in previous step
- The AI markdown output remains the primary analysis; the JSON block is additive

## Risk Mitigation

- If AI fails to produce valid JSON or the block is malformed, parser returns `null` and all dashboards fall back to hardcoded defaults
- Sanitization strips markdown code block artifacts (`\`\`\`json`, `\`\`\``) that LLMs commonly inject inside custom XML tags
- Zero breaking changes to any existing functionality

