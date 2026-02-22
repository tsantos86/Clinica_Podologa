-- =============================================
-- Migration: Add Payment Settings and Blocked Dates tables
-- Date: 2026-02-21
-- Run this in Supabase SQL Editor
-- Description:
--   1. Creates payment_settings table for MBWay toggle & signal toggle
--   2. Creates blocked_dates table for blocking specific days
-- =============================================

-- ─── Payment Settings ───────────────────────────
CREATE TABLE IF NOT EXISTS payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  mbway_enabled BOOLEAN NOT NULL DEFAULT true,
  signal_enabled BOOLEAN NOT NULL DEFAULT true,
  signal_amount NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row
INSERT INTO payment_settings (id, mbway_enabled, signal_enabled, signal_amount)
VALUES ('default', true, true, 10.00)
ON CONFLICT (id) DO NOTHING;

-- ─── Blocked Dates ──────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- ─── RLS Policies ───────────────────────────────
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Service role can manage payment settings" ON payment_settings;

CREATE POLICY "Public can read payment settings"
  ON payment_settings FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage payment settings"
  ON payment_settings FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read blocked dates" ON blocked_dates;
DROP POLICY IF EXISTS "Service role can manage blocked dates" ON blocked_dates;

CREATE POLICY "Public can read blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage blocked dates"
  ON blocked_dates FOR ALL
  USING (true)
  WITH CHECK (true);
