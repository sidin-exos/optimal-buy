

# Dashboard Testing Pipeline Implementation

## Summary

Synchronize the `scenarioDashboardMapping` with all 29 scenarios and build a Dashboard Testing UI suite with smoke tests, coverage matrix, and Vitest contract tests.

## Important: Invalid Dashboard IDs in Request

Two dashboard IDs from the request do not exist in `dashboardConfigs`:
- `spend-cube` -- does not exist. For `spend-analysis-categorization`, will use the existing mapping: `['cost-waterfall', 'kraljic-quadrant', 'supplier-scorecard', 'data-quality']`
- `compliance-check` -- does not exist. For `software-licensing`, will use: `['license-tier', 'tco-comparison', 'scenario-comparison', 'risk-matrix']` (keeping the current valid mapping)

All other requested mappings use valid dashboard IDs and will be applied as specified.

## Files Changed (4)

### 1. `src/lib/dashboard-mappings.ts` -- Fix Scenario Mapping

**Remove 4 stale entries:**
- `spend-cube-analysis` (scenario ID does not exist)
- `license-optimization` (scenario ID does not exist)
- `supplier-discovery` (scenario ID does not exist)
- `project-planning` (scenario ID does not exist)

**Add 9 missing scenario mappings:**

| Scenario ID | Dashboards |
|---|---|
| `capex-vs-opex` | tco-comparison, cost-waterfall, sensitivity-spider, decision-matrix |
| `savings-calculation` | cost-waterfall, action-checklist, sensitivity-spider, data-quality |
| `saas-optimization` | license-tier, cost-waterfall, action-checklist, data-quality |
| `procurement-project-planning` | timeline-roadmap, action-checklist, risk-matrix, sensitivity-spider |
| `pre-flight-audit` | supplier-scorecard, risk-matrix, action-checklist, data-quality |
| `category-risk-evaluator` | risk-matrix, kraljic-quadrant, sow-analysis, action-checklist |
| `supplier-dependency-planner` | risk-matrix, supplier-scorecard, scenario-comparison, timeline-roadmap |
| `specification-optimizer` | decision-matrix, cost-waterfall, action-checklist, data-quality |
| `black-swan-scenario` | risk-matrix, scenario-comparison, timeline-roadmap, action-checklist |

**Keep existing valid entries unchanged** (20 scenarios already correctly mapped).

Final result: 29 scenario keys, each mapping to 2-4 valid `DashboardType` values.

### 2. `src/components/testing/DashboardSmokeTest.tsx` -- New Component

A tabbed component with two sections:

**Tab A: "Smoke Test"**
- "Run All" button that iterates over all 14 `DashboardType` values
- Each dashboard is rendered inside a React Error Boundary wrapper in a visually-hidden container
- Measures mount time per dashboard
- Results table: Dashboard Name | Status (green PASS / red FAIL badge) | Mount Time (ms)
- Summary: "14/14 passed" or "X/14 failed"

**Tab B: "Coverage Matrix"**
- Imports `scenarios` from `src/lib/scenarios.ts` (all 29)
- Imports `dashboardConfigs` and `scenarioDashboardMapping`
- Renders a matrix table:
  - Rows: 29 scenarios (showing title)
  - Columns: 14 dashboard types (abbreviated names)
  - Cells: green dot where mapping exists, empty otherwise
- Summary stats at top: "XX/29 Scenarios Mapped", "14/14 Dashboards Used", "Total Mappings: YY"
- Highlights any unmapped scenarios in amber

Uses Shadcn `Tabs`, `Card`, `Badge`, `Table`, `Button` components. Clean, professional styling consistent with existing Testing Pipeline page.

### 3. `src/pages/TestingPipeline.tsx` -- Add Tab

- Import `DashboardSmokeTest` component
- Add `LayoutGrid` icon from Lucide
- Add a new `TabsTrigger` for "Dashboard Tests" with the icon
- Add corresponding `TabsContent` rendering `<DashboardSmokeTest />`
- Placed after the existing "Pipeline IQ" tab

### 4. `src/test/dashboard-mappings.test.ts` -- Vitest Contract Test

Three tests:

```text
Test 1: "every scenario ID has a dashboard mapping"
  - Import scenarios array, extract all IDs
  - Assert each ID exists as a key in scenarioDashboardMapping

Test 2: "each mapping has 2-4 dashboards"
  - For each entry in scenarioDashboardMapping
  - Assert array length >= 2 and <= 4
  - Assert every dashboard ID exists in dashboardConfigs

Test 3: "no orphaned keys in mapping"
  - For each key in scenarioDashboardMapping
  - Assert it exists as a scenario ID in scenarios array
```

Pure data contract tests -- no rendering, no DOM, runs in milliseconds.

## Technical Notes

- The Error Boundary for smoke tests is a small class component defined inline in `DashboardSmokeTest.tsx` -- catches render errors and reports them as FAIL results
- Dashboard components all accept optional props and render with defaults, so mounting with no props is safe
- The coverage matrix uses `scenarios` as the source of truth for row count, ensuring any future scenario additions are immediately visible as gaps
- No database or edge function changes required

