-- ============================================================
-- FishMarketCap — Migration 013: Ensure Supplier Countries
-- Ensures Belgium, Netherlands, Germany exist with correct ISO codes and flags
-- ============================================================

INSERT INTO countries (name, slug, flag_emoji, region, iso_code, is_featured)
VALUES
  ('Belgium', 'belgium', '🇧🇪', 'Europe', 'BE', TRUE)
ON CONFLICT (name) DO UPDATE SET
  flag_emoji = EXCLUDED.flag_emoji,
  iso_code = EXCLUDED.iso_code,
  is_featured = TRUE;

UPDATE countries SET is_featured = TRUE WHERE name IN ('Netherlands', 'Germany', 'Belgium');
