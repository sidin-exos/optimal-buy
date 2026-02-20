
## Align Testing Pipeline Industries & Categories with Main Pipeline

### Problem
The testing pipeline's `LaunchTestBatch` uses a hardcoded `INDUSTRY_CATEGORY_COMPATIBILITY` matrix in `src/lib/ai-test-data-generator.ts` with 8 generic industries and ~60 generic categories (e.g., "manufacturing", "raw-materials"). The main scenario wizard uses 30 industries and 30 categories fetched from the database tables `industry_contexts` and `procurement_categories`.

### Solution
Replace the hardcoded dropdowns in `LaunchTestBatch` with the same database-backed hooks (`useIndustryContexts` and `useProcurementCategories`) used by the main pipeline's `IndustrySelector` and `CategorySelector`.

### Files to Modify

**1. `src/components/testing/LaunchTestBatch.tsx`**
- Remove imports of `getIndustries` and `getCompatibleCategories` from `ai-test-data-generator.ts`
- Import `useIndustryContexts` and `useProcurementCategories` from `@/hooks/useContextData`
- Replace the industry dropdown to iterate over `industries` from `useIndustryContexts()`, using `slug` as value and `name` as label
- Replace the category dropdown to iterate over `categories` from `useProcurementCategories()`, showing all categories (no compatibility filtering -- the edge function handles any combination)
- Pass the selected `slug` values to `generateAITestData()` (the `industry` and `category` params already accept slug strings)

**2. `src/lib/ai-test-data-generator.ts`**
- Keep `INDUSTRY_CATEGORY_COMPATIBILITY` and its helper functions (`getIndustries`, `getCompatibleCategories`, `validateIndustryCategoryPair`) since they may be used by the edge function or other code
- No changes needed to this file -- the functions just won't be imported by `LaunchTestBatch` anymore

### What Stays the Same
- The `generateAITestData()` call signature is unchanged -- it already accepts `industry?: string` and `category?: string` as optional slug strings
- The `generate-test-data` edge function needs no changes
- The hardcoded compatibility matrix remains available for server-side validation if needed

### Technical Notes
- The main pipeline does not filter categories by industry (both are independent dropdowns), so the testing pipeline will match this behavior -- any industry + any category combination is valid
- Both hooks return loading states, so the selects will show "Loading..." while data is fetched
- The `useIndustryContexts` and `useProcurementCategories` hooks are already cached by TanStack Query, so there is no performance concern
