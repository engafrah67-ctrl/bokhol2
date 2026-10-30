-- ============================================================
-- Tighten visitor (anon) table privileges
-- ============================================================
-- Supabase projects can auto-grant ALL on new public tables to anon.
-- That overrides the column-level grant on companies (contact details
-- would be visible to visitors). Reset anon to exactly what it needs.
-- Safe to re-run.
-- ============================================================

BEGIN;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Public reference data
GRANT SELECT ON public.countries, public.products, public.company_products, public.certificates,
                public.market_indexes, public.market_history, public.seafood_index_items,
                public.news, public.partner_buyers
  TO anon;

-- Companies: public profile only — no email, phone, address, owner_id
GRANT SELECT (id, name, slug, country_id, description, website, logo_url, city,
              year_founded, employee_count, export_markets, status, is_verified,
              activity_score, trust_score, created_at, updated_at)
  ON public.companies TO anon;

-- TRUNCATE ignores RLS; API users never need it
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

COMMIT;
