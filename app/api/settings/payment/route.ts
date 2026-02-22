import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/settings/payment
 * Retorna as configurações de pagamento (MBWay e sinal)
 */
export async function GET() {
    try {
        const supabase = getSupabase();

        const { data: rows } = await supabase
            .from('payment_settings')
            .select('*')
            .limit(1);

        const settings = rows?.[0] || null;

        return NextResponse.json({
            mbwayEnabled: settings?.mbway_enabled ?? true,
            signalEnabled: settings?.signal_enabled ?? true,
            signalAmount: settings?.signal_amount ?? 10,
        });
    } catch (error) {
        console.error('❌ Erro ao buscar configurações de pagamento:', error);
        return NextResponse.json({
            mbwayEnabled: true,
            signalEnabled: true,
            signalAmount: 10,
        });
    }
}

/**
 * POST /api/settings/payment
 * Atualiza configurações de pagamento
 */
export async function POST(request: Request) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const supabase = getSupabase();
        const body = await request.json();
        const { mbwayEnabled, signalEnabled, signalAmount } = body;

        // Upsert the payment settings (single row, id = 'default')
        const updateData: Record<string, unknown> = {
            id: 'default',
            updated_at: new Date().toISOString(),
        };

        if (typeof mbwayEnabled === 'boolean') {
            updateData.mbway_enabled = mbwayEnabled;
        }
        if (typeof signalEnabled === 'boolean') {
            updateData.signal_enabled = signalEnabled;
        }
        if (typeof signalAmount === 'number') {
            updateData.signal_amount = signalAmount;
        }

        const { error } = await supabase
            .from('payment_settings')
            .upsert(updateData, { onConflict: 'id' });

        if (error) {
            console.error('❌ Erro ao atualizar configurações de pagamento:', error);
            return NextResponse.json(
                { error: 'Erro ao atualizar configurações de pagamento.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            mbwayEnabled: mbwayEnabled ?? true,
            signalEnabled: signalEnabled ?? true,
            signalAmount: signalAmount ?? 10,
            message: 'Configurações de pagamento atualizadas',
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar configurações de pagamento:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar configurações de pagamento.' },
            { status: 500 }
        );
    }
}
