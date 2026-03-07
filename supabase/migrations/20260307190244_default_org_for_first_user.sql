-- Migration: Auto-create organization on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _display_name TEXT;
  _org_id UUID;
BEGIN
  _display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );

  -- Create personal organization
  INSERT INTO public.organizations (name)
  VALUES (_display_name || '''s Organization')
  RETURNING id INTO _org_id;

  -- Create profile as admin of new org
  INSERT INTO public.profiles (id, display_name, organization_id, role)
  VALUES (NEW.id, _display_name, _org_id, 'admin');

  RETURN NEW;
END;
$$;