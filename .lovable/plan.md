

## Plan: Technology Dropdown + Customer Success Stories

### Change 1: Header — Convert "Technology" link to dropdown

Replace the `NavLink` for "Technology" with a `DropdownMenu` labeled **"Technology & Customer Success"** containing three items:
- "Fine-Tuned AI Agentic Orchestration" → navigates to `/features#orchestration`
- "Privacy-First Data Flow" → navigates to `/features#dataflow`
- "Customer Success Stories" → navigates to `/features#success`

### Change 2: Features page — Add section IDs + Customer Success section

- Add `id="orchestration"` to the Sentinel Capabilities section
- Add `id="dataflow"` to the Data Flow section
- Rename the Sentinel section heading from "Fine-Tuned AI Orchestration" to "Fine-Tuned AI Agentic Orchestration"
- Add a new **Customer Success Stories** section (`id="success"`) at the bottom with 3 mock referral cards

### Change 3: Customer Success Stories content

Three mock referrals grounded in EXOS procurement scenarios:

1. **MedTech Solutions GmbH** — Used TCO Analysis + Make-or-Buy scenarios to uncover hidden logistics costs, saving 18% on surgical instrument procurement across 12 EU hospitals.

2. **NordSteel Industries AB** — Leveraged Black Swan Simulation + Supplier Risk Assessment to build contingency plans after a key raw material supplier faced regulatory issues. Avoided a 6-week production halt.

3. **CleanTech Mobility SAS** — Used Consolidation Wizard + Negotiation Prep to consolidate 47 component suppliers down to 12 strategic partners, reducing admin overhead by 35% and improving delivery reliability.

Each card will show: company name, industry badge, scenario(s) used, quote from a procurement lead, and key metric.

### Files modified
- `src/components/layout/Header.tsx` — Dropdown replacement
- `src/pages/Features.tsx` — Section IDs, renamed heading, new Customer Success section

