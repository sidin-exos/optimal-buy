

## Shadow Logging Pipeline — Implementation Plan

### Task 1: Update Types (`src/lib/sentinel/types.ts`)

Add a new `ShadowLog` interface at the end of the file:

```typescript
// Section 7: SHADOW LOGGING TYPES
export interface ShadowLog {
  redundant_fields: string[];
  missing_context: string[];
  friction_score: number; // 1 (smooth) to 10 (painful)
  input_recommendation: string;
  scenario_type?: string;
  detected_input_format?: 'structured' | 'semi-structured' | 'raw_text' | 'mixed';
}
```

No existing types are modified. This is additive only.

---

### Task 2: Modify `sentinel-analysis` Edge Function

**Changes to `supabase/functions/sentinel-analysis/index.ts`:**

1. **Inject shadow analysis instruction** into the system prompt (appended after existing rules, only for non-streaming requests where `enableTestLogging` is true and `scenarioType` is present):

```
INTERNAL EVALUATION (do NOT include in your visible response):
After your analysis, output a JSON block fenced with ```shadow_log``` containing:
{
  "redundant_fields": [...fields that added no analytical value],
  "missing_context": [...context the user likely wanted to provide but couldn't],
  "friction_score": 1-10,
  "input_recommendation": "one sentence recommendation",
  "detected_input_format": "structured|semi-structured|raw_text|mixed"
}
```

2. **Parse and strip shadow_log** from the AI response content before returning to client. After `const content = data.choices?.[0]?.message?.content || ""`, extract the shadow_log JSON block using regex, then remove it from the content string.

3. **Write shadow_log to `test_reports`** — include it in the existing `test_reports` insert call alongside `raw_response`, `processing_time_ms`, etc. This applies to both the Google AI Studio path and the Lovable Gateway path.

**Why fenced JSON instead of tool calling?** The Lovable AI Gateway's OpenAI-compatible endpoint and Google AI Studio both support text output reliably. Tool calling has format differences between providers and would complicate the dual-provider fallback logic. A fenced block is simple to parse, works identically on both providers, and is easy to strip from the response.

---

### Task 3: Database Migration

Add `shadow_log` JSONB column to `test_reports`:

```sql
ALTER TABLE public.test_reports
ADD COLUMN shadow_log jsonb DEFAULT NULL;

COMMENT ON COLUMN public.test_reports.shadow_log IS
  'Silent input quality evaluation: friction_score, redundant_fields, missing_context, input_recommendation';
```

No RLS changes needed — `test_reports` is already admin-only for both SELECT and INSERT.

---

### Task 4: Update `generate-test-data` Edge Function

**Changes to `supabase/functions/generate-test-data/index.ts`:**

1. **Add `"messy"` to valid modes** — update `VALID_MODES` from `["draft", "generate", "full"]` to `["draft", "generate", "full", "messy"]`.

2. **Add `handleMessyMode` function** targeting high-friction scenarios (`tco-analysis`, `software-licensing`, `cost-breakdown`, `make-vs-buy`, `supplier-review`, `negotiation-prep`). Uses your exact prompt instruction:

> "You are a busy, disorganized procurement manager. Generate realistic, messy corporate data for the '{scenario_id}' scenario. Do NOT provide clean, isolated numbers or perfectly formatted text. Instead, generate copy-pasted email threads from suppliers, fragmented meeting notes, or raw CSV strings where pricing, terms, and context are all mixed together in unstructured text. Force this chaotic text into the required scenario schema fields, even if it means shoving a whole email paragraph into a 'currency' or 'number' field, or leaving some fields completely blank. The goal is to simulate maximum UX friction and trigger the shadow logging evaluation."

3. **Route messy mode** in the main handler — after the `generate` mode check, add a block for `mode === "messy"` that calls `handleMessyMode`.

4. **Messy mode defaults** — if no `scenarioType` is specified, randomly selects from the high-friction list. Uses higher temperature (0.9) for more creative chaos.

---

### Execution Order

```text
1. Database migration (shadow_log column)
2. src/lib/sentinel/types.ts (ShadowLog interface)
3. supabase/functions/sentinel-analysis/index.ts (inject, parse, strip, store)
4. supabase/functions/generate-test-data/index.ts (messy mode)
5. Deploy both edge functions
```

### Files Modified

| File | Change |
|------|--------|
| `src/lib/sentinel/types.ts` | Add `ShadowLog` interface |
| `supabase/functions/sentinel-analysis/index.ts` | Shadow prompt injection, parsing, stripping, DB write |
| `supabase/functions/generate-test-data/index.ts` | Add `"messy"` mode with high-friction scenario targeting |
| Database migration | Add `shadow_log` JSONB column to `test_reports` |

