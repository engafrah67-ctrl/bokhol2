-- ============================================================
-- FishMarketCap — Migration 010: Profile Claims Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profile_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        TEXT NOT NULL,
  company_name      TEXT NOT NULL,
  username          TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  job_title         TEXT NOT NULL,
  business_email    TEXT NOT NULL,
  phone             TEXT,
  status            TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;

-- Allow public / anon users to submit claims
CREATE POLICY "Allow public insert on profile_claims"
  ON public.profile_claims
  FOR INSERT
  WITH CHECK (true);

-- Allow admins or public to read claims
CREATE POLICY "Allow read on profile_claims"
  ON public.profile_claims
  FOR SELECT
  USING (true);

-- Allow update for status change (approve/reject)
CREATE POLICY "Allow update on profile_claims"
  ON public.profile_claims
  FOR UPDATE
  USING (true);
