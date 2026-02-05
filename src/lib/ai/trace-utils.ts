/**
 * Tracing Utilities for EXOS Pipeline
 * 
 * Provides helper functions to wrap step execution with LangSmith tracing.
 * Uses the langsmith-client for REST API communication.
 */

import { createRun, patchRun, isTracingEnabled } from "./langsmith-client";

export interface TraceStepResult<T> {
  result: T;
  runId: string;
}

/**
 * Wrap a step function with tracing instrumentation
 * 
 * Creates a run before execution and patches it with outputs after.
 * Tracing failures are caught and logged, never blocking the pipeline.
 * 
 * @param stepName - Display name for the trace span
 * @param runType - Type of run (chain, llm, tool)
 * @param inputs - Input data to log
 * @param stepFn - The actual step function to execute
 * @param parentRunId - Optional parent run ID for hierarchical traces
 */
export async function traceStep<T>(
  stepName: string,
  runType: "chain" | "llm" | "tool",
  inputs: Record<string, unknown>,
  stepFn: () => T | Promise<T>,
  parentRunId?: string
): Promise<TraceStepResult<T>> {
  let runId = "";

  try {
    // Create the run (fire-and-forget internally)
    if (isTracingEnabled()) {
      runId = await createRun({
        name: stepName,
        run_type: runType,
        inputs,
        parent_run_id: parentRunId,
      });
    }

    // Execute the actual step
    const result = await Promise.resolve(stepFn());

    // Patch with outputs (fire-and-forget internally)
    if (runId) {
      patchRun(runId, {
        outputs: { result: typeof result === "object" ? result : { value: result } },
      });
    }

    return { result, runId };
  } catch (error) {
    // Patch with error info
    if (runId) {
      patchRun(runId, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}

/**
 * Create a parent trace span for the entire pipeline
 * 
 * @param pipelineName - Name of the pipeline
 * @param inputs - Initial inputs
 * @returns The parent run ID
 */
export async function startPipelineTrace(
  pipelineName: string,
  inputs: Record<string, unknown>
): Promise<string> {
  if (!isTracingEnabled()) {
    return "";
  }

  return createRun({
    name: pipelineName,
    run_type: "chain",
    inputs,
    tags: ["exos", "pipeline"],
  });
}

/**
 * Complete the parent pipeline trace
 * 
 * @param runId - The parent run ID
 * @param outputs - Final outputs from the pipeline
 * @param error - Optional error if pipeline failed
 */
export async function endPipelineTrace(
  runId: string,
  outputs: Record<string, unknown>,
  error?: string
): Promise<void> {
  if (!runId) {
    return;
  }

  patchRun(runId, { outputs, error });
}
