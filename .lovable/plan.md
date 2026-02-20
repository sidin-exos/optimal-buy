

## Scenario-Focused Testing Workflow

### What Changes

The testing pipeline currently shows global stats across all scenarios. The user wants to focus testing on **one scenario at a time**, collect feedback per scenario per date, and use that feedback to gradually relax field strictness (structured -> raw).

### Current State

- `TestStatsCards` and `RefactoringBacklog` query **all** test_prompts/reports globally (no scenario filter)
- `LaunchTestBatch` generates one test case at a time but doesn't pass its selected scenario to the stats/backlog components
- Real data exists: 44 reports across 12 scenarios (e.g., supplier-review: 19, cost-breakdown: 5)
- Pipeline IQ tab uses mock data

### Architecture Change

```text
+---------------------------+
|  LaunchTestBatch          |
|  [Select Scenario] ------+-----> scenarioId (lifted to parent)
|  [Persona] [Entropy]     |
+---------------------------+
             |
             v (scenarioId prop)
+---------------------------+       +---------------------------+
|  TestStatsCards            |       |  RefactoringBacklog       |
|  Filtered by scenarioId   |       |  Filtered by scenarioId   |
|  Shows: prompts, reports, |       |  Shows: field verdicts,   |
|  success rate, avg time   |       |  schema gaps for THIS     |
|  for THIS scenario only   |       |  scenario only             |
+---------------------------+       +---------------------------+
             |
             v
+---------------------------+
|  Test Session Log         |
|  Groups runs by date      |
|  "Export Feedback" button  |
|  Downloads JSON per date  |
+---------------------------+
```

### Files to Modify

**1. `src/pages/TestingPipeline.tsx`**
- Lift `scenarioId` state from `LaunchTestBatch` to the page level
- Pass `scenarioId` down to `LaunchTestBatch`, `RefactoringBacklog`, and a new `TestSessionLog` component
- Show a scenario filter banner in the Command Center tab: "Focusing on: {scenario name}"

**2. `src/components/testing/LaunchTestBatch.tsx`**
- Accept `scenarioId` and `onScenarioChange` as props instead of owning the state internally
- Remove local `scenarioId` state; use the prop

**3. `src/hooks/useTestDatabase.ts`**
- Add a new hook: `useTestStatsByScenario(scenarioType: string)` that filters both `test_prompts` and `test_reports` by the selected scenario
- Update `useTestPromptsByScenario` to be the primary data source for the command center

**4. `src/components/testing/TestStatsCards.tsx`**
- Accept an optional `scenarioType` prop
- When provided, use `useTestStatsByScenario(scenarioType)` instead of `useTestStats()`
- Cards will show stats scoped to the selected scenario

**5. `src/components/testing/RefactoringBacklog.tsx`**
- Accept an optional `scenarioType` prop
- When provided, use `useTestPromptsByScenario(scenarioType)` instead of `useTestPrompts(100)`
- Field verdicts and schema gaps will be scoped to the selected scenario

**6. New file: `src/components/testing/TestSessionLog.tsx`**
- Displays test runs for the selected scenario, grouped by date (YYYY-MM-DD)
- Each date group shows: number of runs, success/fail count, persona distribution
- "Export Feedback" button per date group: downloads a JSON file named `{scenario}_{date}.json` containing:
  - Scenario type and date
  - All prompts and their reports (including shadow_log field evaluations)
  - Aggregated field verdicts for that date
  - Strategic context note: "Goal: gradually increase raw field flexibility"
- This JSON file is the "one scenario, one file per date" artifact for external AI consultation

### Testing Workflow (User-Facing)

1. Select a scenario in the Command Center (e.g., "Supplier Review")
2. Stats and backlog instantly filter to show only that scenario's data
3. Launch test batches with different personas/entropy levels
4. View the Session Log grouped by date
5. Click "Export Feedback" to download a JSON file for that date
6. Take the JSON to an external AI for field structure recommendations
7. Apply recommendations gradually: move fields from "Required" to "Optional" to "Raw textarea"

### No Database Changes Needed
All data is already in `test_prompts` and `test_reports`. We just need to filter by `scenario_type`.

