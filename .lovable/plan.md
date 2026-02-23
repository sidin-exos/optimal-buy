

# Data-Driven PDF Dashboard Visuals -- Implementation Plan

## Overview

Mirror the `parsedData` fallback pattern from web dashboards onto all 16 PDF files. The `analysisResult` string already flows into `PDFReportDocument`; we extract the JSON there, thread it through `PDFDashboardVisuals`, and into each of the 14 PDF visual components.

---

## File 1: `src/components/reports/pdf/PDFReportDocument.tsx`

**Changes:**
- Import `extractDashboardData`, `stripDashboardData`, and `DashboardData` type from `@/lib/dashboard-data-parser`
- Inside the component body (before JSX return), add:
  - `const parsedData = extractDashboardData(analysisResult);`
  - `const strippedAnalysis = stripDashboardData(analysisResult);`
- Replace `analysisResult.split("\n")` on line 322 with `strippedAnalysis.split("\n")` so the `<dashboard-data>` block never renders in PDF text
- Replace `extractKeyPoints(analysisResult)` with `extractKeyPoints(strippedAnalysis)`
- Pass `parsedData` to `PDFDashboardVisuals`: change line 380 from `<PDFDashboardVisuals selectedDashboards={selectedDashboards} />` to `<PDFDashboardVisuals selectedDashboards={selectedDashboards} parsedData={parsedData} />`

---

## File 2: `src/components/reports/pdf/PDFDashboardVisuals.tsx`

**Changes:**
- Import `DashboardData` type from `@/lib/dashboard-data-parser`
- Add `parsedData?: DashboardData | null` to `PDFDashboardVisualsProps`
- Pass relevant sub-objects in each switch case:

| Case | Change |
|---|---|
| `action-checklist` | `<PDFActionChecklist data={parsedData?.actionChecklist} />` |
| `decision-matrix` | `<PDFDecisionMatrix data={parsedData?.decisionMatrix} />` |
| `cost-waterfall` | `<PDFCostWaterfall data={parsedData?.costWaterfall} />` |
| `timeline-roadmap` | `<PDFTimelineRoadmap data={parsedData?.timelineRoadmap} />` |
| `kraljic-quadrant` | `<PDFKraljicQuadrant data={parsedData?.kraljicQuadrant} />` |
| `tco-comparison` | `<PDFTCOComparison data={parsedData?.tcoComparison} />` |
| `license-tier` | `<PDFLicenseTier data={parsedData?.licenseTier} />` |
| `sensitivity-spider` | `<PDFSensitivityAnalysis data={parsedData?.sensitivitySpider} />` |
| `risk-matrix` | `<PDFRiskMatrix data={parsedData?.riskMatrix} />` |
| `scenario-comparison` | `<PDFScenarioComparison data={parsedData?.scenarioComparison} />` |
| `supplier-scorecard` | `<PDFSupplierScorecard data={parsedData?.supplierScorecard} />` |
| `sow-analysis` | `<PDFSOWAnalysis data={parsedData?.sowAnalysis} />` |
| `negotiation-prep` | `<PDFNegotiationPrep data={parsedData?.negotiationPrep} />` |
| `data-quality` | `<PDFDataQuality data={parsedData?.dataQuality} />` |

---

## Files 3-16: All 14 PDF Visual Components

Each component follows the same pattern:

1. Import the relevant type from `@/lib/dashboard-data-parser`
2. Add `{ data?: TypeName }` to the component signature
3. Compute effective data from `data` or fall back to the existing hardcoded constants
4. Move derived calculations (totals, percentages, sorted arrays) inside the component body so they recompute from effective data

### File 3: `PDFActionChecklist.tsx`

- Import `ActionChecklistData`
- Signature: `({ data }: { data?: ActionChecklistData })`
- Map parsed actions to internal shape:
  ```typescript
  const tasks = data?.actions?.map(a => ({
    task: a.action,
    status: a.status === "done" ? "Done" : a.status === "in-progress" ? "In Progress" : "To Do",
    priority: a.priority.charAt(0).toUpperCase() + a.priority.slice(1),
    owner: a.owner || "Unassigned",
    color: a.status === "done" ? colors.success : a.status === "in-progress" ? colors.warning : colors.textMuted,
  })) || defaultTasks;
  ```
- Move `stats` and `progressPct` computation inside the component body

### File 4: `PDFDecisionMatrix.tsx`

- Import `DecisionMatrixData`
- Signature: `({ data }: { data?: DecisionMatrixData })`
- Effective criteria: `const effectiveCriteria = data?.criteria || defaultCriteria`
- Effective options: map `data?.options` to include a computed `weighted` score and assign colors, or fall back to `defaultOptions`
- Recompute `winner` inside the body

### File 5: `PDFCostWaterfall.tsx`

- Import `CostWaterfallData`
- Signature: `({ data }: { data?: CostWaterfallData })`
- Map `data?.components` to the existing bar shape (name, value as percentage of total, formatted amount, color based on type "cost" vs "reduction")
- Recompute `totalAmount` and `savingsOpportunity` from effective data

### File 6: `PDFTimelineRoadmap.tsx`

- Import `TimelineRoadmapData`
- Signature: `({ data }: { data?: TimelineRoadmapData })`
- Map `data?.phases` to internal shape with `weeks` string, `duration`, `milestone`, `color` per status, and `status` mapping ("completed" to "complete", etc.)
- Recompute `totalWeeks` and `currentPhase`

### File 7: `PDFKraljicQuadrant.tsx`

- Import `KraljicData`
- Signature: `({ data }: { data?: KraljicData })`
- Derive quadrant from thresholds: `supplyRisk >= 50 && businessImpact >= 50` = "strategic", `supplyRisk >= 50 && businessImpact < 50` = "bottleneck", etc.
- Map items to the same shape with `name`, `quadrant`, `x`, `y`, `spend`

### File 8: `PDFTCOComparison.tsx`

- Import `TCOComparisonData`
- Signature: `({ data }: { data?: TCOComparisonData })`
- Use `data?.options` for option names/colors/totalTCO, or defaults
- Use `data?.data` for yearly values, or defaults
- Recompute `lowestTCO`, `savings`, `maxValue`

### File 9: `PDFLicenseTier.tsx`

- Import `LicenseTierData`
- Signature: `({ data }: { data?: LicenseTierData })`
- Use `data?.tiers` or defaults
- Recompute `totalUsers`, `totalCost`, `optimizedCost`, `potentialSavings`, `maxCost` inside the body

### File 10: `PDFSensitivityTornado.tsx`

- Import `SensitivityData`
- Signature: `({ data }: { data?: SensitivityData })`
- Map `data?.variables` to tornado format. For each variable, compute percentage deltas:
  ```typescript
  const baseCase = v.baseCase || 1; // prevent division by zero
  const low = Math.round(((v.lowCase - baseCase) / baseCase) * 100);
  const high = Math.round(((v.highCase - baseCase) / baseCase) * 100);
  ```
- Recompute `maxImpact` and `scale`

### File 11: `PDFRiskMatrix.tsx`

- Import `RiskMatrixData`
- Signature: `({ data }: { data?: RiskMatrixData })`
- Convert string impact/probability to numeric: `"high"` = 5, `"medium"` = 3, `"low"` = 1
- Map to same shape as existing `risks` array (with generated IDs and "Operations" as default category)
- Move `sortedRisks`, `criticalCount`, `highCount` inside component body

### File 12: `PDFScenarioComparison.tsx`

- Import `ScenarioComparisonData`
- Signature: `({ data }: { data?: ScenarioComparisonData })`
- Map `data?.radarData` to criteria rows. Extract scenario names/colors from `data?.scenarios` (first two)
- Recompute weighted totals and winner

### File 13: `PDFSupplierScorecard.tsx`

- Import `SupplierScorecardData`
- Signature: `({ data }: { data?: SupplierScorecardData })`
- Map `data?.suppliers` to include `category: "General"` default since parser type doesn't have category
- Fall back to hardcoded suppliers

### File 14: `PDFSOWAnalysis.tsx`

- Import `SOWAnalysisData`
- Signature: `({ data }: { data?: SOWAnalysisData })`
- Map `data?.sections` to clause shape with color based on status ("complete" -> success, "partial" -> warning, "missing" -> destructive)
- Use `data?.clarity` or computed `avgScore`

### File 15: `PDFNegotiationPrep.tsx`

- Import `NegotiationPrepData`
- Signature: `({ data }: { data?: NegotiationPrepData })`
- Map `data?.sequence` to steps with status (first = "complete", second = "active", rest = "upcoming")
- Use `data?.batna?.strength` for BATNA Score metric

### File 16: `PDFDataQuality.tsx`

- Import `DataQualityData`
- Signature: `({ data }: { data?: DataQualityData })`
- Map `data?.fields` to internal shape with computed `value` from `coverage`, `status` label, and `missing` note from status
- Recompute `avgQuality`

---

## Constraints Respected

- All components use ONLY `@react-pdf/renderer` primitives (`View`, `Text`)
- Division-by-zero guarded (tornado baseCase defaults to 1, task list length checked)
- Zero breaking changes: `data` prop is optional; when undefined, all hardcoded defaults remain

## What Does NOT Change

- `theme.ts` -- untouched
- `PDFPreviewModal.tsx` -- already passes `analysisResult` through
- `ReportExportButtons.tsx` -- already passes all props through
- Web dashboard components -- already updated in prior iteration
- The hardcoded default data stays in each file as fallback

