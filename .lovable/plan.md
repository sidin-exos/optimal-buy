

# Client-Side LangSmith Tracing Implementation

## Overview

Add client-side LangSmith tracing to the EXOS pipeline (`src/lib/ai/graph.ts`) to enable visualization of the 4-step execution flow in the LangSmith EU dashboard. This uses the `langsmith` SDK's `traceable` function to wrap each pipeline step.

---

## Prerequisites (User Action Required)

Before this feature will work, you need to add these secrets in Lovable Cloud:

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `VITE_LANGCHAIN_TRACING_V2` | `true` | Enable tracing |
| `VITE_LANGCHAIN_API_KEY` | `lsv2_...` | Your LangSmith API key |
| `VITE_LANGCHAIN_PROJECT` | `exos-mvp` | Project name in LangSmith |
| `VITE_LANGCHAIN_ENDPOINT` | `https://eu.api.smith.langchain.com` | EU endpoint |

**Security Note:** Exposing the API key to the browser is acceptable for internal/development use. For production, tracing should move server-side.

---

## Files to Create

### 1. Tracing Configuration Module
**File:** `src/lib/ai/tracing-config.ts`

Creates a centralized module for:
- Reading Vite environment variables
- Checking if tracing is enabled
- Providing project name for trace spans
- Logging configuration on initialization

```typescript
// Read config from Vite env vars
const TRACING_ENABLED = import.meta.env.VITE_LANGCHAIN_TRACING_V2 === "true";
const API_KEY = import.meta.env.VITE_LANGCHAIN_API_KEY || "";
const PROJECT = import.meta.env.VITE_LANGCHAIN_PROJECT || "default";
const ENDPOINT = import.meta.env.VITE_LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com";

export function isTracingEnabled(): boolean { ... }
export function getProjectName(): string { ... }
export function logTracingConfig(): void { ... }
```

---

## Files to Modify

### 1. Type Definitions
**File:** `src/vite-env.d.ts`

Add TypeScript declarations for the new environment variables:

```typescript
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_LANGCHAIN_TRACING_V2?: string;
  readonly VITE_LANGCHAIN_API_KEY?: string;
  readonly VITE_LANGCHAIN_PROJECT?: string;
  readonly VITE_LANGCHAIN_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 2. Pipeline Orchestrator
**File:** `src/lib/ai/graph.ts`

Wrap each pipeline step with `traceable` to create hierarchical traces:

| Step Function | Trace Name | Run Type |
|---------------|------------|----------|
| `stepAnonymize` | `Sentinel_Anonymize` | chain |
| `stepReasoning` | `AI_Reasoning` | llm |
| `stepValidate` | `Validation_Check` | chain |
| `stepDeanonymize` | `Deanonymize` | chain |
| `runExosGraph` | `EXOS_Deep_Analysis` | chain (parent) |

**Changes:**
1. Import `traceable` from `langsmith/traceable`
2. Import helpers from `./tracing-config`
3. Create wrapped versions of each step function
4. Conditionally use traced vs raw functions based on `isTracingEnabled()`

### 3. Package Dependencies
**File:** `package.json`

Add the `langsmith` package to dependencies:

```json
"langsmith": "^0.2.0"
```

---

## Expected Trace Structure in LangSmith

```text
EXOS_Deep_Analysis (parent chain)
├── Sentinel_Anonymize (chain)
├── AI_Reasoning (llm) - attempt 1
├── Validation_Check (chain) - attempt 1
├── AI_Reasoning (llm) - attempt 2 (if retry)
├── Validation_Check (chain) - attempt 2 (if retry)
└── Deanonymize (chain)
```

---

## Implementation Details

### Tracing Config Module

```typescript
// src/lib/ai/tracing-config.ts

const TRACING_ENABLED = import.meta.env.VITE_LANGCHAIN_TRACING_V2 === "true";
const API_KEY = import.meta.env.VITE_LANGCHAIN_API_KEY || "";
const PROJECT = import.meta.env.VITE_LANGCHAIN_PROJECT || "default";
const ENDPOINT = import.meta.env.VITE_LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com";

export function isTracingEnabled(): boolean {
  return TRACING_ENABLED && !!API_KEY;
}

export function getProjectName(): string {
  return PROJECT;
}

export function logTracingConfig(): void {
  console.log("LangSmith Tracing Config:", {
    enabled: TRACING_ENABLED,
    project: PROJECT,
    endpoint: ENDPOINT,
    hasApiKey: !!API_KEY,
  });
}

// Log on module load for debugging
if (TRACING_ENABLED) {
  logTracingConfig();
}
```

### Graph Instrumentation Pattern

```typescript
// src/lib/ai/graph.ts (additions)

import { traceable } from "langsmith/traceable";
import { isTracingEnabled, getProjectName, logTracingConfig } from "./tracing-config";

// Create traced wrappers (lazy evaluation)
const createTracedAnonymize = () => traceable(stepAnonymize, {
  name: "Sentinel_Anonymize",
  run_type: "chain",
  project_name: getProjectName(),
});

const createTracedReasoning = () => traceable(stepReasoning, {
  name: "AI_Reasoning", 
  run_type: "llm",
  project_name: getProjectName(),
});

const createTracedValidate = () => traceable(stepValidate, {
  name: "Validation_Check",
  run_type: "chain",
  project_name: getProjectName(),
});

const createTracedDeanonymize = () => traceable(stepDeanonymize, {
  name: "Deanonymize",
  run_type: "chain",
  project_name: getProjectName(),
});

// In runExosGraph:
export async function runExosGraph(...) {
  logTracingConfig();
  
  const useTracing = isTracingEnabled();
  
  // Select function versions
  const doAnonymize = useTracing ? createTracedAnonymize() : stepAnonymize;
  const doReasoning = useTracing ? createTracedReasoning() : stepReasoning;
  const doValidate = useTracing ? createTracedValidate() : stepValidate;
  const doDeanonymize = useTracing ? createTracedDeanonymize() : stepDeanonymize;
  
  // Use these in the pipeline...
}

// Optionally wrap the entire function
export const runExosGraph = traceable(async (...) => { ... }, {
  name: "EXOS_Deep_Analysis",
  run_type: "chain",
  project_name: getProjectName(),
});
```

---

## Verification Steps

1. Add the required secrets in Lovable Cloud
2. Refresh the application
3. Open browser console and check for: `LangSmith Tracing Config: { enabled: true, ... }`
4. Trigger a "Deep Analysis" run from the scenario wizard
5. Navigate to [eu.smith.langchain.com](https://eu.smith.langchain.com)
6. View the `exos-mvp` project to see traces

---

## Technical Summary

| Item | Details |
|------|---------|
| New dependency | `langsmith` |
| New file | 1 (`src/lib/ai/tracing-config.ts`) |
| Modified files | 3 (`graph.ts`, `vite-env.d.ts`, `package.json`) |
| Trace spans | 5 (1 parent + 4 steps) |
| Run types | `chain` (orchestration), `llm` (AI reasoning) |

