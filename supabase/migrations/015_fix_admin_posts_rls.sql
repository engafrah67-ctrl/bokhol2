-- ============================================================
-- Migration 015: Fix Admin Supplier Posts RLS
-- ============================================================
-- Problem: posts_admin_all uses get_user_role() = 'admin'
-- but after session issues, get_user_role() may return NULL.
-- Fix: Also accept admin email from JWT (same as migration 011 for news).
-- ============================================================

-- Step 1: Ensure admin row exists in public.users with correct role
INSERT INTO public.users (id, full_name, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Super Admin'),
  'admin'
FROM auth.users au
WHERE lower(au.email) = 'superadminbkhol@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin';

-- Step 2: Fix supplier_posts RLS to also accept admin email from JWT
DROP POLICY IF EXISTS "posts_admin_all" ON public.supplier_posts;

CREATE POLICY "posts_admin_all"
  ON public.supplier_posts FOR ALL
  USING (
    get_user_role() = 'admin'
    OR lower(auth.jwt() ->> 'email') = 'superadminbkhol@gmail.com'
  )
  WITH CHECK (
    get_user_role() = 'admin'
    OR lower(auth.jwt() ->> 'email') = 'superadminbkhol@gmail.com'
  );
