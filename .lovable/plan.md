

## Implement "Lost User" Negative Test Persona

Add a 5th buyer persona (`lost-user`) for out-of-scope testing to ensure `sentinel-analysis` rejects irrelevant queries instead of hallucinating procurement advice.

### Changes (3 files)

**1. Edge Function: `supabase/functions/generate-test-data/index.ts`**
- Add 5th entry to `BUYER_PERSONAS` array (after `frustrated-stakeholder` at line 89):
  - id: `"lost-user"`
  - name: `"The Lost User (Out-of-Scope)"`
  - description: User who misunderstands the system, asks irrelevant questions (weather, recipes, coding help), dumps random text into main field, ignores all other fields
  - optionalFillRate: `"0%"`

**2. Frontend Types: `src/lib/testing/types.ts`**
- Add `'lost-user'` to the `BuyerPersona` union type (line 22)

**3. UI Selector: `src/components/testing/LaunchTestBatch.tsx`**
- Add 5th entry to `PERSONAS` array:
  - value: `"lost-user"`, label: `"Lost User (Out-of-Scope)"`, desc: `"Irrelevant queries, zero procurement context"`

### What This Enables
- Test runs with this persona will generate completely off-topic inputs (recipes, weather, code requests)
- The `sentinel-analysis` pipeline should detect these and return an appropriate rejection/error rather than hallucinating procurement analysis
- Provides measurable data on the pipeline's domain-boundary enforcement

### No Database or RLS Changes Needed
The persona is a generation parameter only — no schema changes required.
