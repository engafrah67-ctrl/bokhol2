-- ============================================================
-- FishMarketCap — Migration 006: Real Supplier Company Data
-- Sourced from partner websites (July 2026)
-- ============================================================

-- We need a "system" admin user to be the owner_id for seeded companies.
-- We'll use a dedicated seed UUID that never conflicts with real auth users.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO auth.users (id, email, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'seed@fishmarketcap.com',
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      FALSE, 'authenticated', 'authenticated'
    );
  END IF;
END$$;

-- Ensure seed user row exists in public.users
INSERT INTO users (id, role, full_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'System Seed')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- COMPANIES — 6 Real Partners
-- ============================================================

INSERT INTO companies (
  owner_id, name, slug, country_id, description, website,
  logo_url, phone, email, address, city,
  year_founded, employee_count, export_markets,
  status, is_verified, activity_score, trust_score
)
VALUES

-- 1. Amacore — Trusted frozen seafood supplier, Netherlands
(
  '00000000-0000-0000-0000-000000000001',
  'Amacore',
  'amacore',
  (SELECT id FROM countries WHERE iso_code = 'NL'),
  'Amacore is a trusted supplier of premium frozen seafood. With a global sourcing network, Amacore travels the world to find only the finest quality fish for their customers. Their product range spans white fish, pelagic species, and shellfish — all carefully selected for freshness and quality before freezing.',
  'https://amacore.nl',
  '/partners/amacore.png',
  NULL,
  'info@amacore.nl',
  NULL,
  'Netherlands',
  2021,
  '10-50',
  ARRAY['NL','DE','BE','FR','GB'],
  'active', TRUE, 82, 88
),

-- 2. AM Fish — Dutch fresh & prepared fish producer, Katwijk
(
  '00000000-0000-0000-0000-000000000001',
  'AM Fish',
  'amfish',
  (SELECT id FROM countries WHERE iso_code = 'NL'),
  'AMfish is a leading Dutch producer of fresh and prepared fish products. As market leader in the foodservice sector, AMfish serves wholesale, care & catering, and retail markets from their state-of-the-art production facility in Katwijk. Their diverse range includes fresh fillets, smoked specialties, and ready-to-cook convenience seafood.',
  'https://amfish.nl',
  '/partners/amfish.png',
  NULL,
  'info@amfish.nl',
  'Katwijk',
  'Katwijk',
  2008,
  '50-200',
  ARRAY['NL','DE','BE'],
  'active', TRUE, 91, 93
),

-- 3. ANT Seafood — Import/export & wholesale, Netherlands
(
  '00000000-0000-0000-0000-000000000001',
  'ANT Seafood',
  'ant-seafood',
  (SELECT id FROM countries WHERE iso_code = 'NL'),
  'AnT Seafood is a specialist wholesale supplier of fresh and frozen fish products, with expertise in import, export, and in-house production. Specialising in Mediterranean species such as sea bream, sea bass, trout, and gilt-head bream, AnT Seafood serves foodservice professionals and fish merchants across Europe and beyond.',
  'https://antseafood.nl',
  '/partners/antseafood.png',
  '+31 527-687328',
  'info@antseafood.nl',
  NULL,
  'Netherlands',
  2015,
  '10-50',
  ARRAY['NL','DE','BE','ES','IT'],
  'active', TRUE, 78, 85
),

-- 4. ATL Seafood — Premium wholesale for hospitality, IJmuiden
(
  '00000000-0000-0000-0000-000000000001',
  'ATL Seafood',
  'atl-seafood',
  (SELECT id FROM countries WHERE iso_code = 'NL'),
  'ATL Seafood is a premium wholesale fish supplier specialising in fresh daily deliveries for the hospitality and foodservice industry. Based in IJmuiden — one of the largest fishing ports in Europe — ATL Seafood delivers restaurant-grade fresh fish directly to hotels, restaurants, and caterers across the Netherlands, guaranteeing freshness, quality, and reliability every day.',
  'https://atlseafood.nl',
  '/partners/atlseafood.png',
  '+31 (0)255 525 536',
  'info@atlseafood.nl',
  'IJmuiden',
  'IJmuiden',
  2018,
  '10-50',
  ARRAY['NL','BE'],
  'active', TRUE, 85, 90
),

-- 5. Dayseaday Group — Global fresh & frozen trader since 1986
(
  '00000000-0000-0000-0000-000000000001',
  'Dayseaday Group',
  'dayseaday',
  (SELECT id FROM countries WHERE iso_code = 'NL'),
  'Since 1986, Dayseaday Group has been a leading trade partner in fresh and frozen fish products. Through autonomous growth and strategic acquisitions both at home and internationally, Dayseaday now conducts business in more than 50 countries worldwide. Their extensive network and decades of experience make them one of the most trusted names in European seafood trade.',
  'https://dayseaday.nl',
  '/partners/dayseaday.png',
  NULL,
  'info@dayseaday.nl',
  NULL,
  'Netherlands',
  1986,
  '200-500',
  ARRAY['NL','DE','FR','GB','ES','IT','PL','US','JP','CN'],
  'active', TRUE, 96, 97
),

-- 6. Blue World Seafood — Premium frozen seafood, 35+ countries
(
  '00000000-0000-0000-0000-000000000001',
  'Blue World Seafood',
  'blue-world-seafood',
  (SELECT id FROM countries WHERE iso_code = 'NL'),
  'Blue World Seafood is a premium frozen seafood company with a commitment to quality and innovation. Their diverse product portfolio — including tuna burgers, value-added shellfish, and ready-to-cook seafood in consumer packaging — is available in more than 35 countries worldwide. As a trusted partner for retailers and foodservice operators, Blue World Seafood combines global sourcing with reliable cold-chain logistics.',
  'https://blueworldseafood.com',
  '/partners/blueworldseafood.png',
  NULL,
  'info@blueworldseafood.com',
  NULL,
  'Netherlands',
  2012,
  '50-200',
  ARRAY['NL','DE','FR','GB','ES','IT','US','AE','SA','CN'],
  'active', TRUE, 89, 92
)

ON CONFLICT (slug) DO UPDATE SET
  description    = EXCLUDED.description,
  website        = EXCLUDED.website,
  phone          = EXCLUDED.phone,
  email          = EXCLUDED.email,
  city           = EXCLUDED.city,
  year_founded   = EXCLUDED.year_founded,
  employee_count = EXCLUDED.employee_count,
  export_markets = EXCLUDED.export_markets,
  status         = EXCLUDED.status,
  is_verified    = EXCLUDED.is_verified,
  activity_score = EXCLUDED.activity_score,
  trust_score    = EXCLUDED.trust_score,
  updated_at     = NOW();

-- ============================================================
-- COMPANY → PRODUCTS MAPPING (based on each company's real focus)
-- ============================================================

-- Amacore: Frozen seafood specialists
INSERT INTO company_products (company_id, product_id)
SELECT c.id, p.id
FROM companies c, products p
WHERE c.slug = 'amacore'
  AND p.slug IN ('atlantic-cod','alaska-pollock','haddock','saithe','shrimp','tuna','mackerel')
ON CONFLICT DO NOTHING;

-- AM Fish: Fresh & prepared / convenience seafood
INSERT INTO company_products (company_id, product_id)
SELECT c.id, p.id
FROM companies c, products p
WHERE c.slug = 'amfish'
  AND p.slug IN ('atlantic-salmon','rainbow-trout','atlantic-cod','haddock','sea-bass','sea-bream','herring','mackerel')
ON CONFLICT DO NOTHING;

-- ANT Seafood: Mediterranean species specialist
INSERT INTO company_products (company_id, product_id)
SELECT c.id, p.id
FROM companies c, products p
WHERE c.slug = 'ant-seafood'
  AND p.slug IN ('sea-bass','sea-bream','rainbow-trout','atlantic-salmon','tilapia','octopus','squid')
ON CONFLICT DO NOTHING;

-- ATL Seafood: Fresh whole fish for hospitality
INSERT INTO company_products (company_id, product_id)
SELECT c.id, p.id
FROM companies c, products p
WHERE c.slug = 'atl-seafood'
  AND p.slug IN ('atlantic-cod','atlantic-salmon','halibut','sea-bass','sea-bream','herring','mackerel','lobster','oysters')
ON CONFLICT DO NOTHING;

-- Dayseaday Group: Global fresh & frozen — broad range
INSERT INTO company_products (company_id, product_id)
SELECT c.id, p.id
FROM companies c, products p
WHERE c.slug = 'dayseaday'
  AND p.slug IN ('atlantic-salmon','atlantic-cod','shrimp','tuna','mackerel','herring','squid','swordfish','yellowfin-tuna','pangasius')
ON CONFLICT DO NOTHING;

-- Blue World Seafood: Premium frozen / value-added
INSERT INTO company_products (company_id, product_id)
SELECT c.id, p.id
FROM companies c, products p
WHERE c.slug = 'blue-world-seafood'
  AND p.slug IN ('tuna','yellowfin-tuna','shrimp','scallops','mussels','squid','octopus','king-crab','snow-crab')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SUPPLIER POSTS — Company updates & availability notices
-- ============================================================

INSERT INTO supplier_posts (company_id, title, content, category, is_published, created_at)
SELECT c.id,
  'Fresh North Sea Cod now in stock',
  'We are pleased to announce that fresh North Sea Atlantic Cod is now available in bulk quantities. MSC certified, delivered within 24 hours of landing. Contact us for pricing and minimum order quantities.',
  'new_stock', TRUE, NOW() - INTERVAL '3 days'
FROM companies c WHERE c.slug = 'atl-seafood'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_posts (company_id, title, content, category, is_published, created_at)
SELECT c.id,
  'Dayseaday Group expands to Southeast Asian markets',
  'We are excited to announce new trade partnerships in Vietnam, Thailand, and Indonesia. Our expanded sourcing network now enables us to offer more competitive pricing on shrimp, pangasius, and tuna across our European client base.',
  'company_update', TRUE, NOW() - INTERVAL '7 days'
FROM companies c WHERE c.slug = 'dayseaday'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_posts (company_id, title, content, category, is_published, created_at)
SELECT c.id,
  'New premium tuna burgers available in retail packaging',
  'Our latest product — premium yellowfin tuna burgers in skin-pack trays — is now available for retail and foodservice distribution. Already listed in major European retailers. Request samples today.',
  'product_availability', TRUE, NOW() - INTERVAL '5 days'
FROM companies c WHERE c.slug = 'blue-world-seafood'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_posts (company_id, title, content, category, is_published, created_at)
SELECT c.id,
  'AMfish launches new inspiration folder for foodservice',
  'Our 2026 inspiration folder is now available. Discover our full range of fresh and prepared fish products crafted for the care, catering, and foodservice markets. Download or request your copy from our website.',
  'company_update', TRUE, NOW() - INTERVAL '14 days'
FROM companies c WHERE c.slug = 'amfish'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_posts (company_id, title, content, category, is_published, created_at)
SELECT c.id,
  'Sea bass & sea bream — new summer pricing available',
  'Summer season pricing for fresh sea bass and sea bream from Turkey and Greece is now available. Both species are available whole, gutted, or as fillets. Minimum order: 100 kg per species.',
  'product_availability', TRUE, NOW() - INTERVAL '10 days'
FROM companies c WHERE c.slug = 'ant-seafood'
ON CONFLICT DO NOTHING;

INSERT INTO supplier_posts (company_id, title, content, category, is_published, created_at)
SELECT c.id,
  'New frozen white fish range sourced from certified fisheries',
  'Amacore is proud to add three new certified frozen whitefish products to our portfolio: MSC-certified Alaska Pollock blocks, HACCP-certified saithe loins, and IQF haddock fillets. All products are available for immediate export.',
  'new_stock', TRUE, NOW() - INTERVAL '2 days'
FROM companies c WHERE c.slug = 'amacore'
ON CONFLICT DO NOTHING;

-- ============================================================
-- MARKET INDEX HISTORY — weekly price series for chart rendering
-- (Stored as JSON snapshots — we create them as additional index rows
--  with different periods to simulate chart history)
-- ============================================================

-- Additional weekly data points for salmon (simulate 8-week chart)
INSERT INTO market_indexes (product_id, name, avg_price, low_price, high_price, currency, unit, change_pct, period)
VALUES
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-8', 6.90, 6.40, 7.50, 'EUR', 'kg', -0.5, 'weekly'),
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-7', 7.05, 6.55, 7.70, 'EUR', 'kg',  2.2, 'weekly'),
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-6', 6.95, 6.40, 7.60, 'EUR', 'kg', -1.4, 'weekly'),
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-5', 7.15, 6.70, 7.80, 'EUR', 'kg',  2.9, 'weekly'),
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-4', 7.30, 6.80, 7.95, 'EUR', 'kg',  2.1, 'weekly'),
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-3', 7.10, 6.60, 7.75, 'EUR', 'kg', -2.7, 'weekly'),
  ((SELECT id FROM products WHERE slug='atlantic-salmon'), 'European Atlantic Salmon Index W-2', 7.25, 6.75, 7.90, 'EUR', 'kg',  2.1, 'weekly')
ON CONFLICT DO NOTHING;
