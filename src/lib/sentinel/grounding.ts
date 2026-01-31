/**
 * EXOS Sentinel - Private Knowledge Grounding
 * 
 * Component 2: Internal Injection
 * Enriches anonymized prompts with domain-specific context
 * from local vector/SQL databases without exposing sensitive data.
 */

import type {
  GroundingVector,
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
 * Mock historical cases for demonstration
 * In production, these would come from a vector database
 */
const MOCK_HISTORICAL_CASES: GroundingVector[] = [
  {
    id: 'hist_001',
    content: 'Volume consolidation across 5 suppliers achieved 18% cost reduction by leveraging combined purchasing power.',
    category: 'historical',
    relevanceScore: 0.92,
    metadata: { scenario: 'consolidation', savingsPercent: 18, supplierCount: 5 },
  },
  {
    id: 'hist_002',
    content: 'Dual-sourcing strategy mitigated supply risk while maintaining 95% service levels during disruption.',
    category: 'historical',
    relevanceScore: 0.88,
    metadata: { scenario: 'risk_mitigation', serviceLevel: 95 },
  },
  {
    id: 'hist_003',
    content: 'Early payment discount program generated 2.5% savings on $50M annual spend.',
    category: 'historical',
    relevanceScore: 0.85,
    metadata: { scenario: 'payment_terms', savingsPercent: 2.5 },
  },
];

/**
 * Mock benchmark data
 * In production, these would come from industry benchmark databases
 */
const MOCK_BENCHMARKS: GroundingVector[] = [
  {
    id: 'bench_001',
    content: 'Industry average for indirect procurement cost reduction through consolidation: 12-20%.',
    category: 'benchmark',
    relevanceScore: 0.95,
    metadata: { type: 'consolidation', rangeMin: 12, rangeMax: 20 },
  },
  {
    id: 'bench_002',
    content: 'Best-in-class supplier on-time delivery rate: 98.5%. Industry average: 94%.',
    category: 'benchmark',
    relevanceScore: 0.90,
    metadata: { type: 'performance', bestInClass: 98.5, average: 94 },
  },
  {
    id: 'bench_003',
    content: 'Typical negotiation leverage with 3+ competing suppliers: 8-15% price reduction.',
    category: 'benchmark',
    relevanceScore: 0.87,
    metadata: { type: 'negotiation', rangeMin: 8, rangeMax: 15 },
  },
];

/**
 * Simulate vector similarity search
 * In production, this would query a vector database like Pinecone, Weaviate, or pgvector
 */
function simulateVectorSearch(
  query: string,
  vectors: GroundingVector[],
  maxResults: number,
  minScore: number
): GroundingVector[] {
  // Simple keyword-based relevance simulation
  const queryKeywords = query.toLowerCase().split(/\s+/);
  
  const scored = vectors.map(vector => {
    const content = vector.content.toLowerCase();
    const matches = queryKeywords.filter(kw => content.includes(kw)).length;
    const adjustedScore = vector.relevanceScore * (0.5 + (matches / queryKeywords.length) * 0.5);
    return { ...vector, relevanceScore: adjustedScore };
  });
  
  return scored
    .filter(v => v.relevanceScore >= minScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Build grounding context from industry and category data
 */
export function buildGroundingContext(
  industry: IndustryContext | null,
  category: ProcurementCategory | null,
  scenarioType: string,
  config: Partial<GroundingConfig> = {}
): GroundingContext {
  const mergedConfig = { ...DEFAULT_GROUNDING_CONFIG, ...config };
  
  // Get relevant historical cases
  const historicalCases = mergedConfig.includeHistorical
    ? simulateVectorSearch(
        scenarioType,
        MOCK_HISTORICAL_CASES,
        mergedConfig.maxVectors,
        mergedConfig.minRelevanceScore
      )
    : [];
  
  // Get relevant benchmarks
  const benchmarks = mergedConfig.includeBenchmarks
    ? simulateVectorSearch(
        scenarioType,
        MOCK_BENCHMARKS,
        mergedConfig.maxVectors,
        mergedConfig.minRelevanceScore
      )
    : [];
  
  return {
    industryContext: industry ? generateIndustryContextXML(industry) : null,
    categoryContext: category ? generateCategoryContextXML(category) : null,
    historicalCases,
    benchmarks,
  };
}

/**
 * Generate grounded XML prompt with all context injected
 */
export function generateGroundedPrompt(
  anonymizedInput: string,
  scenarioType: string,
  scenarioData: Record<string, string>,
  industry: IndustryContext | null,
  category: ProcurementCategory | null,
  config: Partial<GroundingConfig> = {}
): string {
  const context = buildGroundingContext(industry, category, scenarioType, config);
  
  // Build the full grounded prompt
  const parts: string[] = [];
  
  parts.push('<grounded-analysis-request>');
  parts.push('');
  
  // Add core context from XML templates
  parts.push(generateFullContextXML(industry, category, scenarioData, scenarioType));
  parts.push('');
  
  // Add historical context
  if (context.historicalCases.length > 0) {
    parts.push('<historical-context>');
    parts.push('  <description>Relevant historical cases for reference. Use these to inform recommendations.</description>');
    for (const hist of context.historicalCases) {
      parts.push(`  <case id="${hist.id}" relevance="${hist.relevanceScore.toFixed(2)}">`);
      parts.push(`    ${hist.content}`);
      parts.push('  </case>');
    }
    parts.push('</historical-context>');
    parts.push('');
  }
  
  // Add benchmark context
  if (context.benchmarks.length > 0) {
    parts.push('<benchmark-context>');
    parts.push('  <description>Industry benchmarks for comparison. Reference these when quantifying recommendations.</description>');
    for (const bench of context.benchmarks) {
      parts.push(`  <benchmark id="${bench.id}" relevance="${bench.relevanceScore.toFixed(2)}">`);
      parts.push(`    ${bench.content}`);
      parts.push('  </benchmark>');
    }
    parts.push('</benchmark-context>');
    parts.push('');
  }
  
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
  parts.push('  <instruction>Reference historical cases when making recommendations</instruction>');
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
  };
}
