-- ============================================================
-- Migration 014: Admin Users Management & RLS Delete Policy
-- ============================================================
-- Allows administrators to manage, view, and delete buyer accounts.
-- ============================================================

-- Step 1: Add email column to public.users if not present
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Backfill email from auth.users where possible
DO $$
BEGIN
  UPDATE public.users u
  SET email = au.email
  FROM auth.users au
  WHERE u.id = au.id AND (u.email IS NULL OR u.email = '');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Step 3: Allow administrators to delete users from public.users
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
CREATE POLICY "users_delete_admin"
  ON public.users FOR DELETE
  USING (
    get_user_role() = 'admin'
    OR lower(auth.jwt() ->> 'email') = 'superadminbkhol@gmail.com'
  );

-- Step 4: Update handle_new_user trigger to save email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'buyer';
BEGIN
  IF lower(NEW.email) = 'superadminbkhol@gmail.com' THEN
    assigned_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' = 'supplier' THEN
    assigned_role := 'supplier';
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'buyer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
