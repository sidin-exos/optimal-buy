

# Fix: EXOS Logo on Technology Page

## Problem

The hero section logo on the Features/Technology page appears broken or incorrectly rendered on the published site. The logo uses a `scale-[1.8]` transform inside a `rounded-xl overflow-hidden` container, which can cause clipping and rendering artifacts -- especially at the hero size (w-24/w-32).

## Root Cause

The `scale-[1.8]` approach is fragile. It scales the entire image element beyond its container bounds and relies on `overflow-hidden` to crop. This can cause:
- Inconsistent rendering across browsers
- The logo appearing zoomed into the wrong area
- Blank/cut-off display when the image hasn't loaded or the container size shifts

The same pattern is used in 3 places: hero section, SentinelCapabilities hub, and architecture note -- all in `Features.tsx` or its child components.

## Fix

Replace the `scale-[1.8]` hack with proper `object-cover` sizing and use `object-position` to center on the logo's focal point. This gives a stable, predictable crop without relying on transform scaling.

### Files to Change

**`src/pages/Features.tsx`** (hero logo, lines ~69-71):
- Remove `scale-[1.8]` from the img tag
- Use `object-cover` instead of `object-contain` so the image fills the container naturally

**`src/components/features/SentinelCapabilities.tsx`** (2 logo instances, lines 43 and 87):
- Same fix: remove `scale-[1.8]`, switch to `object-cover`

### Before / After

```text
Before: <img src={exosLogo} className="w-full h-full object-contain scale-[1.8]" />
After:  <img src={exosLogo} className="w-full h-full object-cover" />
```

This ensures the logo fills its container by cropping edges rather than scaling and overflowing, which is more reliable across builds and browsers.

## Scope

- 3 img tags across 2 files
- No structural or layout changes
- No new dependencies

