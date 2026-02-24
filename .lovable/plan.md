

# Fix #3: Report Export Integrations — Excel/CSV + Jira

## Current State

All export buttons in `ReportExportButtons.tsx` (except PDF and Share Link) are stubs that show a "coming soon" toast. The component receives `scenarioTitle`, `analysisResult`, `formData`, `timestamp`, and `selectedDashboards` as props — all the data needed to build exports.

Two integrations are prioritized: **Excel/CSV** (client-side, no external dependencies) and **Jira** (requires Atlassian connector).

---

## Integration A: Excel/CSV Export (Client-Side)

**Approach**: Pure client-side using the `xlsx` npm package (or lightweight alternative). No backend needed. Generates a multi-sheet `.xlsx` file containing:

- **Sheet 1 — Summary**: Scenario title, timestamp, executive summary key points
- **Sheet 2 — Analysis Inputs**: Key-value pairs from `formData`
- **Sheet 3 — Dashboard Data**: If `analysisResult` contains a `<dashboard-data>` block, parse it via `extractDashboardData()` and output each dashboard's structured data as a table (e.g., action checklist rows, cost waterfall components, decision matrix scores)

**Architecture:**

```text
ReportExportButtons.tsx
  → handleExcelExport()
    → extractDashboardData(analysisResult)
    → buildExcelWorkbook(title, formData, keyPoints, dashboardData)
    → trigger browser download of .xlsx blob
```

**New dependency**: `xlsx` (SheetJS Community Edition) — lightweight, no backend needed, well-maintained.

**Files changed:**
| # | File | Action |
|---|---|---|
| 1 | `package.json` | Add `xlsx` dependency |
| 2 | `src/lib/report-export-excel.ts` | New — builds multi-sheet workbook from report data |
| 3 | `src/components/reports/ReportExportButtons.tsx` | Wire Excel button to real export function |

---

## Integration B: Jira Export (Atlassian Connector)

**Approach**: Use the Atlassian MCP connector (available but not yet connected) to create a Jira issue from the report. The export creates an issue with:

- **Title**: `[EXOS] {scenarioTitle} Analysis — {date}`
- **Description**: Executive summary key points as markdown bullet list + link to shared report
- **Checklist/subtasks**: If an `action-checklist` dashboard exists in the data, map each action item as a subtask or checklist entry

**However** — the Atlassian MCP connector extends the **Lovable agent** (build-time), not the **user's app** (runtime). This means:

> MCP tools are available to me (the agent) to help build apps, but the apps themselves cannot call MCP tools directly.

**Options for Jira runtime integration:**

| Option | Approach | Complexity |
|--------|----------|------------|
| **A — Edge Function + Jira API** | User provides a Jira API token as a secret. An edge function calls the Jira REST API to create issues. Full control, real integration. | Medium |
| **B — Copy-to-Clipboard for Jira** | Format the report as Jira-compatible markdown. User clicks "Copy for Jira" and pastes into a new Jira issue. Zero infrastructure. | Low |
| **C — Jira Webhook** | User configures a Jira Automation webhook URL. Edge function POSTs a payload that Jira Automation converts into an issue. No API token needed. | Medium-Low |

**Recommendation**: Start with **Option B** (Copy for Jira) as the MVP — it provides immediate value with zero infrastructure. Then upgrade to **Option A** (Edge Function) when users request true one-click creation.

---

## Implementation Plan

### Step 1: Excel Export (no backend)

1. Install `xlsx` package
2. Create `src/lib/report-export-excel.ts`:
   - `exportReportToExcel(scenarioTitle, analysisResult, formData, timestamp, selectedDashboards)`
   - Uses `extractDashboardData()` to parse structured dashboard data
   - Builds sheets: Summary, Inputs, per-dashboard data tables
   - Triggers `.xlsx` download via blob URL
3. Update `ReportExportButtons.tsx`: Replace the Excel stub `handleExport("Excel")` with the real function call

### Step 2: Jira — Copy-to-Clipboard MVP

1. Create `src/lib/report-export-jira.ts`:
   - `formatReportForJira(scenarioTitle, analysisResult, formData, timestamp)`: Returns Jira-flavored markdown string
   - Includes: heading, executive summary bullets, action items (if present), link placeholder
2. Update `ReportExportButtons.tsx`:
   - Replace Jira stub with a function that calls `formatReportForJira()` and copies to clipboard
   - Show toast: "Report formatted for Jira — paste into a new issue"
   - Change button label to "Copy for Jira"

### Step 3 (Future): Jira API Integration

When upgrading to direct Jira API integration:
1. User provides Jira credentials (domain, email, API token) via secrets
2. Edge function `export-to-jira` creates the issue via Jira REST API v3
3. UI shows a dialog for project/issue-type selection before creating

---

## Files Changed

| # | File | Action | Summary |
|---|---|---|---|
| 1 | `package.json` | Edit | Add `xlsx` dependency |
| 2 | `src/lib/report-export-excel.ts` | Create | Multi-sheet Excel workbook builder |
| 3 | `src/lib/report-export-jira.ts` | Create | Jira markdown formatter |
| 4 | `src/components/reports/ReportExportButtons.tsx` | Edit | Wire Excel + Jira buttons to real functions, update labels |

## What Does NOT Change
- PDF export — already functional
- Share Link — already functional
- Notion/Confluence/Slack/Trello — remain as stubs (deprioritized)
- Dashboard data parser — reused as-is
- Edge functions — none needed for this phase

## Technical Notes
- `xlsx` (SheetJS) is ~200KB gzipped, tree-shakeable. Alternative: `exceljs` (heavier but more formatting control). Recommend `xlsx` for velocity.
- The Jira clipboard approach works because Jira's rich text editor accepts markdown-like formatting on paste.
- The Excel export reuses `extractDashboardData()` — same parser that feeds the PDF and interactive dashboards. Single Source of Truth preserved.

