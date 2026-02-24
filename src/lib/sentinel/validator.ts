/**
 * EXOS Sentinel - Reasoning Integrity Validator
 * 
 * Component 5: The Internal Auditor
 * Validates AI responses for hallucinations, inconsistencies,
 * and unsafe content using regex-based structural checks.
 * 
 * NOTE: Golden case matching is a Phase 2 feature that will use
 * DB-backed golden cases. Currently returns empty matches.
 */

import type {
  ValidationResult,
  ValidationIssue,
  GoldenCaseMatch,
} from './types';

/**
 * Patterns that indicate potential hallucination
 */
const HALLUCINATION_INDICATORS = [
  /\b(definitely|certainly|absolutely|100%)\s+will\b/gi, // Overconfident predictions
  /\b(I remember|As I recall|From my knowledge)\b/gi, // False memory claims
  /\[SUPPLIER_[A-Z]\d*\]\s+(?:is|was|has been)\s+(?:founded|established|created)\b/gi, // Fabricating masked entity details
  /\b(exact|precise)\s+(?:figure|number|amount)\b/gi, // False precision claims
];

/**
 * Patterns that indicate unsafe content
 */
const UNSAFE_PATTERNS = [
  /\b(illegal|fraudulent|bribe|kickback)\b/gi,
  /\b(circumvent|bypass|ignore)\s+(?:compliance|regulations?|laws?)\b/gi,
  /\b(confidential|secret)\s+(?:information|data)\s+(?:leak|share|expose)\b/gi,
];

/**
 * Check if response maintains masked tokens
 */
function checkTokenIntegrity(
  originalTokens: string[],
  response: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (const token of originalTokens) {
    if (!response.includes(token)) {
      issues.push({
        type: 'inconsistency',
        severity: 'high',
        description: `Masked token ${token} is missing from response`,
        location: token,
        suggestion: `Ensure the response maintains the masked token ${token} without revealing the underlying value`,
      });
    }
  }
  
  // Check for potential token revelation (e.g., "SUPPLIER_A, which is Acme Corp")
  const revelationPattern = /\[([A-Z_]+_[A-Z]\d*)\][,\s]+(?:which is|i\.e\.|namely|specifically)\s+([^,.\n]+)/gi;
  let match;
  while ((match = revelationPattern.exec(response)) !== null) {
    issues.push({
      type: 'unsafe_content',
      severity: 'critical',
      description: `Potential reveal of masked entity: ${match[1]} appears to be associated with "${match[2]}"`,
      location: match[0],
      suggestion: 'Remove any attempts to reveal or guess masked entity values',
    });
  }
  
  return issues;
}

/**
 * Check for hallucination indicators
 */
function checkForHallucinations(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (const pattern of HALLUCINATION_INDICATORS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(response)) !== null) {
      issues.push({
        type: 'hallucination',
        severity: 'medium',
        description: `Potential hallucination indicator: "${match[0]}"`,
        location: match[0],
        suggestion: 'Consider softening language to reflect uncertainty appropriately',
      });
    }
  }
  
  return issues;
}

/**
 * Check for unsafe content
 */
function checkForUnsafeContent(response: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  for (const pattern of UNSAFE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(response)) !== null) {
      issues.push({
        type: 'unsafe_content',
        severity: 'critical',
        description: `Potentially unsafe content detected: "${match[0]}"`,
        location: match[0],
        suggestion: 'Review and remove any content suggesting unethical or illegal actions',
      });
    }
  }
  
  return issues;
}

/**
 * Match response against golden cases.
 * TODO (Phase 2): Integrate with DB-backed golden cases table.
 * Currently returns empty array — confidence scoring relies
 * entirely on structural validation checks.
 */
function matchGoldenCases(
  _scenarioType: string,
  _input: string,
  _response: string
): GoldenCaseMatch[] {
  return [];
}

/**
 * Calculate overall confidence score.
 * When no golden cases exist, score relies 100% on structural validation.
 */
function calculateConfidenceScore(
  issues: ValidationIssue[],
  goldenCaseMatches: GoldenCaseMatch[]
): number {
  let score = 1.0;
  
  // Deduct for issues found by structural validators
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical':
        score -= 0.3;
        break;
      case 'high':
        score -= 0.15;
        break;
      case 'medium':
        score -= 0.08;
        break;
      case 'low':
        score -= 0.03;
        break;
    }
  }
  
  // Only blend in golden case similarity when matches exist
  if (goldenCaseMatches.length > 0) {
    const avgSimilarity = goldenCaseMatches.reduce((sum, m) => sum + m.similarity, 0) / goldenCaseMatches.length;
    score = score * 0.7 + avgSimilarity * 0.3;
  }
  // else: score relies entirely on structural validation — no penalty
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Validate AI response for quality and safety
 */
export function validateResponse(
  response: string,
  originalInput: string,
  scenarioType: string,
  maskedTokens: string[] = []
): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Run all structural validation checks
  issues.push(...checkTokenIntegrity(maskedTokens, response));
  issues.push(...checkForHallucinations(response));
  issues.push(...checkForUnsafeContent(response));
  
  // Check against golden cases (empty until Phase 2)
  const goldenCaseMatches = matchGoldenCases(scenarioType, originalInput, response);
  
  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(issues, goldenCaseMatches);
  
  // Determine pass/fail based on critical issues and confidence
  const hasCriticalIssues = issues.some(i => i.severity === 'critical');
  const passed = !hasCriticalIssues && confidenceScore >= 0.6;
  
  return {
    passed,
    confidenceScore,
    issues,
    goldenCaseMatches,
  };
}

/**
 * Get a summary of validation results for logging
 */
export function getValidationSummary(result: ValidationResult): string {
  const issueCountByType = result.issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const goldenCaseVerdicts = result.goldenCaseMatches.reduce((acc, match) => {
    acc[match.verdict] = (acc[match.verdict] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return [
    `Validation ${result.passed ? 'PASSED' : 'FAILED'}`,
    `Confidence: ${(result.confidenceScore * 100).toFixed(1)}%`,
    `Issues: ${JSON.stringify(issueCountByType)}`,
    `Golden Cases: ${JSON.stringify(goldenCaseVerdicts)}`,
  ].join(' | ');
}
