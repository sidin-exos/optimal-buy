

# Refactor: Lazy Load Recent Queries

## Problem
The `RecentQueries` component auto-fetches on mount via `useEffect`, causing unnecessary DB reads and UI flicker on every page load or hot-refresh.

## Changes

### File: `src/components/intelligence/RecentQueries.tsx`

**1. Remove auto-fetch**
Delete the `useEffect` block (lines 39-41) that calls `onLoad()` on mount.

**2. Add Refresh button in card header**
Add a small icon button (using `RefreshCw` from lucide-react) next to the "Recent Queries" title. It calls `onLoad` on click and is disabled while `isLoading`.

**3. Update empty state**
Replace the current "No queries yet" message with a friendly empty state that includes a "Load Recent History" button. This makes it clear the data hasn't been fetched yet (not that there's no data).

**4. Track loaded state**
Add a local `hasLoaded` boolean (via `useState`) that flips to `true` after the first successful `onLoad` call. This lets us show different empty-state messages:
- Before load: "Click below to load your query history" + Load button
- After load with no results: "No queries found. Start by searching above."

### No other files need changes
- `MarketIntelligence.tsx` just passes `loadRecentQueries` as `onLoad` -- no auto-trigger there
- `useMarketIntelligence.ts` hook is already on-demand
- `QueryBuilder` submit is already user-triggered

## Technical Detail

```text
Before:
  Component mounts -> useEffect fires -> onLoad() -> DB query

After:
  Component mounts -> shows empty state with "Load" button
  User clicks button -> onLoad() -> DB query -> results shown
  User clicks refresh icon -> onLoad() -> updated results
```

## UX States

1. **Initial** -- Card with "Load Recent History" button, no spinner, no data
2. **Loading** -- Spinner visible, button disabled
3. **Loaded with data** -- Scrollable list of queries, refresh button active in header
4. **Loaded with no data** -- "No queries found" message, refresh button in header

