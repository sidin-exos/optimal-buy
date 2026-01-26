/**
 * EXOS Sentinel - Reasoning Integrity Validator
 * 
 * Component 5: The Internal Auditor
 * Validates AI responses against golden cases and checks for
 * hallucinations, inconsistencies, and unsafe content.
 */

import type {
  ValidationResult,
  ValidationIssue,
  GoldenCaseMatch,
  GoldenCase,
} from './types';

/**
 * Mock golden cases for validation
 * In production, these would be stored in a database and continuously updated
 */
const MOCK_GOLDEN_CASES: GoldenCase[] = [
  {
    id: 'gc_001',
    scenarioType: 'consolidation',
    inputPattern: 'consolidat.*supplier.*volume',
    expectedOutputPattern: '(?=.*savings)(?=.*risk)(?=.*recommendation)',
    constraints: [
      'Must include quantified savings estimate',
      'Must mention potential risks',
      'Must preserve all masked tokens',
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'gc_002',
    scenarioType: 'negotiation',
    inputPattern: 'negotiat.*contract.*price',
    expectedOutputPattern: '(?=.*leverage)(?=.*strategy)(?=.*timeline)',
    constraints: [
      'Must suggest specific negotiation tactics',
      'Must reference market conditions',
      'Must include implementation timeline',
    ],
    createdAt: '2024-01-20',
  },
  {
    id: 'gc_003',
    scenarioType: 'risk_assessment',
    inputPattern: 'risk.*supplier.*assess',
    expectedOutputPattern: '(?=.*probability)(?=.*impact)(?=.*mitigation)',
    constraints: [
      'Must quantify risk levels',
      'Must suggest mitigation strategies',
      'Must not fabricate supplier details',
    ],
    createdAt: '2024-02-01',
  },
];

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
      // Check if token was potentially revealed
      const tokenType = token.match(/\[([A-Z_]+)_/)?.[1];
      
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
 * Match response against golden cases
 */
function matchGoldenCases(
  scenarioType: string,
  input: string,
  response: string
): GoldenCaseMatch[] {
  const matches: GoldenCaseMatch[] = [];
  
  for (const goldenCase of MOCK_GOLDEN_CASES) {
    // Check if this golden case applies to the input
    const inputPattern = new RegExp(goldenCase.inputPattern, 'gi');
    if (!inputPattern.test(input) && goldenCase.scenarioType !== scenarioType) {
      continue;
    }
    
    // Check if response matches expected pattern
    const outputPattern = new RegExp(goldenCase.expectedOutputPattern, 'gi');
    const matches_output = outputPattern.test(response);
    
    // Check constraints
    const constraintResults = goldenCase.constraints.map(constraint => {
      // Simple keyword check for demonstration
      const keywords = constraint.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const found = keywords.some(kw => response.toLowerCase().includes(kw));
      return { constraint, met: found };
    });
    
    const constraintsMet = constraintResults.filter(c => c.met).length;
    const totalConstraints = constraintResults.length;
    
    let verdict: 'match' | 'partial' | 'mismatch';
    let similarity: number;
    
    if (matches_output && constraintsMet === totalConstraints) {
      verdict = 'match';
      similarity = 1.0;
    } else if (matches_output || constraintsMet > 0) {
      verdict = 'partial';
      similarity = 0.5 + (constraintsMet / totalConstraints) * 0.4;
    } else {
      verdict = 'mismatch';
      similarity = constraintsMet / totalConstraints * 0.4;
    }
    
    matches.push({
      caseId: goldenCase.id,
      similarity,
      expectedPattern: goldenCase.expectedOutputPattern,
      actualPattern: response.slice(0, 200) + '...', // Truncate for logging
      verdict,
    });
  }
  
  return matches;
}

/**
 * Calculate overall confidence score
 */
function calculateConfidenceScore(
  issues: ValidationIssue[],
  goldenCaseMatches: GoldenCaseMatch[]
): number {
  let score = 1.0;
  
  // Deduct for issues
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
  
  // Adjust based on golden case matches
  if (goldenCaseMatches.length > 0) {
    const avgSimilarity = goldenCaseMatches.reduce((sum, m) => sum + m.similarity, 0) / goldenCaseMatches.length;
    score = score * 0.7 + avgSimilarity * 0.3;
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Validate AI response for quality and safety
 * 
 * @param response - The AI-generated response to validate
 * @param originalInput - The original (anonymized) input
 * @param scenarioType - The type of scenario being analyzed
 * @param maskedTokens - List of masked tokens that should be preserved
 * @returns ValidationResult with pass/fail status and detailed issues
 */
export function validateResponse(
  response: string,
  originalInput: string,
  scenarioType: string,
  maskedTokens: string[] = []
): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Run all validation checks
  issues.push(...checkTokenIntegrity(maskedTokens, response));
  issues.push(...checkForHallucinations(response));
  issues.push(...checkForUnsafeContent(response));
  
  // Check against golden cases
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
