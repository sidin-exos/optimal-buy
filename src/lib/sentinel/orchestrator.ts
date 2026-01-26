/**
 * EXOS Sentinel - Backend Orchestrator
 * 
 * Central coordinator for the Local Intelligence Layer.
 * Routes requests through anonymization, grounding, inference,
 * validation, and de-anonymization stages.
 */

import type {
  OrchestratorRequest,
  OrchestratorResponse,
  PipelineStageResult,
  PipelineConfig,
  SensitiveEntity,
} from './types';
import type { IndustryContext, ProcurementCategory } from '../ai-context-templates';
import { anonymize, DEFAULT_ANONYMIZATION_CONFIG } from './anonymizer';
import { generateGroundedPrompt, DEFAULT_GROUNDING_CONFIG } from './grounding';
import { validateResponse, getValidationSummary } from './validator';
import { deanonymize, formatWithHighlights } from './deanonymizer';

/**
 * Default pipeline configuration
 */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  enableAnonymization: true,
  enableGrounding: true,
  enableValidation: true,
  useLocalModel: false, // Set to true when Mistral is available
  localModelEndpoint: undefined,
  cloudModel: 'google/gemini-3-flash-preview',
  validationThreshold: 0.6,
};

/**
 * Pipeline execution context - tracks state across stages
 */
interface PipelineContext {
  originalInput: string;
  anonymizedInput: string;
  entityMap: Map<string, SensitiveEntity>;
  groundedPrompt: string;
  aiResponse: string;
  validatedResponse: string;
  finalOutput: string;
  stages: PipelineStageResult[];
  startTime: number;
}

/**
 * Create initial pipeline context
 */
function createContext(request: OrchestratorRequest): PipelineContext {
  // Build the raw input from scenario data
  const rawInput = Object.entries(request.scenarioData)
    .filter(([, value]) => value && value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  return {
    originalInput: rawInput || request.rawInput,
    anonymizedInput: '',
    entityMap: new Map(),
    groundedPrompt: '',
    aiResponse: '',
    validatedResponse: '',
    finalOutput: '',
    stages: [],
    startTime: performance.now(),
  };
}

/**
 * Execute Stage 1: Semantic Anonymization
 */
function executeAnonymization(
  context: PipelineContext,
  config: PipelineConfig
): PipelineStageResult {
  const stageStart = performance.now();
  
  if (!config.enableAnonymization) {
    context.anonymizedInput = context.originalInput;
    return {
      stage: 'anonymization',
      status: 'skipped',
      timeMs: 0,
      details: { reason: 'Anonymization disabled in config' },
    };
  }
  
  try {
    const result = anonymize(context.originalInput, DEFAULT_ANONYMIZATION_CONFIG);
    context.anonymizedInput = result.anonymizedText;
    context.entityMap = result.entityMap;
    
    return {
      stage: 'anonymization',
      status: 'success',
      timeMs: performance.now() - stageStart,
      details: {
        entitiesFound: result.metadata.entitiesFound,
        confidence: result.metadata.confidence,
      },
    };
  } catch (error) {
    context.anonymizedInput = context.originalInput;
    return {
      stage: 'anonymization',
      status: 'error',
      timeMs: performance.now() - stageStart,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * Execute Stage 2: Knowledge Grounding
 */
function executeGrounding(
  context: PipelineContext,
  request: OrchestratorRequest,
  industry: IndustryContext | null,
  category: ProcurementCategory | null,
  config: PipelineConfig
): PipelineStageResult {
  const stageStart = performance.now();
  
  if (!config.enableGrounding) {
    context.groundedPrompt = context.anonymizedInput;
    return {
      stage: 'grounding',
      status: 'skipped',
      timeMs: 0,
      details: { reason: 'Grounding disabled in config' },
    };
  }
  
  try {
    context.groundedPrompt = generateGroundedPrompt(
      context.anonymizedInput,
      request.scenarioType,
      request.scenarioData,
      industry,
      category,
      DEFAULT_GROUNDING_CONFIG
    );
    
    return {
      stage: 'grounding',
      status: 'success',
      timeMs: performance.now() - stageStart,
      details: {
        promptLength: context.groundedPrompt.length,
        hasIndustryContext: !!industry,
        hasCategoryContext: !!category,
      },
    };
  } catch (error) {
    context.groundedPrompt = context.anonymizedInput;
    return {
      stage: 'grounding',
      status: 'error',
      timeMs: performance.now() - stageStart,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * Execute Stage 3: Cloud/Local Inference
 * This is a placeholder - actual inference happens in edge function
 */
function prepareInferencePayload(
  context: PipelineContext,
  config: PipelineConfig
): { systemPrompt: string; userPrompt: string; model: string; useLocal: boolean } {
  const systemPrompt = `You are an expert procurement analyst. Analyze the provided context and generate actionable recommendations.

IMPORTANT RULES:
1. Maintain all masked tokens exactly as provided (e.g., [SUPPLIER_A], [AMOUNT_B])
2. Do not attempt to guess or reveal masked information
3. Base recommendations on the provided industry/category context and benchmarks
4. Structure your response with clear sections: Analysis, Recommendations, Risks, Next Steps
5. Quantify recommendations with specific percentages or ranges when possible`;

  return {
    systemPrompt,
    userPrompt: context.groundedPrompt,
    model: config.cloudModel,
    useLocal: config.useLocalModel,
  };
}

/**
 * Execute Stage 5: Validation
 */
function executeValidation(
  context: PipelineContext,
  request: OrchestratorRequest,
  config: PipelineConfig
): PipelineStageResult {
  const stageStart = performance.now();
  
  if (!config.enableValidation) {
    context.validatedResponse = context.aiResponse;
    return {
      stage: 'validation',
      status: 'skipped',
      timeMs: 0,
      details: { reason: 'Validation disabled in config' },
    };
  }
  
  try {
    const maskedTokens = Array.from(context.entityMap.keys());
    const result = validateResponse(
      context.aiResponse,
      context.anonymizedInput,
      request.scenarioType,
      maskedTokens
    );
    
    context.validatedResponse = context.aiResponse;
    
    const status = result.passed 
      ? 'success' 
      : result.issues.some(i => i.severity === 'critical')
        ? 'error'
        : 'warning';
    
    return {
      stage: 'validation',
      status,
      timeMs: performance.now() - stageStart,
      details: {
        passed: result.passed,
        confidenceScore: result.confidenceScore,
        issueCount: result.issues.length,
        summary: getValidationSummary(result),
      },
    };
  } catch (error) {
    context.validatedResponse = context.aiResponse;
    return {
      stage: 'validation',
      status: 'error',
      timeMs: performance.now() - stageStart,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * Execute Stage 6: De-anonymization
 */
function executeDeanonymization(
  context: PipelineContext,
  config: PipelineConfig
): PipelineStageResult {
  const stageStart = performance.now();
  
  if (!config.enableAnonymization) {
    context.finalOutput = context.validatedResponse;
    return {
      stage: 'deanonymization',
      status: 'skipped',
      timeMs: 0,
      details: { reason: 'Anonymization was not enabled' },
    };
  }
  
  try {
    const result = deanonymize(context.validatedResponse, context.entityMap);
    context.finalOutput = result.restoredText;
    
    const status = result.metadata.unmappedTokens.length > 0 ? 'warning' : 'success';
    
    return {
      stage: 'deanonymization',
      status,
      timeMs: performance.now() - stageStart,
      details: {
        entitiesRestored: result.metadata.entitiesRestored,
        unmappedTokens: result.metadata.unmappedTokens,
      },
    };
  } catch (error) {
    context.finalOutput = context.validatedResponse;
    return {
      stage: 'deanonymization',
      status: 'error',
      timeMs: performance.now() - stageStart,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * Prepare pipeline request for edge function
 * Returns the data needed to call the AI and complete the pipeline
 */
export function preparePipelineRequest(
  request: OrchestratorRequest,
  industry: IndustryContext | null,
  category: ProcurementCategory | null
): {
  context: PipelineContext;
  inferencePayload: ReturnType<typeof prepareInferencePayload>;
  config: PipelineConfig;
} {
  const config = { ...DEFAULT_PIPELINE_CONFIG, ...request.config };
  const context = createContext(request);
  
  // Execute pre-inference stages
  const anonymizationResult = executeAnonymization(context, config);
  context.stages.push(anonymizationResult);
  
  const groundingResult = executeGrounding(context, request, industry, category, config);
  context.stages.push(groundingResult);
  
  const inferencePayload = prepareInferencePayload(context, config);
  
  return { context, inferencePayload, config };
}

/**
 * Complete pipeline after AI response
 * Called with the AI response to finish validation and de-anonymization
 */
export function completePipeline(
  context: PipelineContext,
  aiResponse: string,
  request: OrchestratorRequest,
  config: PipelineConfig
): OrchestratorResponse {
  context.aiResponse = aiResponse;
  
  // Record inference stage (time tracked by caller)
  context.stages.push({
    stage: 'cloud_inference',
    status: 'success',
    timeMs: 0, // Filled by caller
    details: { model: config.cloudModel },
  });
  
  // Execute post-inference stages
  const validationResult = executeValidation(context, request, config);
  context.stages.push(validationResult);
  
  const deanonymizationResult = executeDeanonymization(context, config);
  context.stages.push(deanonymizationResult);
  
  const totalTimeMs = performance.now() - context.startTime;
  const validationPassed = validationResult.status !== 'error';
  
  // Calculate overall confidence
  const confidenceScore = context.stages.reduce((score, stage) => {
    if (stage.status === 'error') return score * 0.5;
    if (stage.status === 'warning') return score * 0.8;
    return score;
  }, 1.0);
  
  // Collect warnings and errors
  const warnings: string[] = [];
  const errors: string[] = [];
  
  for (const stage of context.stages) {
    if (stage.status === 'warning' && stage.details) {
      warnings.push(`${stage.stage}: ${JSON.stringify(stage.details)}`);
    }
    if (stage.status === 'error' && stage.details) {
      errors.push(`${stage.stage}: ${JSON.stringify(stage.details)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    result: context.finalOutput,
    metadata: {
      pipelineStages: context.stages,
      totalTimeMs,
      validationPassed,
      confidenceScore,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Get pipeline stage summary for logging/debugging
 */
export function getPipelineSummary(response: OrchestratorResponse): string {
  const stagesSummary = response.metadata.pipelineStages
    .map(s => `${s.stage}:${s.status}(${s.timeMs.toFixed(0)}ms)`)
    .join(' → ');
  
  return [
    `Pipeline ${response.success ? 'SUCCESS' : 'FAILED'}`,
    `Total: ${response.metadata.totalTimeMs.toFixed(0)}ms`,
    `Confidence: ${(response.metadata.confidenceScore * 100).toFixed(1)}%`,
    `Stages: ${stagesSummary}`,
  ].join(' | ');
}

/**
 * Export context serialization for edge function communication
 */
export function serializeContext(context: PipelineContext): string {
  return JSON.stringify({
    originalInput: context.originalInput,
    anonymizedInput: context.anonymizedInput,
    entityMap: Array.from(context.entityMap.entries()),
    groundedPrompt: context.groundedPrompt,
    stages: context.stages,
    startTime: context.startTime,
  });
}

/**
 * Deserialize context from edge function
 */
export function deserializeContext(serialized: string): PipelineContext {
  const data = JSON.parse(serialized);
  return {
    ...data,
    entityMap: new Map(data.entityMap),
    aiResponse: '',
    validatedResponse: '',
    finalOutput: '',
  };
}
