/**
 * Camada de dados — Supabase
 * Substitui a antiga integração Neon/Postgres
 */

import { createServerSupabase } from './supabase';

/**
 * Retorna o client Supabase (server-side, com service role)
 */
export function getSupabase() {
  return createServerSupabase();
}

/**
 * Registra uma ação no audit log
 */
export async function logAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, unknown>;
  performedBy?: string;
}) {
  try {
    const supabase = getSupabase();
    await supabase.from('audit_log').insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      changes: params.changes || {},
      performed_by: params.performedBy || 'system',
    });
  } catch (error) {
    console.error('❌ Erro ao registrar audit log:', error);
  }
}
