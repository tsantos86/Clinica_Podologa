import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, logAudit } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/services/prices - Buscar preços personalizados
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const supabase = getSupabase();

        const { data: rows, error } = await supabase
            .from('service_prices')
            .select('service_id, price');

        if (error) {
            console.error('❌ Erro ao buscar preços:', error);
            return NextResponse.json({ prices: {} });
        }

        const prices: Record<string, number> = {};
        (rows || []).forEach(row => {
            prices[row.service_id] = Number(row.price);
        });

        return NextResponse.json({ prices });
    } catch (error) {
        console.error('❌ Erro ao buscar preços:', error);
        return NextResponse.json({ prices: {} });
    }
}

/**
 * PATCH /api/admin/services/prices - Atualizar preço de serviço
 */
export async function PATCH(request: NextRequest) {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const supabase = getSupabase();
        const { serviceId, price } = await request.json();

        if (!serviceId || price === undefined || price === null) {
            return NextResponse.json(
                { error: 'serviceId e price são obrigatórios' },
                { status: 400 }
            );
        }

        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice < 0) {
            return NextResponse.json(
                { error: 'Preço inválido' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('service_prices')
            .upsert({
                service_id: serviceId,
                price: numericPrice,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'service_id' });

        if (error) {
            console.error('❌ Erro ao atualizar preço:', error);
            return NextResponse.json(
                { error: 'Erro ao atualizar preço' },
                { status: 500 }
            );
        }

        // Audit log
        logAudit({
            entityType: 'service_price',
            entityId: serviceId,
            action: 'update_price',
            changes: { price: numericPrice },
            performedBy: 'admin',
        });

        return NextResponse.json({
            success: true,
            serviceId,
            price: numericPrice,
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar preço:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar preço' },
            { status: 500 }
        );
    }
}
