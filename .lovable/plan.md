
# Connect LangGraph to Model Config & Edge Function

## Overview

The LangGraph (`src/lib/ai/graph.ts`) currently uses a mock reasoning node. We need to make it **production-ready** by:
1. Accepting model configuration at runtime
2. Routing AI inference through the `sentinel-analysis` edge function (which securely holds API keys)

This creates a transparent abstraction where the caller doesn't need to know which provider is being used.

---

## Architecture Decision

### Option A: Route ALL requests through Edge Function (Recommended)
Both "Managed (Lovable)" and "Custom (Google)" go through `sentinel-analysis`.

**Pros:**
- Single code path, simpler maintenance
- API keys stay server-side for both providers
- Consistent logging and error handling

**Cons:**
- Slight latency from edge function hop

### Option B: Client-side Lovable Gateway + Server-side Google
Use client-side SDK for Lovable, edge function for Google.

**Pros:**
- Potentially faster for Lovable (no extra hop)

**Cons:**
- Requires LOVABLE_API_KEY on client (not available)
- Two different code paths to maintain
- LangChain SDK adds bundle size

**Recommendation: Option A** - Route all AI requests through the edge function for simplicity and security.

---

## Files to Modify

### 1. `src/lib/ai/graph.ts`

**Changes:**

| Change | Details |
|--------|---------|
| Add `config` to state annotation | `{ provider, model }` configuration |
| Update `runExosGraph` signature | Accept config parameter |
| Replace mock `nodeReasoning` | Call `sentinel-analysis` via Supabase client |
| Add import for Supabase client | Required for edge function calls |

**New State Field:**
```typescript
config: Annotation<{ provider: 'lovable' | 'google_ai_studio'; model: string }>({
  reducer: (_, next) => next,
  default: () => ({ provider: 'lovable', model: 'gemini-2.0-flash' }),
}),
```

**Updated `nodeReasoning` Function:**
```typescript
async function nodeReasoning(state: ExosState): Promise<Partial<ExosState>> {
  const { provider, model } = state.config;
  const useGoogleAIStudio = provider === 'google_ai_studio';
  
  // System prompt for procurement analysis
  const systemPrompt = `You are EXOS, an expert procurement analyst...`;
  
  // Get the anonymized query from messages
  const lastMessage = state.messages[state.messages.length - 1];
  const userPrompt = typeof lastMessage.content === 'string' 
    ? lastMessage.content 
    : JSON.stringify(lastMessage.content);

  // Route through edge function (secure proxy for both providers)
  const { data, error } = await supabase.functions.invoke('sentinel-analysis', {
    body: {
      systemPrompt,
      userPrompt,
      model: useGoogleAIStudio ? undefined : model,
      useGoogleAIStudio,
      googleModel: useGoogleAIStudio ? model : undefined,
      enableTestLogging: false,
    },
  });

  if (error || data?.error) {
    throw new Error(data?.error || error?.message || 'AI inference failed');
  }

  return {
    messages: [new AIMessage(data.content)],
  };
}
```

**Updated Entry Point:**
```typescript
export async function runExosGraph(
  userQuery: string,
  config: { provider: 'lovable' | 'google_ai_studio'; model: string }
): Promise<{
  finalAnswer: string;
  confidenceScore: number;
  validationStatus: 'pending' | 'approved' | 'rejected';
  retryCount: number;
}> {
  const result = await exosGraph.invoke({
    userQuery,
    config, // Pass config to state
  });

  return {
    finalAnswer: result.finalAnswer,
    confidenceScore: result.confidenceScore,
    validationStatus: result.validationStatus,
    retryCount: result.retryCount,
  };
}
```

---

## Data Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                        LANGGRAPH                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌─────────────┐    ┌──────────┐    ┌────────┐ │
│  │Anonymize │───▶│  Reasoning  │───▶│ Validate │───▶│De-anon │ │
│  └──────────┘    └─────────────┘    └──────────┘    └────────┘ │
│                         │                 │                     │
│                         │ (if rejected,   │                     │
│                         │  retry ≤3)      │                     │
│                         ◀─────────────────┘                     │
│                         │                                       │
│                         ▼                                       │
│               ┌───────────────────┐                             │
│               │ Edge Function     │                             │
│               │ (sentinel-analysis)│                             │
│               └─────────┬─────────┘                             │
│                         │                                       │
│          ┌──────────────┴──────────────┐                        │
│          ▼                             ▼                        │
│   ┌──────────────┐            ┌───────────────────┐            │
│   │ Lovable AI   │            │ Google AI Studio  │            │
│   │ Gateway      │            │ (BYOK)            │            │
│   └──────────────┘            └───────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

The LangGraph can be invoked from anywhere in the app:

```typescript
import { runExosGraph } from '@/lib/ai/graph';
import { useModelConfig } from '@/contexts/ModelConfigContext';

// Inside a component or hook
const { provider, model } = useModelConfig();

const result = await runExosGraph(userQuery, { provider, model });
```

For now, the existing `useSentinel` hook remains the primary integration point. The LangGraph provides an alternative architecture for more complex multi-step reasoning with automatic retries.

---

## Future Enhancement: "Deep Analysis" Button

Once the graph is connected, you could add a "Deep Analysis" button that:
1. Uses the full LangGraph pipeline (with retry loop)
2. Provides more thorough validation
3. Shows pipeline step progress

This would be a separate feature request.

---

## Testing Strategy

1. **Unit Test**: Mock `supabase.functions.invoke` and verify correct routing
2. **Integration Test**: 
   - Set provider to "Managed" → verify Lovable Gateway is used
   - Set provider to "Custom" → verify Google AI Studio is used
3. **Manual Test**:
   - Check Network tab for `sentinel-analysis` calls
   - Verify `useGoogleAIStudio` flag is correctly passed

---

## Technical Summary

| Item | Details |
|------|---------|
| File Modified | 1 (`src/lib/ai/graph.ts`) |
| New Dependencies | None (uses existing Supabase client) |
| Breaking Changes | `runExosGraph` signature adds required `config` parameter |
| Security | API keys remain server-side, never exposed to client |
