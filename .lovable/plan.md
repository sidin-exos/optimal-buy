

## Create Testing Pipeline TypeScript Interfaces

### New File: `src/lib/testing/types.ts`

A standalone types file defining strict contracts for all 3 phases of the automated testing pipeline. No existing files will be modified.

### Interfaces to Define

**Primitives:**
- `EntropyLevel` -- type union `1 | 2 | 3`
- `BuyerPersona` -- string literal union: `'executive_sponsor' | 'solo_procurement_hero' | 'tactical_category_manager'`
- `FieldAction` -- string literal union: `'REDUNDANT_HIDE' | 'OPTIONAL_KEEP' | 'CRITICAL_REQUIRE' | 'SCHEMA_GAP_DETECTED'`

**Phase 1 -- Synthesis:**
- `TestPromptRecord` -- maps to `test_prompts` table rows
  - `id: string`, `scenario_type: string`, `buyer_persona: BuyerPersona`, `entropy_level: EntropyLevel`
  - `payload: { structured_data: Record<string, unknown>; raw_text: string }`
  - `industry_slug`, `category_slug`, `created_at`
  - Note: uses `Record<string, unknown>` instead of `any` (consistent with existing `sentinel/types.ts` style)

**Phase 2 -- Execution:**
- `ExecutionReport` -- maps to `test_reports` table rows
  - `id: string`, `prompt_id: string`, `model: string`
  - `status: 'SUCCESS' | 'PIPELINE_FAILURE'`
  - `processing_time_ms: number | null`
  - `extracted_json: Record<string, unknown>`
  - `token_usage`, `error_message`, `shadow_log`, `created_at`

**Phase 3 -- Evaluation:**
- `FieldEvaluation` -- individual field verdict
  - `field_name: string`, `action: FieldAction`
  - `confidence: number` (0-1)
  - `reasoning: string`
  - `source_match: { user_input: boolean; server_context: boolean; ai_output: boolean }` (triangulation data)
- `EvaluationVerdict` -- full judge output
  - `prompt_id: string`, `triangulation_score: number` (0-1)
  - `field_evaluations: FieldEvaluation[]`
  - `schema_gaps: SchemaGap[]`
  - `overall_recommendation: string`
  - `model_used: string`, `evaluated_at: string`
- `SchemaGap` -- new field recommendation
  - `suggested_field: string`, `reason: string`, `frequency: number`, `persona_source: BuyerPersona`

**Pipeline-level:**
- `PipelineRunSummary` -- aggregates a full run
  - `run_id: string`, `entropy_level: EntropyLevel`
  - `total_prompts: number`, `total_reports: number`
  - `success_rate: number`, `avg_processing_time_ms: number`
  - `verdict_distribution: Record<FieldAction, number>`
  - `schema_gaps: SchemaGap[]`
  - `created_at: string`

### Design Decisions
- Uses `unknown` over `any` to match the existing codebase convention in `sentinel/types.ts`
- Keeps DB-facing types (snake_case fields) separate from the existing `useTestDatabase.ts` hook types -- those older interfaces remain untouched and can be gradually migrated
- `FieldAction` includes `SCHEMA_GAP_DETECTED` as the 4th verdict matching the updated flowchart
- Triangulation is embedded in `FieldEvaluation.source_match` rather than a separate type, keeping the evaluation self-contained

