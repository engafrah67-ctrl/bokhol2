-- ============================================================
-- Migration 011: Fix Admin News RLS & Restore Admin User Row
-- ============================================================
-- Problem: Deleting all users removed the admin's row from
-- public.users. get_user_role() returns NULL so the admin
-- can no longer INSERT into the news table.
--
-- Fix:
--   1. Re-insert admin row in public.users (safe ON CONFLICT)
--   2. Update news_admin_all policy to also allow the known
--      admin email via auth.jwt() as a belt-and-suspenders check.
-- ============================================================

-- Step 1: Restore admin user record in public.users
INSERT INTO public.users (id, full_name, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Super Admin'),
  'admin'
FROM auth.users au
WHERE lower(au.email) = 'superadminbkhol@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin';

-- Step 2: Update news RLS to also accept the admin email from JWT
DROP POLICY IF EXISTS "news_admin_all" ON public.news;

CREATE POLICY "news_admin_all"
  ON public.news FOR ALL
  USING (
    get_user_role() = 'admin'
    OR lower(auth.jwt() ->> 'email') = 'superadminbkhol@gmail.com'
  )
  WITH CHECK (
    get_user_role() = 'admin'
    OR lower(auth.jwt() ->> 'email') = 'superadminbkhol@gmail.com'
  );
