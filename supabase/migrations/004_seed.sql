-- ============================================================
-- FishMarketCap — Migration 004: Seed Data
-- ============================================================

-- ============================================================
-- COUNTRIES
-- ============================================================
INSERT INTO countries (name, slug, flag_emoji, region, iso_code, is_featured) VALUES
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
  ('Mauritania',       'mauritania',       '🇲🇷', 'Africa',          'MR', FALSE);

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (name, slug, category, unit, is_featured) VALUES
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
  ('Swordfish',             'swordfish',             'Pelagic',    'kg',  FALSE);

-- ============================================================
-- MARKET INDEXES (sample — product_id resolved by subquery)
-- ============================================================
INSERT INTO market_indexes (product_id, name, avg_price, low_price, high_price, currency, unit, change_pct, period)
VALUES
  (
    (SELECT id FROM products WHERE slug = 'atlantic-salmon'),
    'European Atlantic Salmon Index',
    7.40, 6.80, 8.10, 'EUR', 'kg', 2.3, 'weekly'
  ),
  (
    (SELECT id FROM products WHERE slug = 'atlantic-cod'),
    'North Atlantic Cod Index',
    4.20, 3.70, 4.90, 'EUR', 'kg', -1.1, 'weekly'
  ),
  (
    (SELECT id FROM products WHERE slug = 'shrimp'),
    'Global Shrimp Index',
    5.80, 5.10, 6.50, 'USD', 'kg', 0.8, 'weekly'
  ),
  (
    (SELECT id FROM products WHERE slug = 'mackerel'),
    'Northeast Atlantic Mackerel Index',
    1.95, 1.70, 2.20, 'EUR', 'kg', -0.5, 'weekly'
  ),
  (
    (SELECT id FROM products WHERE slug = 'tuna'),
    'Global Tuna Index',
    9.20, 8.50, 10.10, 'USD', 'kg', 1.4, 'weekly'
  );

-- ============================================================
-- NEWS (sample articles — author_id is NULL for system articles)
-- ============================================================
INSERT INTO news (title, slug, summary, content, category, is_featured, is_published, published_at) VALUES
  (
    'European Salmon Prices Rise Amid Supply Constraints',
    'european-salmon-prices-rise-2024',
    'Atlantic salmon prices in the European spot market rose 2.3% this week, driven by lower harvesting volumes from Norway.',
    'Atlantic salmon prices in the European spot market rose 2.3% this week, driven by lower harvesting volumes from Norway due to adverse weather conditions affecting key farming regions in Trondheim and Møre og Romsdal. Traders are closely watching Norwegian export data for the coming weeks.',
    'Market Analysis', TRUE, TRUE, NOW() - INTERVAL '2 days'
  ),
  (
    'Vietnam Seafood Exports Surge 15% in Q3',
    'vietnam-seafood-exports-surge-q3',
    'Vietnam''s seafood export revenue reached $2.8 billion in Q3, up 15% year-on-year, driven by shrimp and pangasius.',
    'Vietnam''s seafood export revenue reached $2.8 billion in Q3, a 15% increase year-on-year. Shrimp exports led the growth, accounting for 42% of total revenue, followed by pangasius at 28%. Key markets include the United States, China, Japan, and the EU.',
    'Trade News', FALSE, TRUE, NOW() - INTERVAL '5 days'
  ),
  (
    'Global King Crab Quotas Cut by 30% for Upcoming Season',
    'king-crab-quotas-cut-2024',
    'Norwegian and Russian authorities have agreed to significantly reduce king crab fishing quotas for the 2024–25 season.',
    'Norwegian and Russian fishery management authorities have agreed to reduce Barents Sea king crab fishing quotas by approximately 30% for the 2024–25 season. This decision follows stock assessment surveys indicating a decline in mature male crab biomass.',
    'Regulations', TRUE, TRUE, NOW() - INTERVAL '10 days'
  ),
  (
    'New ASC Group Certification Standard Launched for Small Farms',
    'asc-group-certification-small-farms',
    'The Aquaculture Stewardship Council has launched a new group certification pathway designed specifically for small-scale farms.',
    'The Aquaculture Stewardship Council (ASC) has launched a new group certification pathway designed specifically for small-scale farms in developing countries. The initiative aims to make ASC certification more accessible and affordable for cooperatives of small producers.',
    'Sustainability', FALSE, TRUE, NOW() - INTERVAL '15 days'
  );
