

# Redesign EXOS AI Guide: Multi-Turn Conversational Flow

## Summary

Transform the chat from a one-shot keyword matcher into a guided multi-turn conversation. The "How to use EXOS?" button becomes the primary entry point. The bot walks users through 3-4 questions before recommending a scenario, then provides a comprehensive description of the recommended scenario.

## Changes

### 1. `src/components/chat/ChatWidget.tsx` -- Reorder Suggestions

Move "How to use EXOS?" to the first position. Update the suggestions array:

```text
Before:
  "Reduce costs" | "Evaluate suppliers" | "Review a contract" | "Help me choose"

After:
  "How to use EXOS?" | "Reduce costs" | "Evaluate suppliers" | "Review a contract"
```

The "How to use EXOS?" chip sends a trigger message like `"How to use EXOS?"` which activates the guided conversation flow.

### 2. `src/lib/chat-service.ts` -- Multi-Turn Conversation Engine

Replace the stateless keyword matcher with a **stateful conversation manager** that tracks conversation phase.

**Architecture change:** The `getMockAIResponse` function signature changes to accept the full message history, not just the latest input:

```typescript
getMockAIResponse(messages: { role: string; content: string }[]): Promise<string>
```

This lets the service analyze the conversation context and determine which phase the user is in.

**Conversation Flow (for "How to use EXOS?" path):**

```text
Phase 1 (Greeting):
  Bot: Explains EXOS platform overview -- AI-powered procurement analysis
       with 20+ scenarios across 4 categories. Asks: "What's your main
       goal right now? Are you looking to save money, manage risk,
       evaluate suppliers, or prepare documents?"

Phase 2 (Goal Clarification):
  User responds with goal area.
  Bot: Narrows down within that area. Asks about what data/information
       the user currently has available (e.g., "Do you have supplier
       quotes, contract documents, or spend data handy?")

Phase 3 (Context Gathering):
  User describes available data.
  Bot: Asks one more qualifying question about urgency/scope
       (e.g., "Is this for an upcoming negotiation, a strategic review,
       or an emergency situation?")

Phase 4 (Recommendation):
  User responds.
  Bot: Recommends 1-2 specific scenarios with a COMPREHENSIVE description:
       - What the scenario does (logic)
       - Typical use-cases (2-3 examples)
       - What inputs are needed
       - What outputs/dashboards it generates
       - Limitations and caveats
```

**For direct topic chips** (e.g., "Reduce costs"), the bot still provides a quicker path but asks at least 1-2 clarifying questions before recommending.

**Phase detection logic:** The service counts how many assistant messages are in the history and uses keyword analysis on the full conversation to determine which scenario area the user is interested in, then selects the appropriate next question or final recommendation.

**Scenario knowledge base:** A lookup object mapping each scenario ID to a detailed description block including:
- One-paragraph explanation of the analytical logic
- 2-3 concrete use-case examples
- Required inputs summary
- Generated outputs/dashboards list
- Explicit limitations (e.g., "This analysis relies on user-provided cost data and does not verify market prices independently")

This will cover key scenarios: Cost Breakdown, Volume Consolidation, Make vs Buy, TCO Analysis, Supplier Review, Risk Assessment, Contract Review, SOW Critic, Negotiation Prep, Category Strategy, and others.

### 3. `src/hooks/use-exos-chat.tsx` -- Pass Full History

Update `sendMessage` to pass the full messages array (including the new user message) to `getMockAIResponse` instead of just the content string.

### 4. `src/components/chat/ChatMessage.tsx` -- Markdown Support

Currently the typewriter renders plain text. Since the comprehensive scenario descriptions will use **bold**, bullet lists, etc., add basic markdown rendering (bold via `**text**` at minimum) to the message bubble. This keeps the rich descriptions readable.

## Files Modified

| File | Change |
|------|--------|
| `src/lib/chat-service.ts` | Full rewrite: stateful multi-turn conversation engine with scenario knowledge base |
| `src/hooks/use-exos-chat.tsx` | Pass message history to service instead of single string |
| `src/components/chat/ChatWidget.tsx` | Reorder chips, "How to use EXOS?" first |
| `src/components/chat/ChatMessage.tsx` | Add basic markdown rendering for bold/lists |

## Not Included

- Real AI backend (still mocked with setTimeout)
- Persistent conversation history across page reloads
- Scenario deep-linking (clicking a scenario name in chat to navigate directly)
