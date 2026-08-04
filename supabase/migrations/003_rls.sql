-- ============================================================
-- FishMarketCap — Migration 003: Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_posts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_indexes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE news             ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_suppliers  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TABLE: users
-- ============================================================

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Admins can read all users
CREATE POLICY "users_select_admin"
  ON users FOR SELECT
  USING (get_user_role() = 'admin');

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Insert is handled by the auth trigger
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- TABLE: countries (publicly readable)
-- ============================================================
CREATE POLICY "countries_public_read"
  ON countries FOR SELECT
  USING (TRUE);

CREATE POLICY "countries_admin_write"
  ON countries FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: products (publicly readable)
-- ============================================================
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (TRUE);

CREATE POLICY "products_admin_write"
  ON products FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: companies
-- ============================================================

-- Public can read active companies
CREATE POLICY "companies_public_read"
  ON companies FOR SELECT
  USING (status = 'active');

-- Suppliers can read their own company regardless of status
CREATE POLICY "companies_owner_read"
  ON companies FOR SELECT
  USING (owner_id = auth.uid());

-- Suppliers can insert their own company
CREATE POLICY "companies_supplier_insert"
  ON companies FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND get_user_role() = 'supplier');

-- Suppliers can update their own company
CREATE POLICY "companies_supplier_update"
  ON companies FOR UPDATE
  USING (owner_id = auth.uid() AND get_user_role() = 'supplier');

-- Admin full access
CREATE POLICY "companies_admin_all"
  ON companies FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: company_products
-- ============================================================

-- Public read
CREATE POLICY "company_products_public_read"
  ON company_products FOR SELECT
  USING (TRUE);

-- Supplier can manage their own company's products
CREATE POLICY "company_products_supplier_write"
  ON company_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_products.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- Admin
CREATE POLICY "company_products_admin_all"
  ON company_products FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: certificates
-- ============================================================

-- Public can read certificates
CREATE POLICY "certificates_public_read"
  ON certificates FOR SELECT
  USING (TRUE);

-- Supplier can manage their own company's certificates
CREATE POLICY "certificates_supplier_write"
  ON certificates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = certificates.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- Admin
CREATE POLICY "certificates_admin_all"
  ON certificates FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: supplier_posts
-- ============================================================

-- Public read published posts
CREATE POLICY "posts_public_read"
  ON supplier_posts FOR SELECT
  USING (is_published = TRUE);

-- Supplier can read own posts (published or not)
CREATE POLICY "posts_supplier_read_own"
  ON supplier_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = supplier_posts.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- Supplier can write own posts
CREATE POLICY "posts_supplier_write"
  ON supplier_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = supplier_posts.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- Admin
CREATE POLICY "posts_admin_all"
  ON supplier_posts FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: buyer_requests
-- ============================================================

-- Open requests are readable by suppliers and admins
CREATE POLICY "requests_read_open"
  ON buyer_requests FOR SELECT
  USING (
    status = 'open'
    AND (
      get_user_role() IN ('supplier', 'admin')
      OR user_id = auth.uid()
    )
  );

-- Buyers can read their own requests
CREATE POLICY "requests_buyer_read_own"
  ON buyer_requests FOR SELECT
  USING (user_id = auth.uid());

-- Buyers can create requests
CREATE POLICY "requests_buyer_insert"
  ON buyer_requests FOR INSERT
  WITH CHECK (user_id = auth.uid() AND get_user_role() = 'buyer');

-- Buyers can update/delete their own requests
CREATE POLICY "requests_buyer_modify"
  ON buyer_requests FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "requests_buyer_delete"
  ON buyer_requests FOR DELETE
  USING (user_id = auth.uid());

-- Admin
CREATE POLICY "requests_admin_all"
  ON buyer_requests FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: market_indexes (publicly readable)
-- ============================================================
CREATE POLICY "indexes_public_read"
  ON market_indexes FOR SELECT
  USING (TRUE);

CREATE POLICY "indexes_admin_write"
  ON market_indexes FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: market_history (publicly readable)
-- ============================================================
CREATE POLICY "history_public_read"
  ON market_history FOR SELECT
  USING (TRUE);

CREATE POLICY "history_admin_write"
  ON market_history FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: news
-- ============================================================

-- Public can read published news
CREATE POLICY "news_public_read"
  ON news FOR SELECT
  USING (is_published = TRUE);

-- Admin full access
CREATE POLICY "news_admin_all"
  ON news FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TABLE: saved_suppliers
-- ============================================================

-- Buyers can see their own saved suppliers
CREATE POLICY "saved_buyer_read"
  ON saved_suppliers FOR SELECT
  USING (buyer_id = auth.uid());

-- Buyers can save/unsave suppliers
CREATE POLICY "saved_buyer_insert"
  ON saved_suppliers FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "saved_buyer_delete"
  ON saved_suppliers FOR DELETE
  USING (buyer_id = auth.uid());

-- Admin
CREATE POLICY "saved_admin_all"
  ON saved_suppliers FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- TRIGGER: auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'buyer';
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'supplier' THEN
    assigned_role := 'supplier';
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.users (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.users (id, role)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
