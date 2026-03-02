-- =============================================
-- Migration: Create audit_log table
-- Date: 2026-02-24
-- Description: Creates the audit_log table for tracking admin actions
-- Run this in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT DEFAULT 'system'
);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role manages audit_log" ON audit_log;

-- Allow service role full access (bypass RLS)
CREATE POLICY "Service role manages audit_log"
  ON audit_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for faster queries on entity types
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
-- Index for chronological sorting
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at DESC);
