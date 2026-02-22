-- =============================================
-- Migration: Create services table + seed default services
-- Date: 2026-02-21
-- Description: Creates the services table and inserts the default services
-- Run this in Supabase SQL Editor
-- =============================================

-- ── 1. Create the services table ──
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  details JSONB DEFAULT '[]'::jsonb,
  duration TEXT DEFAULT '1h',
  duration_minutes INTEGER DEFAULT 60,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🦶',
  category TEXT DEFAULT 'Pedicura',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Enable RLS ──
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Public can read services" ON services;
DROP POLICY IF EXISTS "Service role manages services" ON services;

-- Allow public read (services are public)
CREATE POLICY "Public can read services"
  ON services FOR SELECT
  USING (true);

-- Allow service role full access (insert, update, delete)
CREATE POLICY "Service role manages services"
  ON services FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 3. Seed default services if table is empty ──
INSERT INTO services (id, name, description, details, duration, duration_minutes, price, icon, category, active, sort_order)
VALUES
  (
    'pedicura-classica',
    'Pedicura Clássica (Embelezamento)',
    'Embelezamento completo para manter os pés cuidados e saudáveis. (Duração estimada: 1h20m)',
    '["Escalda-pés","Lixamento e esfoliação","Hidratação","Cutilagem","Corte técnico das unhas","Opcional: verniz normal"]'::jsonb,
    '1h20m', 80, 22, '🦶', 'Pedicura', true, 1
  ),
  (
    'pedicura-completa-verniz-gel',
    'Pedicura Completa com Verniz de Gel',
    'Cuidado completo com acabamento de verniz de gel. (Duração estimada: 1h30m)',
    '["Escalda-pés","Lixamento e esfoliação","Hidratação","Cutilagem","Corte técnico das unhas","Aplicação de verniz de gel"]'::jsonb,
    '1h30m', 90, 30, '💅', 'Pedicura', true, 2
  ),
  (
    'pedicura-profunda',
    'Pedicura Profunda',
    'Indicada para pés com maior necessidade de cuidado. (Duração estimada: 1h30m)',
    '["Escalda-pés","Lixamento e esfoliação","Hidratação","Remoção de calosidades","Tratamento de fissuras","Cutilagem","Corte técnico das unhas"]'::jsonb,
    '1h30m', 90, 37, '🦶', 'Pedicura', true, 3
  ),
  (
    'pedicura-tecnica',
    'Pedicura Técnica',
    'Correção técnica do corte das unhas (sem embelezamento). (Duração estimada: 20min)',
    '["Correção técnica do corte das unhas","Sem embelezamento"]'::jsonb,
    '20min', 20, 10, '✂️', 'Pedicura', true, 4
  ),
  (
    'pedicura-especializada',
    'Pedicura Especializada',
    'Indicada para unhas com alterações. (Duração estimada: 1h30m)',
    '["Escalda-pés","Lixamento e esfoliação","Hidratação","Técnicas específicas nas unhas","Limpeza profunda em unhas com onicomicose"]'::jsonb,
    '1h30m', 90, 40, '🧴', 'Pedicura', true, 5
  ),
  (
    'pedicura-profissional',
    'Pedicura Profissional',
    'Atendimento personalizado conforme avaliação. (Duração estimada: 2h)',
    '["Escalda-pés","Lixamento e esfoliação","Hidratação","Técnicas específicas conforme avaliação","Atendimento a unhas encravadas","Necessária avaliação profissional"]'::jsonb,
    '2h', 120, 42, '👣', 'Pedicura', true, 6
  )
ON CONFLICT (id) DO NOTHING;
