import { NextRequest, NextResponse } from 'next/server';
import { signIn, verifyToken, extractToken } from '@/lib/auth';
import { rateLimitResponse } from '@/lib/rateLimit';
import { logAudit } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/auth - Login via Supabase Auth
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const rateLimited = rateLimitResponse(request, 'login');
  if (rateLimited) return rateLimited;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await signIn(email, password);
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!result.success) {
      // Log falha de login
      await logAudit({
        entityType: 'auth',
        entityId: email,
        action: 'login_failed',
        changes: { ip, error: result.error },
        performedBy: 'anonymous'
      });

      return NextResponse.json(
        { error: result.error || 'Email ou senha incorretos.' },
        { status: 401 }
      );
    }

    // Log sucesso de login
    await logAudit({
      entityType: 'auth',
      entityId: result.user?.id || email,
      action: 'login_success',
      changes: { ip },
      performedBy: result.user?.email
    });

    return NextResponse.json({
      token: result.session!.access_token,
      user: {
        email: result.user!.email,
        role: 'admin',
      },
      message: 'Login efetuado com sucesso!',
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth - Verificar token
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: { email: payload.email, role: payload.role },
    });
  } catch (error) {
    console.error('❌ Erro na verificação de token:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
