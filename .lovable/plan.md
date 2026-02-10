

# Connect Chat Widget to `chat-copilot` Backend

## Summary

Replace the mock conversation engine with a real call to the deployed `chat-copilot` edge function. Add navigation action handling with toast feedback. Preserve all existing UX (typewriter effect, scroll behavior, loading state).

## Changes

### 1. `src/lib/chat-service.ts` -- Full Rewrite

Remove all mock logic (~250 lines of scenario knowledge base, phase detection, keyword matching). Replace with a clean Supabase edge function call:

- Export types: `ChatRole`, `ChatMessage`, `ChatResponse`
- Single function `getAIResponse(messages, currentPath)` that calls `supabase.functions.invoke('chat-copilot', { body: { messages, currentPath } })`
- Graceful error handling: return a fallback English message on failure
- Parse and return `{ content, action? }` from the response

### 2. `src/hooks/use-exos-chat.tsx` -- Navigation + Payload Safety

- Add imports: `useLocation`, `useNavigate` from `react-router-dom`; `toast` from `sonner`; new `getAIResponse` and types from chat-service
- Remove old `getMockAIResponse` import
- In `sendMessage`:
  - **Sanitize and Slice:** Create a payload of the last 10 messages. Map them to strictly `{ role: string, content: string }` objects, removing `id` and `timestamp` properties, otherwise the OpenAI-compatible API will reject the request.
  - Call `getAIResponse(payload, location.pathname)`
  - Add assistant message using `response.content`
  - On `response.action?.type === 'NAVIGATE'`: show English toast ("Navigating...") and call `navigate(response.action.payload)`

### 3. No Changes to UI Components

- `ChatMessage.tsx` -- Typewriter effect works on any string content, no changes needed
- `ChatWidget.tsx` -- Already uses `isTyping`, `sendMessage`, suggestion chips -- no changes needed

## Files Modified

| File | Change |
|------|--------|
| `src/lib/chat-service.ts` | Full rewrite: mock logic replaced with `supabase.functions.invoke('chat-copilot')` call |
| `src/hooks/use-exos-chat.tsx` | Add router hooks, toast, sanitize+slice payload, navigation action handling |

