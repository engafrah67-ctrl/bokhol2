-- ============================================================
-- FishMarketCap — Migration 002: Indexes
-- Performance optimization indexes
-- ============================================================

-- ── users ───────────────────────────────────────────────────
CREATE INDEX idx_users_role        ON users(role);
CREATE INDEX idx_users_company_id  ON users(company_id);

-- ── companies ───────────────────────────────────────────────
CREATE INDEX idx_companies_slug        ON companies(slug);
CREATE INDEX idx_companies_country_id  ON companies(country_id);
CREATE INDEX idx_companies_owner_id    ON companies(owner_id);
CREATE INDEX idx_companies_status      ON companies(status);
CREATE INDEX idx_companies_activity    ON companies(activity_score DESC);
CREATE INDEX idx_companies_trust       ON companies(trust_score DESC);

-- ── company_products ────────────────────────────────────────
CREATE INDEX idx_company_products_company  ON company_products(company_id);
CREATE INDEX idx_company_products_product  ON company_products(product_id);

-- ── certificates ────────────────────────────────────────────
CREATE INDEX idx_certificates_company  ON certificates(company_id);
CREATE INDEX idx_certificates_type     ON certificates(type);

-- ── supplier_posts ──────────────────────────────────────────
CREATE INDEX idx_posts_company     ON supplier_posts(company_id);
CREATE INDEX idx_posts_category    ON supplier_posts(category);
CREATE INDEX idx_posts_product     ON supplier_posts(product_id);
CREATE INDEX idx_posts_published   ON supplier_posts(is_published, created_at DESC);

-- ── buyer_requests ──────────────────────────────────────────
CREATE INDEX idx_requests_user       ON buyer_requests(user_id);
CREATE INDEX idx_requests_product    ON buyer_requests(product_id);
CREATE INDEX idx_requests_country    ON buyer_requests(country_id);
CREATE INDEX idx_requests_status     ON buyer_requests(status);
CREATE INDEX idx_requests_created    ON buyer_requests(created_at DESC);

-- ── market_indexes ──────────────────────────────────────────
CREATE INDEX idx_indexes_product   ON market_indexes(product_id);
CREATE INDEX idx_indexes_country   ON market_indexes(country_id);

-- ── market_history ──────────────────────────────────────────
CREATE INDEX idx_history_index_id     ON market_history(index_id);
CREATE INDEX idx_history_recorded_at  ON market_history(recorded_at DESC);

-- ── news ────────────────────────────────────────────────────
CREATE INDEX idx_news_slug         ON news(slug);
CREATE INDEX idx_news_category     ON news(category);
CREATE INDEX idx_news_published    ON news(is_published, published_at DESC);
CREATE INDEX idx_news_featured     ON news(is_featured) WHERE is_featured = TRUE;

-- ── saved_suppliers ─────────────────────────────────────────
CREATE INDEX idx_saved_buyer    ON saved_suppliers(buyer_id);
CREATE INDEX idx_saved_company  ON saved_suppliers(company_id);

-- ── countries ───────────────────────────────────────────────
CREATE INDEX idx_countries_slug     ON countries(slug);
CREATE INDEX idx_countries_region   ON countries(region);
CREATE INDEX idx_countries_featured ON countries(is_featured) WHERE is_featured = TRUE;

-- ── products ────────────────────────────────────────────────
CREATE INDEX idx_products_slug      ON products(slug);
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_featured  ON products(is_featured) WHERE is_featured = TRUE;
