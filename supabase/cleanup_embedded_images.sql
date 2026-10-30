-- ============================================================
-- One-time cleanup: remove images that were saved as base64 text
-- (before Supabase Storage was used). They made pages download
-- hundreds of KB per product. Affected items fall back to a
-- standard image; re-upload them from the admin dashboard.
-- ============================================================

BEGIN;

-- Show what will be cleaned
SELECT 'company logo' AS kind, name AS item, round(length(logo_url) / 1024.0) AS kb
  FROM public.companies WHERE logo_url LIKE 'data:%'
UNION ALL
SELECT 'product photo', title, round(length(content) / 1024.0)
  FROM public.supplier_posts WHERE content LIKE '%data:image/%'
UNION ALL
SELECT 'partner logo', name, round(length(logo_url) / 1024.0)
  FROM public.partner_buyers WHERE logo_url LIKE 'data:%';

UPDATE public.companies SET logo_url = NULL WHERE logo_url LIKE 'data:%';

UPDATE public.supplier_posts
   SET content = (public.try_jsonb(content) - 'customImage' - 'companyLogo')::text
 WHERE content LIKE '%data:image/%';

-- Now every row satisfies the "no embedded images" rules
ALTER TABLE public.companies      VALIDATE CONSTRAINT companies_logo_not_embedded;
ALTER TABLE public.supplier_posts VALIDATE CONSTRAINT posts_no_embedded_images;

COMMIT;
