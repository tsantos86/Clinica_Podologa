/**
 * Supabase Client Helpers
 * - createBrowserClient() → para componentes React (client-side)
 * - createServerSupabase() → para API routes / server components (service role)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── Variáveis de ambiente ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Client-side (browser) ───
let browserClient: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
    if (!browserClient) {
        browserClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return browserClient;
}

// ─── Server-side (API routes, server components) ───
// Usa service role key para bypass de RLS quando necessário
let serverClient: SupabaseClient | null = null;

export function createServerSupabase(): SupabaseClient {
    if (!serverClient) {
        serverClient = createClient(
            supabaseUrl,
            supabaseServiceKey || supabaseAnonKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );
    }
    return serverClient;
}

/**
 * Helper: cria um client Supabase com o token do usuário (para respeitar RLS)
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}
