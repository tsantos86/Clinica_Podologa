import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function verifySupabaseToken(token: string): Promise<boolean> {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        return !error && !!user;
    } catch {
        return false;
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Métodos públicos permitidos sem token
    const isPublicGet = (
        (pathname.startsWith('/api/services') ||
            pathname.startsWith('/api/products') ||
            pathname.startsWith('/api/settings')) &&
        method === 'GET'
    );

    // POST /api/agendamentos é público (para criar reserva)
    const isPublicBooking = pathname === '/api/agendamentos' && method === 'POST';

    // GET /api/agendamentos com data é usado pelo modal público para verificar slots
    const isPublicAvailabilityCheck = pathname === '/api/agendamentos' && method === 'GET' && request.nextUrl.searchParams.has('data');

    // Se for uma rota que precisa de proteção
    const needsProtection = (
        pathname.startsWith('/api/admin/') ||
        (pathname.startsWith('/api/services') && !isPublicGet) ||
        (pathname.startsWith('/api/products') && !isPublicGet) ||
        (pathname.startsWith('/api/settings') && !isPublicGet) ||
        (pathname.startsWith('/api/agendamentos') && !isPublicBooking && !isPublicAvailabilityCheck)
    );

    if (needsProtection) {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return NextResponse.json(
                { error: 'Autenticação necessária' },
                { status: 401 }
            );
        }

        const isValid = await verifySupabaseToken(token);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Token inválido ou expirado' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all admin API routes
        '/api/admin/:path*',
        // Protect sensitive common routes
        '/api/agendamentos/:path*',
        '/api/settings/:path*',
        '/api/products/:path*',
        '/api/services/:path*',
        // Match services/photos for protection
        '/api/services/photos',
    ],
};
