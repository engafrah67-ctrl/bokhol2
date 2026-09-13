-- ============================================================
-- Migration 009: Fix Unrealistic Test Post Prices in Database
-- ============================================================

-- Fix the legacy Atlantic Salmon test post from €500/kg to €7.85/kg
UPDATE public.supplier_posts
SET
  title = 'Atlantic Salmon — EUR 7.85/kg',
  content = jsonb_set(
    content::jsonb,
    '{pricePerKg}',
    '7.85'
  )::text
WHERE lower(title) LIKE '%atlantic salmon%'
  AND (content::jsonb->>'pricePerKg')::numeric > 50;
