

## Extract RLS Policies into Security Analysis Document

Create a single `docs/RLS_POLICIES_2026-03-04.md` document consolidating all 14 tables' RLS policies, access patterns, and security notes for audit purposes.

### Content Structure

The document will contain:

1. **Summary table** — All 14 tables with RLS status, permitted operations, and policy type (admin-only, user-scoped, public, locked)
2. **Per-table detail** — Each table's columns, RLS policies (name, command, expression), blocked operations, and foreign keys
3. **Security Definer functions** — `has_role`, `create_shared_report`, `get_shared_report`, `save_intel_to_knowledge_base`, `get_evolutionary_directives`
4. **Risk observations** — Flagging any tables with overly permissive or missing policies (e.g., `RESTRICTIVE` vs `PERMISSIVE` semantics, nullable user_id on `chat_feedback`)
5. **Recommendations section** — Placeholder for security analyst notes

### Data Source

All policy data is already available from the current database schema context — no additional reads needed. The document will be placed at `docs/RLS_POLICIES_2026-03-04.md`.

### Files

| File | Action |
|------|--------|
| `docs/RLS_POLICIES_2026-03-04.md` | Create — consolidated RLS policy document |

