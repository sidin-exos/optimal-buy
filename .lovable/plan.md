

# Remove "One Fine-Tuned Model" Section from Technology Page

## Summary

Remove the bottom promotional card from `src/components/features/SentinelCapabilities.tsx` — the gradient box starting with "One Fine-Tuned Model. World-Class Cloud AI. Total Control."

## Change

**File:** `src/components/features/SentinelCapabilities.tsx`

Remove the entire "Architecture Note" `div` block (lines ~73-107) that contains:
- The EXOS logo thumbnail
- The "One Fine-Tuned Model..." heading
- The descriptive paragraph about EXOS Sentinel
- The three badge chips ("Fine-tuned for Procurement", "Cloud AI Orchestration", "Anti-Hallucination Validation")

Everything else (the central hub visual, the 4 capability cards grid) remains untouched.

