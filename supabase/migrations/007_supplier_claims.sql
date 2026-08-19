-- ============================================================
-- FishMarketCap — Migration 007: Supplier Profile Claims Table
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_claims (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id         UUID REFERENCES companies(id) ON DELETE CASCADE,
  supplier_name       TEXT NOT NULL,
  supplier_slug       TEXT,
  full_name           TEXT NOT NULL,
  business_email      TEXT NOT NULL,
  job_title           TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason    TEXT,
  credentials_email   TEXT,
  credentials_password TEXT,
  account_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by supplier_id and status
CREATE INDEX IF NOT EXISTS idx_supplier_claims_supplier_id ON supplier_claims(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_claims_status ON supplier_claims(status);
CREATE INDEX IF NOT EXISTS idx_supplier_claims_email ON supplier_claims(business_email);

-- Trigger for auto updated_at
CREATE TRIGGER trg_supplier_claims_updated_at
  BEFORE UPDATE ON supplier_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE supplier_claims ENABLE ROW LEVEL SECURITY;

-- Allow public to submit claims
CREATE POLICY "Allow public insert for supplier claims"
  ON supplier_claims
  FOR INSERT
  WITH CHECK (true);

-- Allow admins full access to view, update, delete claims
CREATE POLICY "Allow admins full access to supplier claims"
  ON supplier_claims
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow claimants to view their own submitted claims by email
CREATE POLICY "Allow claimants to view own claim"
  ON supplier_claims
  FOR SELECT
  USING (
    business_email = (SELECT email FROM auth.users WHERE auth.users.id = auth.uid())
  );
