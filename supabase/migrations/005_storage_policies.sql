-- ============================================================
-- FishMarketCap — Migration 005: Storage RLS Policies for SupplyPC
-- Run this in Supabase SQL Editor if you want direct bucket uploads
-- ============================================================

-- Ensure SupplyPC bucket is created & public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('SupplyPC', 'SupplyPC', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 1. Public Read Access
DROP POLICY IF EXISTS "Public Read Access SupplyPC" ON storage.objects;
CREATE POLICY "Public Read Access SupplyPC"
ON storage.objects FOR SELECT
USING (bucket_id = 'SupplyPC');

-- 2. Authenticated Upload Access
DROP POLICY IF EXISTS "Authenticated Upload Access SupplyPC" ON storage.objects;
CREATE POLICY "Authenticated Upload Access SupplyPC"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'SupplyPC');

-- 3. Authenticated Update Access
DROP POLICY IF EXISTS "Authenticated Update Access SupplyPC" ON storage.objects;
CREATE POLICY "Authenticated Update Access SupplyPC"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'SupplyPC');
