

# Fix: Chatbot Navigates Too Eagerly

## Problem

When clicking a suggestion like "How to use EXOS?", the AI immediately calls `navigate_to_scenario` (e.g., to `/dashboards`), redirecting the user away from their current page before the conversation even starts.

## Root Cause

1. **System prompt** tells the AI to navigate users to scenarios as soon as it identifies a match -- but general questions like "How to use EXOS?" shouldn't trigger navigation.
2. **No user confirmation** -- the frontend blindly executes any NAVIGATE action returned by the AI.

## Solution (2 changes)

### 1. Update System Prompt in `supabase/functions/chat-copilot/index.ts`

Add explicit guardrails to the system prompt:

- "Do NOT navigate on the first message. First understand the user's specific challenge."
- "Only use the navigate tool when the user has confirmed they want to go to a specific scenario, or when you've had at least 2 exchanges to understand their need."
- "For general questions like 'How to use EXOS?' or 'What can you do?', explain the platform capabilities WITHOUT navigating."

### 2. Add Navigation Confirmation in `src/hooks/use-exos-chat.tsx`

Instead of immediately calling `navigate()`, show a toast with an action button:

```
toast('Navigate to Reports?', {
  action: { label: 'Go', onClick: () => navigate(path) },
  duration: 6000,
});
```

This gives the user control -- they can accept or ignore the navigation suggestion.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/chat-copilot/index.ts` | Add navigation guardrails to system prompt |
| `src/hooks/use-exos-chat.tsx` | Replace auto-navigate with confirmation toast |

