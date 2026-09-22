-- ============================================================
-- Migration 012: Partner Buyers Table
-- ============================================================
-- Stores curated partner/featured buyer logos shown on the home page.
-- Admin-managed via the admin dashboard.
-- ============================================================

CREATE TABLE IF NOT EXISTS partner_buyers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  logo_url    TEXT NOT NULL,
  country     TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_partner_buyers_updated_at
  BEFORE UPDATE ON partner_buyers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE partner_buyers ENABLE ROW LEVEL SECURITY;

-- Anyone can read partner buyers (shown on home page)
CREATE POLICY "partner_buyers_public_read"
  ON partner_buyers FOR SELECT
  USING (TRUE);

-- Only admin can write
CREATE POLICY "partner_buyers_admin_all"
  ON partner_buyers FOR ALL
  USING (get_user_role() = 'admin'
    OR lower(auth.jwt() ->> 'email') = 'superadminbkhol@gmail.com');

-- Seed the default partner buyers
INSERT INTO partner_buyers (name, logo_url, country) VALUES
  ('Van der Valk',           '/partners/buyers/van-der-valk.png',   'Netherlands'),
  ('Tasty Food',             '/partners/buyers/tasty-food.png',      'Belgium'),
  ('Horeca Club Antwerpen',  '/partners/buyers/horeca-club.png',     'Belgium'),
  ('CPH Hotels',             '/partners/buyers/cph-hotels.png',      'Germany'),
  ('Klüt Hotel Hameln',      '/partners/buyers/klut-hotel.png',      'Germany'),
  ('NH Hotels',              '/partners/buyers/nh-hotels.png',       'Spain'),
  ('Alexander Hotel',        '/partners/buyers/alexander-hotel.png', 'Netherlands'),
  ('Hokkai',                 '/partners/buyers/hokkai.png',          'Netherlands'),
  ('NLG Restaurant',         '/partners/buyers/nlg-restaurant.png',  'Germany')
ON CONFLICT DO NOTHING;
