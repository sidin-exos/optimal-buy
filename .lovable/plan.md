

# Scenario Testing Threshold Alert (N=10)

## Overview
Add visual progress tracking and a threshold alert to the Testing Pipeline Command Center so the QA engineer knows exactly when a scenario has enough data (10+ test reports) to export for external AI audit.

## Changes

### 1. Progress Bar in TestStatsCards
**File: `src/components/testing/TestStatsCards.tsx`**

- Add a 6th visual element: a progress bar showing `X / 10` runs toward the audit threshold.
- Use the existing `stats.totalReports` from `useTestStats(scenarioType)`.
- Display using the existing `Progress` component (`src/components/ui/progress.tsx`) with a label like `"Audit Readiness: X / 10 runs"`.
- Clamp the progress value at 100% once threshold is met.
- Only render when a `scenarioType` is selected.

### 2. Threshold Alert Banner in Command Center
**File: `src/pages/TestingPipeline.tsx`**

- Import `useTestStats` and the `Alert` component.
- Inside the Command Center tab, after the "Focusing on" badge and before the grid, conditionally render a success-styled `Alert` when `stats.totalReports >= 10`.
- Message: "Ready for AI Audit: 10+ tests completed for this scenario. Export the JSON and share it with Gemini for meta-analysis."
- Use green/success styling (e.g., `border-green-500 bg-green-50 text-green-800`).

### 3. Highlighted Export Button in TestSessionLog
**File: `src/components/testing/TestSessionLog.tsx`**

- Accept a new optional prop `isThresholdReached?: boolean`.
- When `true`, apply a visual highlight to each "Export Feedback" button:
  - Switch variant from `outline` to `default` (primary color).
  - Add a small "Ready" `Badge` next to the button text.
  - Add a subtle pulse animation class (`animate-pulse` or a custom gentle glow).
- Pass `isThresholdReached` from `TestingPipeline.tsx` based on the stats check.

## Technical Details

- **No database changes required.** All data comes from the existing `useTestStats` hook which already filters by `scenarioType`.
- The `THRESHOLD` constant (10) will be defined once in `TestingPipeline.tsx` and passed down as needed.
- The `Progress` component from `@radix-ui/react-progress` is already installed and available at `src/components/ui/progress.tsx`.

