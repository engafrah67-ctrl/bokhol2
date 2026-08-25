-- ============================================================
-- FishMarketCap — Migration 001: Schema
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('guest', 'buyer', 'supplier', 'admin');
CREATE TYPE company_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE post_category AS ENUM (
  'product_availability',
  'new_stock',
  'shipment',
  'certification',
  'company_update',
  'trade_event'
);
CREATE TYPE request_status AS ENUM ('open', 'closed', 'fulfilled');
CREATE TYPE certificate_type AS ENUM ('ASC', 'MSC', 'HACCP', 'ISO_22000', 'BRC', 'GlobalGAP', 'other');

-- ============================================================
-- TABLE: users
-- Extended profile linked to Supabase auth.users
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'buyer',
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  company_id    UUID,  -- FK added after companies table
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: countries
-- ============================================================
CREATE TABLE countries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  flag_emoji    TEXT,
  region        TEXT,           -- e.g. 'Europe', 'Asia', 'Americas'
  iso_code      CHAR(2) UNIQUE, -- ISO 3166-1 alpha-2
  description   TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: products
-- Seafood product categories
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  category      TEXT,           -- e.g. 'Whitefish', 'Shellfish', 'Pelagic'
  description   TEXT,
  image_url     TEXT,
  unit          TEXT NOT NULL DEFAULT 'kg',  -- kg, ton, piece
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: companies
-- Supplier and buyer company profiles
-- ============================================================
CREATE TABLE companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  country_id        UUID REFERENCES countries(id) ON DELETE SET NULL,
  description       TEXT,
  website           TEXT,
  logo_url          TEXT,
  phone             TEXT,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  year_founded      INT,
  employee_count    TEXT,       -- e.g. '10-50', '50-200'
  export_markets    TEXT[],     -- array of country ISO codes
  status            company_status NOT NULL DEFAULT 'pending',
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  activity_score    INT NOT NULL DEFAULT 0,
  trust_score       INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from users.company_id to companies
ALTER TABLE users ADD CONSTRAINT fk_users_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE: company_products
-- Many-to-many: companies <-> products
-- ============================================================
CREATE TABLE company_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, product_id)
);

-- ============================================================
-- TABLE: certificates
-- Certifications held by companies
-- ============================================================
CREATE TABLE certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type            certificate_type NOT NULL,
  issuer          TEXT,
  certificate_no  TEXT,
  issued_at       DATE,
  expires_at      DATE,
  document_url    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: supplier_posts
-- Activity posts made by suppliers
-- ============================================================
CREATE TABLE supplier_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category      post_category NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT,
  image_urls    TEXT[],
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  country_id    UUID REFERENCES countries(id) ON DELETE SET NULL,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: buyer_requests
-- Buying requests submitted by buyers
-- ============================================================
CREATE TABLE buyer_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  country_id      UUID REFERENCES countries(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  quantity        NUMERIC,
  quantity_unit   TEXT DEFAULT 'kg',
  target_price    NUMERIC,
  currency        CHAR(3) DEFAULT 'USD',
  destination     TEXT,
  status          request_status NOT NULL DEFAULT 'open',
  expires_at      DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: market_indexes
-- Current price index per product (and optionally per country)
-- ============================================================
CREATE TABLE market_indexes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  country_id      UUID REFERENCES countries(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,       -- e.g. "European Salmon Index"
  avg_price       NUMERIC NOT NULL,
  low_price       NUMERIC NOT NULL,
  high_price      NUMERIC NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  unit            TEXT NOT NULL DEFAULT 'kg',
  change_pct      NUMERIC,             -- % change from last period
  period          TEXT NOT NULL DEFAULT 'weekly',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: market_history
-- Historical price records for charting trends
-- ============================================================
CREATE TABLE market_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id        UUID NOT NULL REFERENCES market_indexes(id) ON DELETE CASCADE,
  avg_price       NUMERIC NOT NULL,
  low_price       NUMERIC NOT NULL,
  high_price      NUMERIC NOT NULL,
  recorded_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: news
-- Industry news articles
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  summary         TEXT,
  content         TEXT NOT NULL,
  cover_image_url TEXT,
  category        TEXT,
  tags            TEXT[],
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: saved_suppliers
-- Buyers can save/favorite suppliers
-- ============================================================
CREATE TABLE saved_suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, company_id)
);

-- ============================================================
-- AUTO-UPDATE updated_at via trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at    BEFORE UPDATE ON companies    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_countries_updated_at    BEFORE UPDATE ON countries    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at     BEFORE UPDATE ON products     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated_at        BEFORE UPDATE ON supplier_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_requests_updated_at     BEFORE UPDATE ON buyer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_indexes_updated_at      BEFORE UPDATE ON market_indexes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_news_updated_at         BEFORE UPDATE ON news         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
