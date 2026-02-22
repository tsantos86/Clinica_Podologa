-- =============================================
-- Migration: Add reminder_sent column to appointments
-- Date: 2026-02-22
-- Run this in Supabase SQL Editor
-- Description:
--   Adds the 'reminder_sent' column needed by the
--   WhatsApp 24h reminder cron job (/api/cron/reminders)
-- =============================================

-- Add column (safe — IF NOT EXISTS is implicit with DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'reminder_sent'
    ) THEN
        ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT NULL;
    END IF;
END$$;

-- Index for fast cron lookup
CREATE INDEX IF NOT EXISTS idx_appointments_reminder
  ON appointments(data, status)
  WHERE reminder_sent IS NULL;
