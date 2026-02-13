

# Add "Head of Growth" Branch to Org Chart

## Summary

Add a 4th organizational branch -- **Head of Growth** -- alongside the existing CTO, Head of AI, and Delivery scopes. This new branch will carry a "Performance Based" badge to distinguish it from future full-time hires.

## Changes

### 1. `src/components/architecture/OrgChartDiagram.tsx`

- **New color**: Add `growth: "#ef4444"` (red tone) to the `COLORS` object to visually distinguish Growth from the other branches.
- **New icons**: Import `TrendingUp`, `Target`, `Users` from `lucide-react` for the Growth function nodes.
- **4th arrow**: Add a 4th `ArchitectureArrow` in Row 2 (CEO arrows) pointing down in the growth color.
- **4th container**: Add a new `ArchitectureContainer` in Row 3 titled "📈 HEAD OF GROWTH (GTM & Revenue)" with:
  - A `RoleCard` for "Head of Growth" with current text like "Performance-Based Hire" and tagged with a **"Performance Based"** badge (not "Future Hire").
  - 3 `FuncNode` items covering key growth functions:
    - **GTM Strategy** -- Current: "Founder-led", Focus: "Channels, Positioning"
    - **Revenue & Metrics** -- Current: "Manual Tracking", Focus: "MRR, CAC, Retention"
    - **Community & Partnerships** -- Current: "Not Started", Focus: "Outreach, Content"
- **Layout adjustments**: Increase `min-w` from `900px` to `~1200px` to accommodate the 4th column. Adjust container widths as needed.
- **Legend**: Add a new legend entry for "Growth & Revenue" with the growth color, and add a new entry for "Performance Based" (distinct from "Future Hire").

### 2. `src/components/architecture/OrgChartDiagram.tsx` -- RoleCard update

- Add an optional `badgeLabel` and `badgeColor` prop to `RoleCard` so we can show "Performance Based" in a different color (e.g., `#ef4444` red) instead of the green "Future Hire" badge. This keeps the component flexible without breaking existing cards.

### 3. `src/pages/OrgChart.tsx`

- Change the summary cards grid from `grid-cols-3` to `grid-cols-4` (with `md:grid-cols-2 lg:grid-cols-4` for responsiveness).
- Add a 4th card:
  - Title: "📈 Head of Growth"
  - Description: "Go-to-market strategy, revenue metrics, and community building. Performance-based role focused on traction and growth."

### 4. `docs/ORG_CHART.md`

- Add a new section for **Head of Growth Scope** with the role table and update the Scope Boundaries section.

## Files Modified

| File | Change |
|------|--------|
| `src/components/architecture/OrgChartDiagram.tsx` | Add 4th branch (Growth), new color, icons, container, RoleCard badge flexibility |
| `src/pages/OrgChart.tsx` | Add 4th summary card, adjust grid to 4 columns |
| `docs/ORG_CHART.md` | Add Head of Growth section to documentation |

