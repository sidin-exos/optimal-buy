

## Upgrade: Dashboard Section to Interactive, CFO-Oriented Guide

### Summary

Transform the flat, reference-only Dashboards page into an interactive decision-support tool. Each dashboard gets a rich "context card" displayed above it, explaining what metrics it tracks, when a CFO should use it, what questions it answers, and which EXOS scenarios generate it. The tab selector gets visual improvements with scenario count badges. A new "Guide Me" intro section helps CFOs navigate by business question rather than dashboard name.

### What Changes

**1. Enrich `dashboardConfigs` with CFO-oriented metadata (`src/lib/dashboard-mappings.ts`)**

Add three new fields to the `DashboardConfig` interface and populate them for all 14 dashboards:

```text
interface DashboardConfig {
  id: DashboardType;
  name: string;
  description: string;       // existing short description
  icon: string;
  // NEW fields:
  keyMetrics: string[];       // 3-5 bullet metrics (e.g., "Weighted Score per Option", "Cost Delta %")
  whenToUse: string;          // 1-2 sentence CFO guidance (e.g., "Use when comparing 3+ vendor options on cost, quality, and strategic fit")
  questionsAnswered: string[];// 2-3 business questions (e.g., "Which supplier gives best value for money?")
}
```

Example for Decision Matrix:
```text
keyMetrics: ["Weighted score per option", "Criteria weight distribution", "Score gap between top options"]
whenToUse: "Use when you need to compare multiple options across weighted criteria — ideal for make-vs-buy, vendor selection, or technology choices."
questionsAnswered: ["Which option scores highest across all factors?", "How sensitive is the result to weight changes?", "Are there clear winners or is it a close call?"]
```

**2. Create `DashboardContextCard` component (`src/components/reports/DashboardContextCard.tsx`)**

A new component rendered above each dashboard visualization. Layout:

```text
+----------------------------------------------------------+
| [Icon]  Dashboard Name                    [N scenarios]   |
|                                                           |
| "When to use" guidance text (1-2 sentences)               |
|                                                           |
| Key Metrics            | Questions This Answers           |
| - Weighted Score       | - Which option scores highest?   |
| - Cost Delta %         | - How sensitive is the result?   |
| - Criteria Coverage    | - Are there clear winners?       |
|                                                           |
| Available for Scenarios:                                  |
| [Make vs Buy] [TCO Analysis] [Cost Breakdown]             |
+----------------------------------------------------------+
```

- Scenario names rendered as clickable badges that link to `/scenarios` (or could deep-link in future)
- Collapsible by default on mobile, expanded on desktop
- Uses existing card styling (card-elevated, muted backgrounds)

**3. Add "Guide Me" intro section to Reports page (`src/pages/Reports.tsx`)**

Replace the current minimal hero with a richer intro that includes a "What are you trying to decide?" quick-filter. This is a set of 4-5 clickable category cards:

```text
"Compare Options"    -> highlights Decision Matrix, Scenario Comparison, TCO Comparison
"Understand Costs"   -> highlights Cost Breakdown, TCO Comparison, Sensitivity Analysis
"Manage Risk"        -> highlights Risk Matrix, Supplier Scorecard, SOW Analysis
"Plan & Execute"     -> highlights Timeline Roadmap, Action Checklist, Negotiation Prep
"Assess Data Quality"-> highlights Data Quality, Kraljic Matrix
```

Clicking a category scrolls to and highlights the relevant dashboard tabs. This gives CFOs an entry point by business question rather than requiring them to know dashboard names.

**4. Upgrade tab selector with scenario count badges (`src/pages/Reports.tsx`)**

Each tab trigger shows a small badge with the number of scenarios that use that dashboard (from `getDashboardScenarioCount`). This signals which dashboards are most versatile.

**5. Restructure `DashboardWithAnnotation` wrapper (`src/pages/Reports.tsx`)**

Replace the current minimal `ScenarioAnnotation` (tiny text below dashboard) with the new `DashboardContextCard` rendered ABOVE the dashboard. The card pulls data from the enriched `dashboardConfigs` and `getDashboardScenarioTitles`.

### What This Does NOT Change

- No new pages or routes
- No database changes
- No edge function changes
- Dashboard visualization components themselves are untouched
- Dashboard mappings (which scenarios use which dashboards) stay the same

### Technical Details

```text
Files Modified: 2
  1. src/lib/dashboard-mappings.ts
     - Extend DashboardConfig interface with keyMetrics, whenToUse, questionsAnswered
     - Populate all 14 dashboard configs with CFO-oriented content

  2. src/pages/Reports.tsx
     - Add "Guide Me" category cards section (5 decision categories)
     - Add scenario count badges to tab triggers
     - Replace DashboardWithAnnotation to render context card ABOVE dashboard
     - Import and use new DashboardContextCard component

Files Created: 1
  3. src/components/reports/DashboardContextCard.tsx
     - Renders enriched metadata: whenToUse, keyMetrics, questionsAnswered
     - Renders scenario list as badges
     - Responsive layout (collapsible on mobile)

Files Removed: 0

No dependency changes.
```

