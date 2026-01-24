/**
 * XML Template Generator for AI Context Grounding
 * 
 * These templates structure procurement context data into XML format
 * for enhanced AI reasoning. The team can fine-tune these templates
 * to optimize response accuracy.
 */

export interface IndustryContext {
  id: string;
  name: string;
  slug: string;
  constraints: string[];
  kpis: string[];
}

export interface ProcurementCategory {
  id: string;
  name: string;
  slug: string;
  characteristics: string;
  kpis: string[];
}

/**
 * Generate XML context block for industry grounding
 * This template provides industry-specific constraints and KPIs to guide AI reasoning
 */
export function generateIndustryContextXML(industry: IndustryContext): string {
  return `<industry-context>
  <industry-name>${escapeXML(industry.name)}</industry-name>
  <industry-id>${escapeXML(industry.slug)}</industry-id>
  
  <regulatory-constraints>
    <description>The following regulatory and operational constraints are critical for this industry. All recommendations must account for these requirements.</description>
    <constraints>
${industry.constraints.map((c, i) => `      <constraint priority="${i + 1}">${escapeXML(c)}</constraint>`).join('\n')}
    </constraints>
  </regulatory-constraints>
  
  <performance-kpis>
    <description>These are the standard performance metrics used in this industry. Recommendations should align with and potentially improve these KPIs.</description>
    <kpis>
${industry.kpis.map((k, i) => `      <kpi index="${i + 1}">${escapeXML(k)}</kpi>`).join('\n')}
    </kpis>
  </performance-kpis>
  
  <grounding-instructions>
    <instruction>Consider all regulatory constraints when making recommendations</instruction>
    <instruction>Align savings opportunities with industry-standard KPIs</instruction>
    <instruction>Flag any recommendations that may conflict with industry regulations</instruction>
    <instruction>Use industry-specific terminology in responses</instruction>
  </grounding-instructions>
</industry-context>`;
}

/**
 * Generate XML context block for procurement category grounding
 * This template provides category-specific characteristics and benchmarks
 */
export function generateCategoryContextXML(category: ProcurementCategory): string {
  return `<category-context>
  <category-name>${escapeXML(category.name)}</category-name>
  <category-id>${escapeXML(category.slug)}</category-id>
  
  <category-characteristics>
    <description>Key characteristics that define this procurement category and influence sourcing strategies.</description>
    <characteristics>${escapeXML(category.characteristics)}</characteristics>
  </category-characteristics>
  
  <category-kpis>
    <description>Standard performance metrics for this category. Use these for benchmarking and improvement recommendations.</description>
    <kpis>
${category.kpis.map((k, i) => `      <kpi index="${i + 1}">${escapeXML(k)}</kpi>`).join('\n')}
    </kpis>
  </category-kpis>
  
  <grounding-instructions>
    <instruction>Account for category-specific characteristics in all recommendations</instruction>
    <instruction>Benchmark recommendations against category KPIs</instruction>
    <instruction>Consider typical supplier dynamics for this category</instruction>
    <instruction>Suggest category-appropriate negotiation tactics</instruction>
  </grounding-instructions>
</category-context>`;
}

/**
 * Generate combined XML context for full analysis grounding
 * Combines industry and category context with user-provided scenario data
 */
export function generateFullContextXML(
  industry: IndustryContext | null,
  category: ProcurementCategory | null,
  scenarioData: Record<string, string>,
  scenarioType: string
): string {
  const parts: string[] = [];
  
  parts.push(`<analysis-context scenario-type="${escapeXML(scenarioType)}">`);
  
  if (industry) {
    parts.push(generateIndustryContextXML(industry));
  }
  
  if (category) {
    parts.push(generateCategoryContextXML(category));
  }
  
  // Add user-provided scenario data
  parts.push(`  <user-input>`);
  for (const [key, value] of Object.entries(scenarioData)) {
    if (value && value.trim()) {
      parts.push(`    <field name="${escapeXML(key)}">${escapeXML(value)}</field>`);
    }
  }
  parts.push(`  </user-input>`);
  
  // Add cross-reference instructions
  parts.push(`  <cross-reference-instructions>
    <instruction>Cross-reference user inputs with industry constraints for compliance checks</instruction>
    <instruction>Identify opportunities based on category benchmarks</instruction>
    <instruction>Suggest best practices from analogous categories when applicable</instruction>
    <instruction>Provide quantified recommendations where industry KPIs allow</instruction>
  </cross-reference-instructions>`);
  
  parts.push(`</analysis-context>`);
  
  return parts.join('\n');
}

/**
 * Generate system prompt with context grounding
 * This wraps the context XML into a complete system prompt
 */
export function generateGroundedSystemPrompt(
  basePrompt: string,
  industry: IndustryContext | null,
  category: ProcurementCategory | null
): string {
  const contextParts: string[] = [];
  
  if (industry) {
    contextParts.push(generateIndustryContextXML(industry));
  }
  
  if (category) {
    contextParts.push(generateCategoryContextXML(category));
  }
  
  if (contextParts.length === 0) {
    return basePrompt;
  }
  
  return `${basePrompt}

<grounding-context>
${contextParts.join('\n\n')}

<meta-instructions>
  <instruction>Use the provided industry and category context to ground all recommendations</instruction>
  <instruction>Ensure compliance with regulatory constraints before suggesting actions</instruction>
  <instruction>Reference specific KPIs when quantifying potential improvements</instruction>
  <instruction>Draw analogies from best practices in similar industries/categories</instruction>
  <instruction>Provide actionable insights tailored to the specific context</instruction>
</meta-instructions>
</grounding-context>`;
}

/**
 * Escape special XML characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
