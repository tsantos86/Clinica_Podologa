import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Verificações de ambiente
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasSupabaseServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasSmtpUser = Boolean(process.env.SMTP_USER);
  const hasSmtpPass = Boolean(process.env.SMTP_PASS);
  const hasSmtpService = Boolean(process.env.SMTP_SERVICE);
  const hasSmtpFrom = Boolean(process.env.SMTP_FROM);
  const isVercel = process.env.VERCEL === '1';

  // Verificação do Supabase
  let dbOk = false;
  let dbError: string | null = null;
  const tableCounts: Record<string, number> = {};

  if (hasSupabaseUrl && hasSupabaseAnonKey) {
    try {
      const supabase = getSupabase();

      // Testar conexão
      const { error: testError } = await supabase.from('appointments').select('id').limit(1);
      if (testError) throw testError;

      dbOk = true;

      // Contar linhas das tabelas principais
      const tables = ['appointments', 'booking_settings', 'testimonials', 'service_photos', 'service_prices', 'audit_log', 'admin_users'];

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          tableCounts[table] = error ? -1 : (count || 0);
        } catch {
          tableCounts[table] = -1;
        }
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Erro ao conectar no Supabase';
    }
  }

  return NextResponse.json({
    env: {
      isVercel,
      hasSupabaseUrl,
      hasSupabaseAnonKey,
      hasSupabaseServiceKey,
      smtp: {
        hasUser: hasSmtpUser,
        hasPass: hasSmtpPass,
        hasService: hasSmtpService,
        hasFrom: hasSmtpFrom,
        configured: hasSmtpUser && hasSmtpPass && hasSmtpService && hasSmtpFrom,
      },
    },
    db: {
      ok: dbOk,
      error: dbError,
      tableCounts: dbOk ? tableCounts : null,
    },
    timestamp: new Date().toISOString(),
  });
}
