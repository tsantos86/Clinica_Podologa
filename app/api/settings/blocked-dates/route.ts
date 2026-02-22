import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/settings/blocked-dates
 * Retorna as datas bloqueadas
 * Query params:
 *   - month: "2026-02" (opcional, filtra por mês)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        let query = supabase
            .from('blocked_dates')
            .select('*')
            .order('date', { ascending: true });

        if (month) {
            // Filter by month: dates that start with "2026-02"
            query = query
                .gte('date', `${month}-01`)
                .lte('date', `${month}-31`);
        }

        const { data: rows, error } = await query;

        if (error) {
            console.error('❌ Erro ao buscar datas bloqueadas:', error);
            return NextResponse.json({ blockedDates: [] });
        }

        const blockedDates = (rows || []).map(row => ({
            id: row.id,
            date: row.date,
            reason: row.reason || '',
            createdAt: row.created_at,
        }));

        return NextResponse.json({ blockedDates });
    } catch (error) {
        console.error('❌ Erro ao buscar datas bloqueadas:', error);
        return NextResponse.json({ blockedDates: [] });
    }
}

/**
 * POST /api/settings/blocked-dates
 * Adiciona datas bloqueadas (pode ser uma data, intervalo de datas, ou semana inteira)
 * Body:
 *   - dates: string[] (array de datas no formato "2026-02-15")
 *   - reason: string (motivo opcional)
 */
export async function POST(request: Request) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const supabase = getSupabase();
        const body = await request.json();
        const { dates, reason } = body;

        if (!dates || !Array.isArray(dates) || dates.length === 0) {
            return NextResponse.json(
                { error: 'É necessário fornecer pelo menos uma data.' },
                { status: 400 }
            );
        }

        // Validate date format for each date
        for (const date of dates) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return NextResponse.json(
                    { error: `Data inválida: ${date}. Use o formato YYYY-MM-DD.` },
                    { status: 400 }
                );
            }
        }

        // Insert all dates (ignore if already exists)
        const insertData = dates.map((date: string) => ({
            date,
            reason: reason || null,
        }));

        const { data: inserted, error } = await supabase
            .from('blocked_dates')
            .upsert(insertData, { onConflict: 'date', ignoreDuplicates: true })
            .select('*');

        if (error) {
            console.error('❌ Erro ao bloquear datas:', error);
            return NextResponse.json(
                { error: 'Erro ao bloquear datas.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `${dates.length} data(s) bloqueada(s) com sucesso.`,
            blockedDates: (inserted || []).map(row => ({
                id: row.id,
                date: row.date,
                reason: row.reason || '',
                createdAt: row.created_at,
            })),
        });
    } catch (error) {
        console.error('❌ Erro ao bloquear datas:', error);
        return NextResponse.json(
            { error: 'Erro ao bloquear datas.' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/settings/blocked-dates
 * Remove datas bloqueadas
 * Body:
 *   - dates: string[] (array de datas para desbloquear)
 */
export async function DELETE(request: Request) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const supabase = getSupabase();
        const body = await request.json();
        const { dates } = body;

        if (!dates || !Array.isArray(dates) || dates.length === 0) {
            return NextResponse.json(
                { error: 'É necessário fornecer pelo menos uma data.' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('blocked_dates')
            .delete()
            .in('date', dates);

        if (error) {
            console.error('❌ Erro ao desbloquear datas:', error);
            return NextResponse.json(
                { error: 'Erro ao desbloquear datas.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `${dates.length} data(s) desbloqueada(s) com sucesso.`,
        });
    } catch (error) {
        console.error('❌ Erro ao desbloquear datas:', error);
        return NextResponse.json(
            { error: 'Erro ao desbloquear datas.' },
            { status: 500 }
        );
    }
}
