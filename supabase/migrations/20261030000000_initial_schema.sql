-- ============================================================
-- FishMarketCap / Bokhol — Initial schema (clean install)
-- ============================================================
-- Run once on a NEW Supabase project (SQL Editor → paste → Run),
-- then run supabase/seed.sql. The whole script is one transaction:
-- if any statement fails, nothing is created.
--
-- Security model
--   * Admin is decided ONLY by public.users.role = 'admin'.
--     Signup can never grant admin; users cannot change their own role.
--   * Prices and supplier offers (supplier_posts) are readable only by
--     signed-in users. Visitors get get_public_product_listings(),
--     which returns product names/origins/images only.
--   * Supplier contact columns are hidden from anonymous visitors.
--   * New Supabase projects do not auto-expose tables, so every table
--     gets explicit GRANTs below; RLS then filters rows.
-- ============================================================

BEGIN;

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('guest', 'buyer', 'supplier', 'admin');
CREATE TYPE public.company_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE public.post_category AS ENUM (
  'product_availability',
  'new_stock',
  'shipment',
  'certification',
  'company_update',
  'trade_event'
);
CREATE TYPE public.request_status AS ENUM ('open', 'closed', 'fulfilled');
CREATE TYPE public.certificate_type AS ENUM ('ASC', 'MSC', 'HACCP', 'ISO_22000', 'BRC', 'GlobalGAP', 'other');
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

-- Profile linked 1:1 to auth.users (row created by trigger on signup)
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  role          public.user_role NOT NULL DEFAULT 'buyer',
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  company_id    UUID,  -- FK added after companies
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.countries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  flag_emoji    TEXT,
  region        TEXT,
  iso_code      CHAR(2) UNIQUE,
  description   TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  category      TEXT,
  description   TEXT,
  image_url     TEXT,
  unit          TEXT NOT NULL DEFAULT 'kg',
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- owner_id is NULL for admin-added suppliers that nobody has claimed yet
CREATE TABLE public.companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  country_id        UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  description       TEXT,
  website           TEXT,
  logo_url          TEXT,
  phone             TEXT,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  year_founded      INT,
  employee_count    TEXT,
  export_markets    TEXT[],
  status            public.company_status NOT NULL DEFAULT 'pending',
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  activity_score    INT NOT NULL DEFAULT 0,
  trust_score       INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ADD CONSTRAINT fk_users_company
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE TABLE public.company_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, product_id)
);

CREATE TABLE public.certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type            public.certificate_type NOT NULL,
  issuer          TEXT,
  certificate_no  TEXT,
  issued_at       DATE,
  expires_at      DATE,
  document_url    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product offers. `content` holds the offer JSON (productName, pricePerKg, ...)
CREATE TABLE public.supplier_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category      public.post_category NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT,
  image_urls    TEXT[],
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  country_id    UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.buyer_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  country_id      UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  quantity        NUMERIC,
  quantity_unit   TEXT DEFAULT 'kg',
  target_price    NUMERIC,
  currency        CHAR(3) DEFAULT 'USD',
  destination     TEXT,
  status          public.request_status NOT NULL DEFAULT 'open',
  expires_at      DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.market_indexes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  country_id      UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  avg_price       NUMERIC NOT NULL,
  low_price       NUMERIC NOT NULL,
  high_price      NUMERIC NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  unit            TEXT NOT NULL DEFAULT 'kg',
  change_pct      NUMERIC,
  period          TEXT NOT NULL DEFAULT 'weekly',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.market_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id        UUID NOT NULL REFERENCES public.market_indexes(id) ON DELETE CASCADE,
  avg_price       NUMERIC NOT NULL,
  low_price       NUMERIC NOT NULL,
  high_price      NUMERIC NOT NULL,
  recorded_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin-managed home-page seafood index (replaces seafood-index-overrides.json)
CREATE TABLE public.seafood_index_items (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  label                TEXT NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'EUR',
  unit                 TEXT NOT NULL DEFAULT 'kg',
  latest_price         NUMERIC NOT NULL CHECK (latest_price >= 0),
  monthly_change_pct   NUMERIC NOT NULL DEFAULT 0,
  month_high           NUMERIC NOT NULL CHECK (month_high >= 0),
  month_low            NUMERIC NOT NULL CHECK (month_low >= 0),
  source               TEXT,
  active_offers_count  INT NOT NULL DEFAULT 0 CHECK (active_offers_count >= 0),
  color                TEXT,
  data                 JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{ "week": "Jan", "price": 20.5 }, ...]
  sort_order           INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.news (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
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

CREATE TABLE public.saved_suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, company_id)
);

CREATE TABLE public.partner_buyers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  logo_url    TEXT NOT NULL,
  country     TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A signed-in user asks to take ownership of a supplier profile.
-- No passwords are stored here: the claimant already has a Supabase account.
CREATE TABLE public.profile_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name      TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  job_title         TEXT,
  business_email    TEXT NOT NULL,
  phone             TEXT,
  status            public.claim_status NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  reviewed_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- (UNIQUE columns already have an index and are not repeated)
-- ============================================================
CREATE INDEX idx_users_role               ON public.users(role);
CREATE INDEX idx_users_company_id         ON public.users(company_id);
CREATE INDEX idx_companies_country_id     ON public.companies(country_id);
CREATE INDEX idx_companies_owner_id       ON public.companies(owner_id);
CREATE INDEX idx_companies_status         ON public.companies(status);
CREATE INDEX idx_companies_activity       ON public.companies(activity_score DESC);
CREATE INDEX idx_companies_name_lower     ON public.companies(lower(name));
CREATE INDEX idx_company_products_product ON public.company_products(product_id);
CREATE INDEX idx_certificates_company     ON public.certificates(company_id);
CREATE INDEX idx_posts_company            ON public.supplier_posts(company_id);
CREATE INDEX idx_posts_product            ON public.supplier_posts(product_id);
CREATE INDEX idx_posts_published          ON public.supplier_posts(is_published, created_at DESC);
CREATE INDEX idx_requests_user            ON public.buyer_requests(user_id);
CREATE INDEX idx_requests_status_created  ON public.buyer_requests(status, created_at DESC);
CREATE INDEX idx_requests_product         ON public.buyer_requests(product_id);
CREATE INDEX idx_requests_country         ON public.buyer_requests(country_id);
CREATE INDEX idx_indexes_product          ON public.market_indexes(product_id);
CREATE INDEX idx_indexes_country          ON public.market_indexes(country_id);
CREATE INDEX idx_history_index_recorded   ON public.market_history(index_id, recorded_at DESC);
CREATE INDEX idx_seafood_index_sort       ON public.seafood_index_items(sort_order);
CREATE INDEX idx_news_published           ON public.news(is_published, published_at DESC);
CREATE INDEX idx_news_author              ON public.news(author_id);
CREATE INDEX idx_saved_company            ON public.saved_suppliers(company_id);
CREATE INDEX idx_claims_user              ON public.profile_claims(user_id);
CREATE INDEX idx_claims_company           ON public.profile_claims(company_id);
CREATE INDEX idx_claims_status            ON public.profile_claims(status, created_at DESC);
CREATE INDEX idx_claims_reviewed_by       ON public.profile_claims(reviewed_by);
-- One open claim per company per user
CREATE UNIQUE INDEX uq_claims_pending ON public.profile_claims(company_id, user_id) WHERE status = 'pending';

-- ============================================================
-- HELPER FUNCTIONS
-- SECURITY DEFINER + empty search_path: run with owner rights,
-- immune to search_path hijacking, and avoid RLS recursion.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.users WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_company(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.company_is_claimable(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id IS NULL
  );
$$;

-- Parses post content without ever raising on malformed JSON
CREATE OR REPLACE FUNCTION public.try_jsonb(p_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  RETURN COALESCE(p_text::jsonb, '{}'::jsonb);
EXCEPTION WHEN OTHERS THEN
  RETURN '{}'::jsonb;
END;
$$;

-- True when the statement comes from an API user (anon / authenticated)
-- rather than the SQL editor, migrations, or the service role.
CREATE OR REPLACE FUNCTION public.is_api_user()
RETURNS BOOLEAN
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT auth.role()), '') IN ('anon', 'authenticated');
$$;

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE TRIGGER trg_users_updated_at          BEFORE UPDATE ON public.users               FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_countries_updated_at      BEFORE UPDATE ON public.countries           FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_products_updated_at       BEFORE UPDATE ON public.products            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_companies_updated_at      BEFORE UPDATE ON public.companies           FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_certificates_updated_at   BEFORE UPDATE ON public.certificates        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_posts_updated_at          BEFORE UPDATE ON public.supplier_posts      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_requests_updated_at       BEFORE UPDATE ON public.buyer_requests      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_indexes_updated_at        BEFORE UPDATE ON public.market_indexes      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_seafood_index_updated_at  BEFORE UPDATE ON public.seafood_index_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_news_updated_at           BEFORE UPDATE ON public.news                FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_partner_buyers_updated_at BEFORE UPDATE ON public.partner_buyers      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_claims_updated_at         BEFORE UPDATE ON public.profile_claims      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TRIGGERS: privilege guards
-- ============================================================

-- Users may edit their own name/phone/avatar, but never their role or email,
-- and may only point company_id at a company they own.
CREATE OR REPLACE FUNCTION public.guard_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.is_api_user() AND NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'You are not allowed to change your role' USING ERRCODE = '42501';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Email is managed by authentication' USING ERRCODE = '42501';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id
       AND NEW.company_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.companies WHERE id = NEW.company_id AND owner_id = NEW.id) THEN
      RAISE EXCEPTION 'You can only link a company you own' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_guard BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_update();

-- Non-admins cannot set verification, status, scores or ownership transfer.
CREATE OR REPLACE FUNCTION public.guard_company_write()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.is_api_user() AND NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status         := 'pending';
      NEW.is_verified    := FALSE;
      NEW.activity_score := 0;
      NEW.trust_score    := 0;
    ELSE
      NEW.owner_id       := OLD.owner_id;
      NEW.status         := OLD.status;
      NEW.is_verified    := OLD.is_verified;
      NEW.activity_score := OLD.activity_score;
      NEW.trust_score    := OLD.trust_score;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_companies_guard BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.guard_company_write();

-- ============================================================
-- TRIGGERS: auth.users → public.users
-- Role from signup metadata may only be 'buyer' or 'supplier'.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role public.user_role := 'buyer';
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'supplier' THEN
    v_role := 'supplier';
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_change();

-- ============================================================
-- PUBLIC (VISITOR) READ FUNCTIONS — no prices, no suppliers
-- ============================================================

-- One row per product that currently has published offers.
CREATE OR REPLACE FUNCTION public.get_public_product_listings()
RETURNS TABLE (product_name TEXT, origins TEXT[], image TEXT, last_updated TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH p AS (
    SELECT
      COALESCE(NULLIF(trim(c->>'productName'), ''), trim(split_part(sp.title, ' —', 1))) AS name,
      NULLIF(trim(c->>'countryOfOrigin'), '') AS origin,
      NULLIF(c->>'customImage', '') AS img,
      GREATEST(sp.created_at, sp.updated_at) AS ts
    FROM public.supplier_posts sp
    CROSS JOIN LATERAL (SELECT public.try_jsonb(sp.content) AS c) j
    WHERE sp.is_published
  )
  SELECT
    min(name),
    COALESCE(array_agg(DISTINCT origin) FILTER (WHERE origin IS NOT NULL), '{}'),
    (array_agg(img ORDER BY ts DESC) FILTER (WHERE img IS NOT NULL))[1],
    max(ts)
  FROM p
  WHERE name <> ''
  GROUP BY lower(name)
  ORDER BY max(ts) DESC;
$$;

-- Product names a supplier offers, for its public profile page.
CREATE OR REPLACE FUNCTION public.get_public_company_products(p_company_id UUID)
RETURNS TABLE (id UUID, product_name TEXT, origin TEXT, fresh_frozen TEXT, image TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    sp.id,
    COALESCE(NULLIF(trim(c->>'productName'), ''), trim(split_part(sp.title, ' —', 1))),
    NULLIF(trim(c->>'countryOfOrigin'), ''),
    NULLIF(trim(c->>'freshFrozen'), ''),
    NULLIF(c->>'customImage', ''),
    sp.updated_at
  FROM public.supplier_posts sp
  JOIN public.companies co ON co.id = sp.company_id AND co.status = 'active'
  CROSS JOIN LATERAL (SELECT public.try_jsonb(sp.content) AS c) j
  WHERE sp.is_published AND sp.company_id = p_company_id
  ORDER BY sp.created_at DESC;
$$;

-- ============================================================
-- ADMIN FUNCTIONS (each checks is_admin() itself)
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_profile_claim(p_claim_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claim public.profile_claims%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_claim FROM public.profile_claims WHERE id = p_claim_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found' USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (SELECT 1 FROM public.companies
             WHERE id = v_claim.company_id AND owner_id IS NOT NULL AND owner_id <> v_claim.user_id) THEN
    RAISE EXCEPTION 'Company is already owned by another account' USING ERRCODE = '23505';
  END IF;

  UPDATE public.profile_claims
     SET status = 'approved', rejection_reason = NULL,
         reviewed_by = (SELECT auth.uid()), reviewed_at = NOW()
   WHERE id = p_claim_id;

  -- Any other pending claims for this company are now void
  UPDATE public.profile_claims
     SET status = 'rejected', rejection_reason = 'Another claim for this company was approved.',
         reviewed_by = (SELECT auth.uid()), reviewed_at = NOW()
   WHERE company_id = v_claim.company_id AND id <> p_claim_id AND status = 'pending';

  UPDATE public.companies
     SET owner_id = v_claim.user_id, is_verified = TRUE, status = 'active'
   WHERE id = v_claim.company_id;

  -- Never downgrade an admin to supplier
  UPDATE public.users
     SET role = CASE WHEN role = 'admin' THEN role ELSE 'supplier'::public.user_role END,
         company_id = v_claim.company_id
   WHERE id = v_claim.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_profile_claim(p_claim_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profile_claims
     SET status = 'rejected',
         rejection_reason = COALESCE(NULLIF(trim(p_reason), ''), 'Verification could not be completed.'),
         reviewed_by = (SELECT auth.uid()), reviewed_at = NOW()
   WHERE id = p_claim_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

-- Removes a claim; if it was approved, the company becomes unclaimed again.
CREATE OR REPLACE FUNCTION public.revoke_profile_claim(p_claim_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claim public.profile_claims%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.profile_claims WHERE id = p_claim_id RETURNING * INTO v_claim;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_claim.status = 'approved' THEN
    UPDATE public.companies SET owner_id = NULL
     WHERE id = v_claim.company_id AND owner_id = v_claim.user_id;

    UPDATE public.users
       SET company_id = NULL,
           role = CASE WHEN role = 'supplier' THEN 'buyer'::public.user_role ELSE role END
     WHERE id = v_claim.user_id AND company_id = v_claim.company_id;
  END IF;
END;
$$;

-- Deletes the login itself (auth.users); public.users and the user's
-- requests/claims cascade. Admins cannot delete themselves or other admins.
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only' USING ERRCODE = '42501';
  END IF;
  IF p_user_id = (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'You cannot delete your own account' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Admin accounts cannot be deleted from the dashboard' USING ERRCODE = '42501';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_indexes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seafood_index_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_suppliers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_buyers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_claims      ENABLE ROW LEVEL SECURITY;

-- ── users ───────────────────────────────────────────────────
CREATE POLICY users_select ON public.users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY users_update ON public.users FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY users_delete_admin ON public.users FOR DELETE TO authenticated
  USING (public.is_admin());
-- No INSERT policy: rows are created only by the signup trigger.

-- ── reference data: public read, admin write ────────────────
CREATE POLICY countries_read  ON public.countries FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY countries_admin ON public.countries FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY products_read  ON public.products FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY products_admin ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY market_indexes_read  ON public.market_indexes FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY market_indexes_admin ON public.market_indexes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY market_history_read  ON public.market_history FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY market_history_admin ON public.market_history FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY seafood_index_read  ON public.seafood_index_items FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY seafood_index_admin ON public.seafood_index_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY partner_buyers_read  ON public.partner_buyers FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY partner_buyers_admin ON public.partner_buyers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── news ────────────────────────────────────────────────────
CREATE POLICY news_read ON public.news FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_admin());
CREATE POLICY news_admin ON public.news FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── companies ───────────────────────────────────────────────
CREATE POLICY companies_read_public ON public.companies FOR SELECT TO anon
  USING (status = 'active');
CREATE POLICY companies_read ON public.companies FOR SELECT TO authenticated
  USING (status = 'active' OR owner_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY companies_insert ON public.companies FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (owner_id = (SELECT auth.uid()) AND public.current_user_role() = 'supplier')
  );
CREATE POLICY companies_update ON public.companies FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (owner_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY companies_delete ON public.companies FOR DELETE TO authenticated
  USING (public.is_admin());

-- ── company_products / certificates ─────────────────────────
CREATE POLICY company_products_read ON public.company_products FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY company_products_write ON public.company_products FOR ALL TO authenticated
  USING (public.owns_company(company_id) OR public.is_admin())
  WITH CHECK (public.owns_company(company_id) OR public.is_admin());

CREATE POLICY certificates_read ON public.certificates FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY certificates_write ON public.certificates FOR ALL TO authenticated
  USING (public.owns_company(company_id) OR public.is_admin())
  WITH CHECK (public.owns_company(company_id) OR public.is_admin());

-- ── supplier_posts (prices: signed-in users only) ───────────
CREATE POLICY posts_read ON public.supplier_posts FOR SELECT TO authenticated
  USING (is_published OR public.owns_company(company_id) OR public.is_admin());
CREATE POLICY posts_write ON public.supplier_posts FOR ALL TO authenticated
  USING (public.owns_company(company_id) OR public.is_admin())
  WITH CHECK (public.owns_company(company_id) OR public.is_admin());

-- ── buyer_requests ──────────────────────────────────────────
CREATE POLICY requests_read ON public.buyer_requests FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin()
    OR (status = 'open' AND public.current_user_role() = 'supplier')
  );
CREATE POLICY requests_insert ON public.buyer_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY requests_update ON public.buyer_requests FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY requests_delete ON public.buyer_requests FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- ── saved_suppliers ─────────────────────────────────────────
CREATE POLICY saved_read ON public.saved_suppliers FOR SELECT TO authenticated
  USING (buyer_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY saved_insert ON public.saved_suppliers FOR INSERT TO authenticated
  WITH CHECK (buyer_id = (SELECT auth.uid()));
CREATE POLICY saved_delete ON public.saved_suppliers FOR DELETE TO authenticated
  USING (buyer_id = (SELECT auth.uid()) OR public.is_admin());

-- ── profile_claims ──────────────────────────────────────────
CREATE POLICY claims_read ON public.profile_claims FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY claims_insert ON public.profile_claims FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND public.company_is_claimable(company_id)
  );
-- Claimant may withdraw a pending claim; admin may delete any
CREATE POLICY claims_delete ON public.profile_claims FOR DELETE TO authenticated
  USING ((user_id = (SELECT auth.uid()) AND status = 'pending') OR public.is_admin());
-- Status changes go through approve/reject/revoke functions; direct admin edit allowed
CREATE POLICY claims_update_admin ON public.profile_claims FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- GRANTS
-- Table privileges decide WHICH operations a role may attempt;
-- the RLS policies above decide WHICH ROWS.
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Public reference data
GRANT SELECT ON public.countries, public.products, public.company_products, public.certificates,
                public.market_indexes, public.market_history, public.seafood_index_items,
                public.news, public.partner_buyers
  TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.countries, public.products, public.company_products,
                public.certificates, public.market_indexes, public.market_history,
                public.seafood_index_items, public.news, public.partner_buyers
  TO authenticated;

-- Companies: visitors see the public profile, not contact details or owner
GRANT SELECT (id, name, slug, country_id, description, website, logo_url, city,
              year_founded, employee_count, export_markets, status, is_verified,
              activity_score, trust_score, created_at, updated_at)
  ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;

-- Signed-in only
GRANT SELECT, UPDATE, DELETE        ON public.users           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_posts  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_requests  TO authenticated;
GRANT SELECT, INSERT, DELETE        ON public.saved_suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_claims  TO authenticated;

-- Service role (server-side maintenance only; bypasses RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Functions: lock down, then open only what the API needs
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_admin()                         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role()                TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owns_company(UUID)                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.company_is_claimable(UUID)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_api_user()                      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.try_jsonb(TEXT)                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at()                TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_product_listings()      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_company_products(UUID)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_profile_claim(UUID)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_profile_claim(UUID, TEXT)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_profile_claim(UUID)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID)            TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public                     TO service_role;

COMMIT;
