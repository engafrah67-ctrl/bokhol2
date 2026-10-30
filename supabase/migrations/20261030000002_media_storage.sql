-- ============================================================
-- Media storage for product photos and supplier logos
-- ============================================================
-- Images are served from Supabase's CDN instead of being stored as
-- base64 text inside table rows (which made every page download them).
-- Anyone can view; only admins can upload, replace or delete.
-- Safe to re-run.
-- ============================================================

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public bucket: files are readable by URL without a SELECT policy.
DROP POLICY IF EXISTS media_admin_insert ON storage.objects;
CREATE POLICY media_admin_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS media_admin_update ON storage.objects;
CREATE POLICY media_admin_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS media_admin_delete ON storage.objects;
CREATE POLICY media_admin_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());

-- Never store images as base64 text again (a 580 KB logo was being downloaded with
-- every product). NOT VALID: enforced for new/updated rows; existing rows are left alone
-- until re-uploaded.
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_logo_not_embedded;
ALTER TABLE public.companies ADD CONSTRAINT companies_logo_not_embedded
  CHECK (logo_url IS NULL OR logo_url NOT LIKE 'data:%') NOT VALID;

ALTER TABLE public.supplier_posts DROP CONSTRAINT IF EXISTS posts_no_embedded_images;
ALTER TABLE public.supplier_posts ADD CONSTRAINT posts_no_embedded_images
  CHECK (content IS NULL OR content NOT LIKE '%data:image/%') NOT VALID;

ALTER TABLE public.partner_buyers DROP CONSTRAINT IF EXISTS partner_logo_not_embedded;
ALTER TABLE public.partner_buyers ADD CONSTRAINT partner_logo_not_embedded
  CHECK (logo_url NOT LIKE 'data:%') NOT VALID;

COMMIT;
