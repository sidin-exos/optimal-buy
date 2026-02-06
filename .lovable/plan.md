

# Refactor: Harden LangSmith Client for Production

## Overview

Refactor `src/lib/ai/langsmith-client.ts` to be enterprise-grade with exponential backoff retry logic, strict TypeScript typing, and robust error handling—all while maintaining the fire-and-forget pattern and using only native browser APIs.

---

## Current State

The existing client has:
- Basic fire-and-forget pattern with simple `.catch()` blocks
- Loose typing for run_type (only `"chain" | "llm" | "tool"`)
- No retry logic for transient failures
- Simple `fetch` calls that fail immediately on any error

---

## Changes to Implement

### 1. Strict Type Definitions

Add complete interfaces matching the LangSmith REST API contract:

| Interface | Purpose |
|-----------|---------|
| `RunType` | Full set of run types: chain, llm, tool, retriever, embedding, parser |
| `CreateRunPayload` | Strict contract for POST /runs request body |
| `UpdateRunPayload` | Strict contract for PATCH /runs/{id} request body |
| `RetryConfig` | Configuration for retry behavior |

### 2. Native Retry Utilities

Implement using only native `fetch` and `setTimeout`:

```text
┌─────────────────────────────────────────────────────────────┐
│  sleep(ms)           │ Promise wrapper for setTimeout       │
├─────────────────────────────────────────────────────────────┤
│  isRetryableStatus() │ Returns true for 429 and 5xx        │
├─────────────────────────────────────────────────────────────┤
│  fetchWithRetry()    │ Retry loop with exponential backoff │
└─────────────────────────────────────────────────────────────┘
```

**Default Configuration:**
- `maxRetries`: 3
- `baseDelayMs`: 100ms
- `backoffFactor`: 2

**Delay Sequence:** 100ms → 200ms → 400ms

### 3. Retry Logic Behavior

| HTTP Status | Action |
|-------------|--------|
| 2xx (Success) | Return immediately |
| 400, 401, 403, 404 | Log warning, do NOT retry (client error) |
| 429 (Rate Limited) | Retry with backoff |
| 5xx (Server Error) | Retry with backoff |
| Network Error | Retry with backoff |
| All retries exhausted | Throw error to caller |

### 4. Updated Function Signatures

**`createRun(options: CreateRunOptions): Promise<string>`**
- Uses `CreateRunPayload` for strict typing
- Calls `fetchWithRetry()` with fire-and-forget `.catch()` wrapper
- Returns run ID immediately (non-blocking)

**`patchRun(runId: string, options: PatchRunOptions): Promise<void>`**
- Uses `UpdateRunPayload` for strict typing
- Calls `fetchWithRetry()` with fire-and-forget `.catch()` wrapper
- Silently handles all failures

---

## Implementation Details

### Type Definitions

```typescript
/** LangSmith API run types */
type RunType = "chain" | "llm" | "tool" | "retriever" | "embedding" | "parser";

/** Payload for POST /runs */
interface CreateRunPayload {
  id: string;
  name: string;
  run_type: RunType;
  inputs: Record<string, unknown>;
  start_time: string;
  session_name: string;
  parent_run_id?: string;
  tags?: string[];
  extra?: {
    metadata?: Record<string, unknown>;
  };
}

/** Payload for PATCH /runs/{id} */
interface UpdateRunPayload {
  outputs?: Record<string, unknown>;
  error?: string;
  end_time: string;
}

/** Retry configuration */
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  backoffFactor: number;
}
```

### Retry Function

```typescript
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  backoffFactor: 2,
};

const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const isRetryableStatus = (status: number): boolean => 
  status === 429 || (status >= 500 && status < 600);

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      if (!isRetryableStatus(response.status)) {
        // Non-retryable client error (4xx except 429)
        return response;
      }

      // Retryable error - calculate delay and wait
      if (attempt < config.maxRetries - 1) {
        const delay = config.baseDelayMs * Math.pow(config.backoffFactor, attempt);
        console.warn(`🔍 LangSmith: HTTP ${response.status}, retry ${attempt + 1}/${config.maxRetries} in ${delay}ms`);
        await sleep(delay);
      }
    } catch (err) {
      // Network error
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < config.maxRetries - 1) {
        const delay = config.baseDelayMs * Math.pow(config.backoffFactor, attempt);
        console.warn(`🔍 LangSmith: Network error, retry ${attempt + 1}/${config.maxRetries} in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError ?? new Error("LangSmith: All retries exhausted");
}
```

### Updated createRun

```typescript
export async function createRun(options: CreateRunOptions): Promise<string> {
  if (!isTracingEnabled()) {
    return "";
  }

  const runId = crypto.randomUUID();
  const startTime = new Date().toISOString();

  const payload: CreateRunPayload = {
    id: runId,
    name: options.name,
    run_type: options.run_type,
    inputs: options.inputs,
    start_time: startTime,
    session_name: PROJECT,
    parent_run_id: options.parent_run_id,
    tags: options.tags,
    extra: options.metadata ? { metadata: options.metadata } : undefined,
  };

  // Fire-and-forget with retry logic - never blocks pipeline
  fetchWithRetry(
    `${ENDPOINT}/runs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    }
  ).catch((err) => {
    console.warn("🔍 LangSmith: Failed to create run after retries", options.name, err);
  });

  return runId;
}
```

### Updated patchRun

```typescript
export async function patchRun(runId: string, options: PatchRunOptions): Promise<void> {
  if (!isTracingEnabled() || !runId) {
    return;
  }

  const payload: UpdateRunPayload = {
    outputs: options.outputs,
    error: options.error,
    end_time: options.end_time || new Date().toISOString(),
  };

  // Fire-and-forget with retry logic - never blocks pipeline
  fetchWithRetry(
    `${ENDPOINT}/runs/${runId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    }
  ).catch((err) => {
    console.warn("🔍 LangSmith: Failed to patch run after retries", runId, err);
  });
}
```

---

## Safety Guarantees

| Scenario | Behavior |
|----------|----------|
| API returns 429 (rate limited) | Retry with backoff up to 3 times |
| API returns 503 (service unavailable) | Retry with backoff up to 3 times |
| API returns 400/401/403 (client error) | Log warning, don't retry |
| Network timeout/offline | Retry with backoff, then log warning |
| All retries exhausted | Log warning to console, never throws to UI |
| Invalid run ID passed | Early return, no network call |
| Tracing disabled | Early return, no network call |

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/lib/ai/langsmith-client.ts` | Modify | Add strict types, exponential backoff utility, update createRun/patchRun |

No new files required. No changes to `trace-utils.ts` needed.

---

## Verification Steps

1. Run a Deep Analysis scenario
2. Open DevTools Console
3. Confirm tracing config is logged
4. Optionally throttle network in DevTools to simulate instability
5. Verify retry warnings appear in console (not errors)
6. Verify pipeline completes successfully
7. Check LangSmith dashboard for traces

