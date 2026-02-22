import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Escapa um valor para CSV
 */
function escapeCsvValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
};

const PAYMENT_LABELS: Record<string, string> = {
    signal: 'Sinal',
    full: 'Total',
};

/**
 * GET /api/admin/export - Exportar agendamentos como CSV
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');

        let query = supabase
            .from('appointments')
            .select('id, servico, nome, telefone, email, data, hora, preco, tipo_pagamento, valor_pagamento, status, observacoes, created_at');

        if (from && to) {
            query = query.gte('data', from).lte('data', to);
        }
        if (status) {
            query = query.eq('status', status);
        }

        if (from && to) {
            query = query.order('data').order('hora');
        } else {
            query = query.order('data', { ascending: false }).order('hora');
        }

        const { data: rows, error } = await query;

        if (error) {
            throw error;
        }

        // Generate CSV
        const headers = [
            'ID', 'Serviço', 'Nome', 'Telefone', 'Email',
            'Data', 'Hora', 'Preço (€)', 'Tipo Pagamento', 'Valor Pagamento (€)',
            'Status', 'Observações', 'Data Criação',
        ];

        const csvLines = [
            headers.join(','),
            ...(rows || []).map(row => {
                const dateStr = row.data ? String(row.data).split('T')[0] : '';
                const createdStr = row.created_at ? new Date(String(row.created_at)).toLocaleString('pt-PT') : '';

                return [
                    escapeCsvValue(row.id),
                    escapeCsvValue(row.servico),
                    escapeCsvValue(row.nome),
                    escapeCsvValue(row.telefone),
                    escapeCsvValue(row.email),
                    escapeCsvValue(dateStr),
                    escapeCsvValue(row.hora),
                    escapeCsvValue(row.preco),
                    escapeCsvValue(PAYMENT_LABELS[String(row.tipo_pagamento)] || row.tipo_pagamento),
                    escapeCsvValue(row.valor_pagamento),
                    escapeCsvValue(STATUS_LABELS[String(row.status)] || row.status),
                    escapeCsvValue(row.observacoes),
                    escapeCsvValue(createdStr),
                ].join(',');
            }),
        ];

        const csvContent = '\uFEFF' + csvLines.join('\r\n');

        const todayStr = new Date().toISOString().split('T')[0];
        const filename = `agendamentos_${todayStr}.csv`;

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('❌ Erro ao exportar:', error);
        return NextResponse.json(
            { error: 'Erro ao exportar dados.' },
            { status: 500 }
        );
    }
}
