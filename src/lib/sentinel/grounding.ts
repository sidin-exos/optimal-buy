/**
 * EXOS Sentinel - Private Knowledge Grounding
 * 
 * Component 2: Internal Injection
 * Enriches anonymized prompts with domain-specific context.
 * 
 * NOTE: Real grounding (historical cases, benchmarks, market intelligence)
 * is handled SERVER-SIDE in the sentinel-analysis edge function.
 * This module provides:
 * - XML preview generation for client-side UI components
 * - Context metadata for logging/debugging
 * - Type-safe grounding configuration
 */

import type {
  GroundingContext,
  GroundingConfig,
} from './types';
import type { IndustryContext, ProcurementCategory } from '../ai-context-templates';
import {
  generateIndustryContextXML,
  generateCategoryContextXML,
  generateFullContextXML,
} from '../ai-context-templates';

/**
 * Default grounding configuration
 */
export const DEFAULT_GROUNDING_CONFIG: GroundingConfig = {
  maxVectors: 5,
  minRelevanceScore: 0.7,
  includeHistorical: true,
  includeBenchmarks: true,
};

/**
 * Build grounding context from industry and category data.
 * Historical cases and benchmarks are injected server-side in the edge function.
 */
export function buildGroundingContext(
  industry: IndustryContext | null,
  category: ProcurementCategory | null,
  _scenarioType: string,
  _config: Partial<GroundingConfig> = {}
): GroundingContext {
  // Grounding is handled server-side in the sentinel-analysis edge function.
  // The edge function fetches market_insights, industry_contexts, and
  // procurement_categories from the database and injects them into the prompt.
  return {
    industryContext: industry ? generateIndustryContextXML(industry) : null,
    categoryContext: category ? generateCategoryContextXML(category) : null,
    historicalCases: [],
    benchmarks: [],
  };
}

/**
 * Generate grounded XML prompt for client-side preview.
 * Real grounding data (market intelligence, benchmarks) is injected server-side.
 */
export function generateGroundedPrompt(
  anonymizedInput: string,
  scenarioType: string,
  scenarioData: Record<string, string>,
  industry: IndustryContext | null,
  category: ProcurementCategory | null,
  _config: Partial<GroundingConfig> = {}
): string {
  const parts: string[] = [];
  
  parts.push('<grounded-analysis-request>');
  parts.push('');
  
  // Add core context from XML templates
  parts.push(generateFullContextXML(industry, category, scenarioData, scenarioType));
  parts.push('');
  
  // Server-side grounding placeholder
  parts.push('<server-side-grounding>');
  parts.push('  Enterprise context, benchmarks, and market insights are securely injected at the Edge layer.');
  parts.push('  This includes: industry constraints, category KPIs, market intelligence (key trends, risk signals, opportunities),');
  parts.push('  and historical procurement case data when available.');
  parts.push('</server-side-grounding>');
  parts.push('');
  
  // Add the anonymized user input
  parts.push('<anonymized-user-query>');
  parts.push(`  ${anonymizedInput}`);
  parts.push('</anonymized-user-query>');
  parts.push('');
  
  // Add LLM configuration settings
  parts.push('<llm-configuration>');
  parts.push('  <!-- Precision Mode: Low temperature for factual, consistent outputs -->');
  parts.push('  <temperature value="0.2" mode="precise">');
  parts.push('    Minimize creativity and speculation. Prioritize factual accuracy.');
  parts.push('  </temperature>');
  parts.push('');
  parts.push('  <!-- Chain-of-Experts Protocol: Multi-agent validation loop -->');
  parts.push('  <chain-of-experts mode="sequential-validation">');
  parts.push('    <expert role="Auditor" order="1">');
  parts.push('      Verify data accuracy, check for inconsistencies, flag missing information');
  parts.push('    </expert>');
  parts.push('    <expert role="Optimizer" order="2">');
  parts.push('      Identify savings opportunities, suggest efficiency improvements, quantify impact');
  parts.push('    </expert>');
  parts.push('    <expert role="Strategist" order="3">');
  parts.push('      Develop negotiation strategy, assess risks, prioritize recommendations');
  parts.push('    </expert>');
  parts.push('    <expert role="Validator" order="4">');
  parts.push('      Cross-check recommendations against benchmarks, ensure logical consistency');
  parts.push('    </expert>');
  parts.push('    <loop-back trigger="inconsistency-detected" target="Auditor" />');
  parts.push('  </chain-of-experts>');
  parts.push('');
  parts.push('  <!-- Anti-Hallucination Safeguards -->');
  parts.push('  <anti-hallucination mode="strict">');
  parts.push('    <rule>Only cite specific data points from provided context</rule>');
  parts.push('    <rule>Flag uncertainty explicitly with confidence levels</rule>');
  parts.push('    <rule>Distinguish between facts and inferences</rule>');
  parts.push('    <rule>Reject requests requiring external knowledge not provided</rule>');
  parts.push('  </anti-hallucination>');
  parts.push('');
  parts.push('  <!-- Output Constraints -->');
  parts.push('  <output-constraints>');
  parts.push('    <quantitative-focus>Provide numerical estimates with ranges where applicable</quantitative-focus>');
  parts.push('    <conservative-assumptions>Err on cautious side for savings projections</conservative-assumptions>');
  parts.push('    <source-citation>Reference specific data points from input</source-citation>');
  parts.push('  </output-constraints>');
  parts.push('</llm-configuration>');
  parts.push('');
  
  // Add processing instructions
  parts.push('<processing-instructions>');
  parts.push('  <instruction>Analyze the query using provided industry and category context</instruction>');
  parts.push('  <instruction>Reference market intelligence when making recommendations</instruction>');
  parts.push('  <instruction>Quantify recommendations using provided benchmarks</instruction>');
  parts.push('  <instruction>Maintain all masked tokens exactly as provided (e.g., [SUPPLIER_A], [AMOUNT_B])</instruction>');
  parts.push('  <instruction>Do not attempt to guess or reveal masked information</instruction>');
  parts.push('  <instruction>Structure response with clear sections: Analysis, Recommendations, Risks, Next Steps</instruction>');
  parts.push('  <instruction>Apply Chain-of-Experts validation before finalizing output</instruction>');
  parts.push('</processing-instructions>');
  parts.push('');
  
  parts.push('</grounded-analysis-request>');
  
  return parts.join('\n');
}

/**
 * Extract grounding metadata for logging/debugging
 */
export function getGroundingMetadata(context: GroundingContext): Record<string, unknown> {
  return {
    hasIndustryContext: !!context.industryContext,
    hasCategoryContext: !!context.categoryContext,
    historicalCaseCount: context.historicalCases.length,
    benchmarkCount: context.benchmarks.length,
    avgHistoricalRelevance: context.historicalCases.length > 0
      ? context.historicalCases.reduce((sum, c) => sum + c.relevanceScore, 0) / context.historicalCases.length
      : 0,
    avgBenchmarkRelevance: context.benchmarks.length > 0
      ? context.benchmarks.reduce((sum, b) => sum + b.relevanceScore, 0) / context.benchmarks.length
      : 0,
    groundingMode: 'server-side',
  };
}
