import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/products - Listar produtos ativos (público)
 */
export async function GET() {
    try {
        const supabase = getSupabase();

        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('name');

        if (error) {
            // Table might not exist yet — return empty
            console.warn('Erro ao buscar produtos:', error);
            return NextResponse.json({ products: [] });
        }

        return NextResponse.json({ products: products || [] });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return NextResponse.json({ products: [] });
    }
}

/**
 * POST /api/products - Criar produto (ADMIN ONLY)
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, price, icon } = body;

        if (!name || price === undefined) {
            return NextResponse.json({ error: 'Nome e preço são obrigatórios' }, { status: 400 });
        }

        const supabase = getSupabase();
        const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const { data: inserted, error } = await supabase
            .from('products')
            .insert({
                id,
                name,
                description: description || '',
                price: Number(price),
                icon: icon || '📦',
                active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar produto:', error);
            return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
        }

        return NextResponse.json({ product: inserted }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

/**
 * PUT /api/products - Atualizar produto (ADMIN ONLY)
 */
export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, description, price, icon, active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
        }

        const supabase = getSupabase();

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = Number(price);
        if (icon !== undefined) updates.icon = icon;
        if (active !== undefined) updates.active = active;
        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar produto:', error);
            return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
        }

        return NextResponse.json({ product: updated });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

/**
 * DELETE /api/products - Remover produto (ADMIN ONLY)
 */
export async function DELETE(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { error } = await supabase
            .from('products')
            .update({ active: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao remover produto:', error);
            return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
