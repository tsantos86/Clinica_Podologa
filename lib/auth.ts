/**
 * Módulo de autenticação — Supabase Auth
 * Substitui a antiga implementação JWT+bcrypt manual
 */

import { createServerSupabase } from './supabase';

export interface AuthPayload {
  email: string;
  role: 'admin';
  userId: string;
}

/**
 * Login com email e password via Supabase Auth
 */
export async function signIn(email: string, password: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    session: data.session,
    user: data.user,
  };
}

/**
 * Verifica e retorna o usuário a partir de um access token
 */
export async function verifyToken(accessToken: string): Promise<AuthPayload | null> {
  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return {
    email: user.email || '',
    role: 'admin',
    userId: user.id,
  };
}

/**
 * Extrai token do header Authorization
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Middleware helper: verifica autenticação de uma request
 */
export async function authenticateRequest(
  request: Request
): Promise<{ authenticated: boolean; payload?: AuthPayload; error?: string }> {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    return { authenticated: false, error: 'Token não fornecido' };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Token inválido ou expirado' };
  }

  return { authenticated: true, payload };
}
