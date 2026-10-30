-- ============================================================
-- Buyer requests v2: full sourcing request form, admin-only view
-- ============================================================
-- * Adds the fields the buyer fills in (company, contacts, fish,
--   form, delivery). Quantity is stored in tons (quantity_unit).
-- * Requests are visible only to the buyer who made them and to
--   admins. Suppliers no longer read buyer requests.
-- Safe to re-run.
-- ============================================================

BEGIN;

ALTER TABLE public.buyer_requests
  ADD COLUMN IF NOT EXISTS company_name  TEXT,
  ADD COLUMN IF NOT EXISTS contact_name  TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp      TEXT,
  ADD COLUMN IF NOT EXISTS product_name  TEXT,
  ADD COLUMN IF NOT EXISTS fresh_frozen  TEXT,
  ADD COLUMN IF NOT EXISTS delivery_date DATE;

ALTER TABLE public.buyer_requests DROP CONSTRAINT IF EXISTS buyer_requests_quantity_positive;
ALTER TABLE public.buyer_requests ADD CONSTRAINT buyer_requests_quantity_positive
  CHECK (quantity IS NULL OR quantity > 0);

ALTER TABLE public.buyer_requests DROP CONSTRAINT IF EXISTS buyer_requests_price_non_negative;
ALTER TABLE public.buyer_requests ADD CONSTRAINT buyer_requests_price_non_negative
  CHECK (target_price IS NULL OR target_price >= 0);

ALTER TABLE public.buyer_requests DROP CONSTRAINT IF EXISTS buyer_requests_fresh_frozen_valid;
ALTER TABLE public.buyer_requests ADD CONSTRAINT buyer_requests_fresh_frozen_valid
  CHECK (fresh_frozen IS NULL OR fresh_frozen IN ('Fresh', 'Frozen', 'Smoked', 'Live', 'Any'));

-- Only the requesting buyer and admins can read a request
DROP POLICY IF EXISTS requests_read ON public.buyer_requests;
CREATE POLICY requests_read ON public.buyer_requests FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

COMMIT;

-- Make the API (PostgREST) pick up the new columns immediately
NOTIFY pgrst, 'reload schema';
