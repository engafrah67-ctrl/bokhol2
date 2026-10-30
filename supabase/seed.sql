-- ============================================================
-- FishMarketCap / Bokhol — Reference data (run AFTER the schema)
-- Safe to re-run: every insert is idempotent.
-- ============================================================

BEGIN;

-- ── Countries ───────────────────────────────────────────────
INSERT INTO public.countries (name, slug, flag_emoji, region, iso_code, is_featured) VALUES
  ('Norway',           'norway',           '🇳🇴', 'Europe',          'NO', TRUE),
  ('Iceland',          'iceland',          '🇮🇸', 'Europe',          'IS', TRUE),
  ('Chile',            'chile',            '🇨🇱', 'Americas',        'CL', TRUE),
  ('China',            'china',            '🇨🇳', 'Asia',            'CN', TRUE),
  ('Japan',            'japan',            '🇯🇵', 'Asia',            'JP', TRUE),
  ('United States',    'united-states',    '🇺🇸', 'Americas',        'US', TRUE),
  ('Canada',           'canada',           '🇨🇦', 'Americas',        'CA', FALSE),
  ('Denmark',          'denmark',          '🇩🇰', 'Europe',          'DK', TRUE),
  ('Netherlands',      'netherlands',      '🇳🇱', 'Europe',          'NL', FALSE),
  ('Spain',            'spain',            '🇪🇸', 'Europe',          'ES', FALSE),
  ('Portugal',         'portugal',         '🇵🇹', 'Europe',          'PT', FALSE),
  ('Russia',           'russia',           '🇷🇺', 'Europe',          'RU', FALSE),
  ('Vietnam',          'vietnam',          '🇻🇳', 'Asia',            'VN', TRUE),
  ('India',            'india',            '🇮🇳', 'Asia',            'IN', FALSE),
  ('Thailand',         'thailand',         '🇹🇭', 'Asia',            'TH', FALSE),
  ('Indonesia',        'indonesia',        '🇮🇩', 'Asia',            'ID', FALSE),
  ('Morocco',          'morocco',          '🇲🇦', 'Africa',          'MA', FALSE),
  ('Senegal',          'senegal',          '🇸🇳', 'Africa',          'SN', FALSE),
  ('Peru',             'peru',             '🇵🇪', 'Americas',        'PE', FALSE),
  ('Ecuador',          'ecuador',          '🇪🇨', 'Americas',        'EC', FALSE),
  ('South Korea',      'south-korea',      '🇰🇷', 'Asia',            'KR', FALSE),
  ('Australia',        'australia',        '🇦🇺', 'Oceania',         'AU', FALSE),
  ('New Zealand',      'new-zealand',      '🇳🇿', 'Oceania',         'NZ', FALSE),
  ('United Kingdom',   'united-kingdom',   '🇬🇧', 'Europe',          'GB', FALSE),
  ('France',           'france',           '🇫🇷', 'Europe',          'FR', FALSE),
  ('Germany',          'germany',          '🇩🇪', 'Europe',          'DE', FALSE),
  ('Poland',           'poland',           '🇵🇱', 'Europe',          'PL', FALSE),
  ('Turkey',           'turkey',           '🇹🇷', 'Europe/Asia',     'TR', FALSE),
  ('Brazil',           'brazil',           '🇧🇷', 'Americas',        'BR', FALSE),
  ('Argentina',        'argentina',        '🇦🇷', 'Americas',        'AR', FALSE),
  ('Somalia',          'somalia',          '🇸🇴', 'Africa',          'SO', FALSE),
  ('Mauritania',       'mauritania',       '🇲🇷', 'Africa',          'MR', FALSE),
  ('Belgium',          'belgium',          '🇧🇪', 'Europe',          'BE', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Featured supplier markets
UPDATE public.countries SET is_featured = TRUE WHERE name IN ('Netherlands', 'Germany', 'Belgium', 'Norway');

-- ── Product catalog ─────────────────────────────────────────
INSERT INTO public.products (name, slug, category, unit, is_featured) VALUES
  ('Atlantic Salmon',       'atlantic-salmon',       'Salmonids',  'kg',  TRUE),
  ('Pacific Salmon',        'pacific-salmon',        'Salmonids',  'kg',  FALSE),
  ('Rainbow Trout',         'rainbow-trout',         'Salmonids',  'kg',  FALSE),
  ('Atlantic Cod',          'atlantic-cod',           'Whitefish',  'kg',  TRUE),
  ('Alaska Pollock',        'alaska-pollock',        'Whitefish',  'kg',  FALSE),
  ('Haddock',               'haddock',               'Whitefish',  'kg',  FALSE),
  ('Halibut',               'halibut',               'Whitefish',  'kg',  FALSE),
  ('Saithe',                'saithe',                'Whitefish',  'kg',  FALSE),
  ('Whiting',               'whiting',               'Whitefish',  'kg',  FALSE),
  ('Herring',               'herring',               'Pelagic',    'kg',  FALSE),
  ('Mackerel',              'mackerel',              'Pelagic',    'kg',  TRUE),
  ('Sardines',              'sardines',              'Pelagic',    'kg',  FALSE),
  ('Tuna',                  'tuna',                  'Pelagic',    'kg',  TRUE),
  ('Anchovies',             'anchovies',             'Pelagic',    'kg',  FALSE),
  ('Shrimp',                'shrimp',                'Shellfish',  'kg',  TRUE),
  ('King Crab',             'king-crab',             'Shellfish',  'kg',  TRUE),
  ('Snow Crab',             'snow-crab',             'Shellfish',  'kg',  FALSE),
  ('Lobster',               'lobster',               'Shellfish',  'kg',  FALSE),
  ('Scallops',              'scallops',              'Shellfish',  'kg',  FALSE),
  ('Oysters',               'oysters',               'Shellfish',  'kg',  FALSE),
  ('Mussels',               'mussels',               'Shellfish',  'kg',  FALSE),
  ('Clams',                 'clams',                 'Shellfish',  'kg',  FALSE),
  ('Squid',                 'squid',                 'Cephalopods','kg',  FALSE),
  ('Octopus',               'octopus',               'Cephalopods','kg',  FALSE),
  ('Tilapia',               'tilapia',               'Freshwater', 'kg',  FALSE),
  ('Pangasius / Catfish',   'pangasius',             'Freshwater', 'kg',  FALSE),
  ('Sea Bass',              'sea-bass',              'Whitefish',  'kg',  FALSE),
  ('Sea Bream',             'sea-bream',             'Whitefish',  'kg',  FALSE),
  ('Yellowfin Tuna',        'yellowfin-tuna',        'Pelagic',    'kg',  FALSE),
  ('Swordfish',             'swordfish',             'Pelagic',    'kg',  FALSE)
ON CONFLICT (slug) DO NOTHING;

-- ── Partner buyers (logos live in /public/partners/buyers) ──
INSERT INTO public.partner_buyers (name, logo_url, country) VALUES
  ('Van der Valk',           '/partners/buyers/van-der-valk.png',   'Netherlands'),
  ('Tasty Food',             '/partners/buyers/tasty-food.png',      'Belgium'),
  ('Horeca Club Antwerpen',  '/partners/buyers/horeca-club.png',     'Belgium'),
  ('CPH Hotels',             '/partners/buyers/cph-hotels.png',      'Germany'),
  ('Kluth Hotel Hameln',     '/partners/buyers/klut-hotel.png',      'Germany'),
  ('NH Hotels',              '/partners/buyers/nh-hotels.png',       'Spain'),
  ('Alexander Hotel',        '/partners/buyers/alexander-hotel.png', 'Netherlands'),
  ('Hokkai',                 '/partners/buyers/hokkai.png',          'Netherlands'),
  ('NLG Restaurant',         '/partners/buyers/nlg-restaurant.png',  'Germany')
ON CONFLICT (name) DO NOTHING;

-- ── Home-page seafood index ─────────────────────────────────
INSERT INTO public.seafood_index_items
  (id, slug, label, currency, unit, latest_price, monthly_change_pct, month_high, month_low,
   source, active_offers_count, color, data, sort_order)
VALUES
  ('bluefin-tuna', 'bluefin-tuna', 'Bluefin Tuna', 'EUR', 'kg', 24, 2.1, 25.44, 22.56, 'EU Spot Market Average', 3, '#1d4ed8', '[{"week":"Jan","price":20.5},{"week":"Feb","price":21},{"week":"Mar","price":21.8},{"week":"Apr","price":22.4},{"week":"May","price":22.1},{"week":"Jun","price":23},{"week":"Jul","price":23.5},{"week":"Aug","price":23.2},{"week":"Sep","price":23.8},{"week":"Oct","price":24},{"week":"Nov","price":24.5},{"week":"Dec","price":24}]'::jsonb, 0),
  ('cod', 'cod', 'Cod', 'EUR', 'kg', 5.8, -1.1, 6.4, 5.4, 'EU Spot Market Average', 4, '#3b82f6', '[{"week":"Jan","price":6.4},{"week":"Feb","price":6.2},{"week":"Mar","price":6.1},{"week":"Apr","price":6},{"week":"May","price":5.9},{"week":"Jun","price":5.8},{"week":"Jul","price":5.7},{"week":"Aug","price":5.75},{"week":"Sep","price":5.65},{"week":"Oct","price":5.7},{"week":"Nov","price":5.75},{"week":"Dec","price":5.8}]'::jsonb, 1),
  ('atlantic-salmon', 'atlantic-salmon', 'Atlantic Salmon', 'EUR', 'kg', 8.4, 2.3, 8.9, 7.5, 'EU Spot Market Average', 5, '#f97316', '[{"week":"Jan","price":7.5},{"week":"Feb","price":7.6},{"week":"Mar","price":7.75},{"week":"Apr","price":7.9},{"week":"May","price":8},{"week":"Jun","price":8.1},{"week":"Jul","price":8.2},{"week":"Aug","price":8.1},{"week":"Sep","price":8.3},{"week":"Oct","price":8.4},{"week":"Nov","price":8.6},{"week":"Dec","price":8.4}]'::jsonb, 2),
  ('fresh-fish', 'fresh-fish', 'Fresh Fish', 'EUR', 'kg', 4.2, 0.8, 4.6, 3.8, 'EU Spot Market Average', 2, '#0d9488', '[{"week":"Jan","price":3.8},{"week":"Feb","price":3.9},{"week":"Mar","price":3.95},{"week":"Apr","price":4},{"week":"May","price":4.1},{"week":"Jun","price":4.15},{"week":"Jul","price":4.2},{"week":"Aug","price":4.1},{"week":"Sep","price":4.2},{"week":"Oct","price":4.25},{"week":"Nov","price":4.3},{"week":"Dec","price":4.2}]'::jsonb, 3),
  ('yellowfin-tuna', 'yellowfin-tuna', 'Yellowfin Tuna', 'EUR', 'kg', 11.5, 1.8, 12.2, 10.5, 'EU Spot Market Average', 3, '#0284c7', '[{"week":"Jan","price":10.5},{"week":"Feb","price":10.7},{"week":"Mar","price":10.9},{"week":"Apr","price":11},{"week":"May","price":11.1},{"week":"Jun","price":11.2},{"week":"Jul","price":11.3},{"week":"Aug","price":11.2},{"week":"Sep","price":11.4},{"week":"Oct","price":11.5},{"week":"Nov","price":11.7},{"week":"Dec","price":11.5}]'::jsonb, 4)
ON CONFLICT (id) DO NOTHING;

COMMIT;
