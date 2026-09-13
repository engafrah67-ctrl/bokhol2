-- ============================================================
-- Migration 007: Fix Admin Role for SuperAdminbkhol@gmail.com
-- ============================================================
-- This migration:
--   1. Directly sets the admin user's role to 'admin' in public.users
--      (overriding the default 'buyer' set by the signup trigger)
--   2. Updates the handle_new_user trigger to recognise the admin email
--      so future account recreation also gets role='admin'
-- ============================================================

-- Step 1: Directly fix the existing user record
-- Uses a subquery on auth.users to find the UUID by email (case-insensitive)
UPDATE public.users
SET role = 'admin'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'superadminbkhol@gmail.com'
  LIMIT 1
);

-- Step 2: Update the trigger function to hardcode the admin email
-- so it always gets 'admin' role on creation, regardless of metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'buyer';
BEGIN
  -- Hardcoded admin email always gets admin role
  IF lower(NEW.email) = 'superadminbkhol@gmail.com' THEN
    assigned_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' = 'supplier' THEN
    assigned_role := 'supplier';
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.users (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.users (id, role)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
