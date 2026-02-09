

# EXOS AI Guide -- Floating Chat Widget

## Overview

A floating AI chat widget available on all pages. Uses a clean Service-Hook-UI architecture for easy swap to a real backend later. Includes typewriter effect for assistant messages, suggestion chips, glassmorphism styling, and full mobile responsiveness.

## New Files

### 1. `src/lib/chat-service.ts` (Logic Layer)

Pure function with no React dependencies -- easy to replace with an Edge Function call later.

- `getMockAIResponse(input: string): Promise<string>`
- Simulates network delay (random 1000-2000ms via `setTimeout`)
- Keyword matching (case-insensitive, checks for substring):
  - "заявк" -> guidance on creating a request
  - "поставщик" -> supplier search guidance
  - "как это работает" -> platform overview
  - Default fallback -> generic help message
- All strings in Russian per spec

### 2. `src/hooks/use-exos-chat.tsx` (State Layer)

- `Message` type: `{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }`
- State: `messages: Message[]`, `isOpen: boolean`, `isTyping: boolean`
- `sendMessage(content: string)`:
  1. Appends user message with `crypto.randomUUID()` id
  2. Sets `isTyping = true`
  3. Awaits `getMockAIResponse(content)` from chat-service
  4. Appends assistant message
  5. Sets `isTyping = false`
- `toggleChat()`: flips `isOpen`
- `closeChat()`: sets `isOpen = false`
- Returns `{ messages, isOpen, isTyping, sendMessage, toggleChat, closeChat }`

### 3. `src/components/chat/ChatMessage.tsx` (Message Bubble)

- Props: `message: Message`, `onTextReveal?: () => void` (callback for scroll-to-bottom during typewriter)
- **User messages**: `bg-primary text-primary-foreground`, right-aligned, no avatar
- **Assistant messages**: `bg-muted/50 text-foreground`, left-aligned, with `Bot` icon avatar (small, `w-6 h-6`)
- **Typewriter effect** (assistant only):
  - `useState` for `displayedText`, `useEffect` with `setInterval` at ~20ms per character
  - Calls `onTextReveal` on each character addition so parent can auto-scroll
  - Shows full text immediately if message is not the latest (avoids re-animating old messages)
- Timestamp formatted with `Intl.DateTimeFormat` (HH:mm) in muted text below bubble
- Wrapped in `motion.div` with `initial={{ opacity: 0, y: 8 }}` `animate={{ opacity: 1, y: 0 }}`

### 4. `src/components/chat/ChatWidget.tsx` (Main Widget)

**Closed state:**
- Fixed `bottom-6 right-6`, `z-50`
- Circular button with `Sparkles` icon, `gradient-primary` background, `glow-effect` shadow
- Tooltip bubble above button: "Нужна помощь?" -- auto-hides after 5s via `useEffect`/`setTimeout`, reappears on hover
- Framer Motion `scale` spring animation on mount

**Open state (desktop):**
- Fixed `bottom-6 right-6`, `w-[380px] h-[520px]`, `z-50`
- `glass-effect` background (`backdrop-blur-md`, `bg-background/80`, `border border-border/50`)
- Rounded `2xl`, shadow-lg

**Open state (mobile -- uses `useIsMobile()`):**
- Fixed `inset-0`, `w-full h-[100dvh]`, `z-50`
- Same glass styling, no border-radius

**Header:**
- "EXOS Assistant" with `Bot` icon
- `X` (close) and `Minus` (minimize/close) buttons

**Body:**
- `ScrollArea` with `flex-1` height
- **Empty state**: greeting text + 3 suggestion chips as `Button variant="outline" size="sm"`:
  - "Создать заявку"
  - "Найти поставщиков"
  - "Как это работает?"
- Clicking a chip calls `sendMessage` with that text
- **Typing indicator**: 3 animated dots (CSS `animate-pulse` with staggered delays) when `isTyping` is true
- Auto-scroll to bottom on new messages and during typewriter effect via `useRef` + `scrollIntoView`

**Footer:**
- `Input` + `Send` icon button in a flex row
- Submit on Enter key, disabled when `isTyping` or input is empty
- `pb-[env(safe-area-inset-bottom)]` for iOS safe area

**Animation:**
- `AnimatePresence` wrapping the chat window
- Enter: `scale: [0.9, 1]`, `opacity: [0, 1]`, origin bottom-right
- Exit: reverse

## Modified Files

### `src/App.tsx`

- Import `ChatWidget`
- Add `<ChatWidget />` after `<Sonner />` and before `<BrowserRouter>`, so it renders globally on all routes
- Since it's fixed-position with `z-50`, placement in the tree doesn't affect layout

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Typewriter location | ChatMessage component | Keeps the effect co-located with the bubble, parent just passes a scroll callback |
| Service layer | Separate `chat-service.ts` | Single function to swap for `supabase.functions.invoke('chat')` later |
| Mobile detection | Existing `useIsMobile()` hook | Reuses the 768px breakpoint already in the project |
| ID generation | `crypto.randomUUID()` | No extra dependency, browser-native |
| Timestamp format | `Intl.DateTimeFormat` | Already available, no `date-fns` needed for HH:mm |
| Tooltip auto-hide | 5s setTimeout | Per spec, reappear on hover via CSS/state |

## Styling Notes

- Reuses existing design tokens: `glass-effect`, `gradient-primary`, `glow-effect`, `bg-muted/50`
- Dark theme compatible by default (all colors use CSS variables)
- Typing dots use the existing `animate-pulse` with custom delay offsets

## Not Included

- Real AI backend integration (architecture is ready for it)
- Message persistence / database storage
- Multi-language support (hardcoded Russian per spec)
- Sound/notification on new messages

