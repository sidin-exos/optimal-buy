

## Mobile-Friendliness Audit and Plan

Your analytics show nearly 50% mobile traffic (12 mobile vs 13 desktop visits). After reviewing all pages on a 390px viewport, here are the issues found and the plan to fix them.

### Issues Found

**Critical: No mobile navigation**
The header navigation (`nav`) uses `hidden md:flex`, meaning mobile users have zero way to navigate between pages. They can only reach the homepage via the logo. This is the single biggest mobile UX gap.

**Medium: Reports page tab overflow**
The 14 dashboard tabs render in a wrapping flex layout that becomes very cramped on mobile. The tabs become tiny and hard to tap.

**Medium: Account page header layout**
The account info card places the avatar, user info, and Sign Out button in a horizontal `flex justify-between` that crowds on small screens.

**Low: Guide category descriptions hidden**
On the Reports page, guide category descriptions use `hidden md:block`, which is fine -- mobile shows just the label and icon.

**Good news**: Index, Pricing, Features, Market Intelligence, Auth pages all render well on mobile. The `container` class, responsive grids (`grid-cols-1 md:grid-cols-X`), and text sizing (`text-3xl md:text-4xl`) are properly set up.

---

### Implementation Plan

#### 1. Add mobile hamburger menu to Header
- Add a hamburger button (`Menu` icon) visible only on `md:hidden`
- Use a `Sheet` (slide-in drawer from left or top) to render all nav links on mobile
- Include the same navigation items: Scenarios, Market Intelligence, Technology, Dashboards, Pricing & FAQ
- Include Sign In button or user avatar/dropdown within the sheet
- Close sheet on navigation

#### 2. Fix Reports page tabs for mobile
- Wrap the `TabsList` in a horizontal `ScrollArea` on mobile so tabs scroll horizontally instead of wrapping into tiny pills
- Alternatively, convert to a `Select` dropdown on mobile screens

#### 3. Fix Account page header for mobile
- Stack the avatar/info and Sign Out button vertically on small screens using `flex-col sm:flex-row`

### Files to Edit
- `src/components/layout/Header.tsx` -- add mobile menu (Sheet + hamburger)
- `src/pages/Reports.tsx` -- improve tab list mobile UX
- `src/pages/Account.tsx` -- stack account header on mobile

