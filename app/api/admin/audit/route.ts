import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const ACTION_LABELS: Record<string, string> = {
    create: 'Criação',
    update: 'Atualização',
    delete: 'Eliminação',
    partial_update: 'Atualização parcial',
    update_price: 'Preço atualizado',
    'status_change:confirmed': 'Status → Confirmado',
    'status_change:completed': 'Status → Concluído',
    'status_change:cancelled': 'Status → Cancelado',
    'status_change:pending': 'Status → Pendente',
    login_success: 'Login (Sucesso)',
    login_failed: 'Login (Falha)',
};

const ENTITY_LABELS: Record<string, string> = {
    appointment: 'Agendamento',
    service_price: 'Preço de Serviço',
    testimonial: 'Testemunho',
    photo: 'Foto',
    settings: 'Configuração',
    auth: 'Autenticação',
};

/**
 * GET /api/admin/audit - Lista de audit log
 */
export async function GET(request: NextRequest) {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const entity = searchParams.get('entity');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('audit_log')
            .select('id, entity_type, entity_id, action, changes, performed_by, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (entity) {
            query = query.eq('entity_type', entity);
        }

        const { data: rows, count, error } = await query;

        if (error) {
            console.error('❌ Erro ao buscar audit log:', error);
            return NextResponse.json({ entries: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
        }

        const total = count || 0;

        return NextResponse.json({
            entries: (rows || []).map(row => ({
                id: row.id,
                entityType: row.entity_type,
                entityTypeLabel: ENTITY_LABELS[row.entity_type as string] || row.entity_type,
                entityId: row.entity_id,
                action: row.action,
                actionLabel: ACTION_LABELS[row.action as string] || row.action,
                changes: row.changes,
                performedBy: row.performed_by,
                createdAt: row.created_at,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('❌ Erro ao buscar audit log:', error);
        return NextResponse.json({ entries: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    }
}
