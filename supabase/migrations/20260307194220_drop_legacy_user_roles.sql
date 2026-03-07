-- Drop legacy user_roles RBAC system.
-- All admin checks now use profiles.role + is_org_admin().

-- 1. Drop RLS policy on user_roles (from migration 007)
DROP POLICY IF EXISTS "select_any_admin" ON public.user_roles;

-- 2. Drop the table
DROP TABLE IF EXISTS public.user_roles;

-- 3. Drop the function (must drop before the enum it references)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4. Drop the legacy enum type
DROP TYPE IF EXISTS public.app_role;
