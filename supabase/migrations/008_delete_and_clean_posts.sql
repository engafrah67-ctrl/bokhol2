-- ============================================================
-- Migration 008: Clean Deleted Supplier Posts & Ensure Delete RLS
-- ============================================================

-- 1. Permanently delete all unpublished / previously deleted posts
DELETE FROM public.supplier_posts WHERE is_published = false;

-- 2. Explicit DELETE policy for suppliers on own posts and admin
DROP POLICY IF EXISTS "posts_supplier_delete" ON public.supplier_posts;
CREATE POLICY "posts_supplier_delete"
  ON public.supplier_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = supplier_posts.company_id
        AND companies.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 3. Ensure UPDATE policy also permits soft-delete
DROP POLICY IF EXISTS "posts_supplier_update" ON public.supplier_posts;
CREATE POLICY "posts_supplier_update"
  ON public.supplier_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = supplier_posts.company_id
        AND companies.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
