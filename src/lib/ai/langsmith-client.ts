/**
 * Browser-compatible LangSmith REST Client
 * 
 * Uses native fetch() to send traces to LangSmith API.
 * No external dependencies - avoids AsyncLocalStorage issues.
 */

// Read config from Vite env vars
const TRACING_ENABLED = import.meta.env.VITE_LANGCHAIN_TRACING_V2 === "true";
const API_KEY = import.meta.env.VITE_LANGCHAIN_API_KEY || "";
const PROJECT = import.meta.env.VITE_LANGCHAIN_PROJECT || "default";
const ENDPOINT = import.meta.env.VITE_LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com";

export interface CreateRunOptions {
  name: string;
  run_type: "chain" | "llm" | "tool";
  inputs: Record<string, unknown>;
  parent_run_id?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface PatchRunOptions {
  outputs?: Record<string, unknown>;
  error?: string;
  end_time?: string;
}

/**
 * Check if LangSmith tracing is enabled
 */
export function isTracingEnabled(): boolean {
  return TRACING_ENABLED && !!API_KEY;
}

/**
 * Get the configured project name
 */
export function getProjectName(): string {
  return PROJECT;
}

/**
 * Log the current tracing configuration (for debugging)
 */
export function logTracingConfig(): void {
  console.log("🔍 LangSmith Tracing Config:", {
    enabled: TRACING_ENABLED,
    project: PROJECT,
    endpoint: ENDPOINT,
    hasApiKey: !!API_KEY,
  });
}

/**
 * Create a new run (span) in LangSmith
 * 
 * @param options - Run configuration
 * @returns The generated run ID
 */
export async function createRun(options: CreateRunOptions): Promise<string> {
  if (!isTracingEnabled()) {
    return "";
  }

  const runId = crypto.randomUUID();
  const startTime = new Date().toISOString();

  const payload = {
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

  // Fire-and-forget: don't await, don't block the pipeline
  fetch(`${ENDPOINT}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn("🔍 LangSmith: Failed to create run", options.name, err);
  });

  return runId;
}

/**
 * Complete a run with outputs or error
 * 
 * @param runId - The run ID to patch
 * @param options - Outputs and/or error information
 */
export async function patchRun(runId: string, options: PatchRunOptions): Promise<void> {
  if (!isTracingEnabled() || !runId) {
    return;
  }

  const endTime = options.end_time || new Date().toISOString();

  const payload = {
    outputs: options.outputs,
    error: options.error,
    end_time: endTime,
  };

  // Fire-and-forget: don't await, don't block the pipeline
  fetch(`${ENDPOINT}/runs/${runId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn("🔍 LangSmith: Failed to patch run", runId, err);
  });
}
