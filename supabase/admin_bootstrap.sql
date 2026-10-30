-- ============================================================
-- One-time: promote the platform admin.
-- 1. Sign up on the website with the admin email and confirm it.
-- 2. Run this in the Supabase SQL Editor.
-- To add another admin later, run the same UPDATE with their email.
-- ============================================================

UPDATE public.users
   SET role = 'admin'
 WHERE id = (SELECT id FROM auth.users WHERE lower(email) = lower('superadminbkhol@gmail.com'));

-- Expect exactly one row:
SELECT id, email, role FROM public.users WHERE role = 'admin';
