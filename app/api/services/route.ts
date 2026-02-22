import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { services as defaultServices } from '@/lib/services';
import { parseDuration } from '@/lib/utils/schedule';

export const runtime = 'nodejs';

/**
 * GET /api/services - Retorna todos os serviços com preços e durações atualizados
 * Endpoint público — sem autenticação.
 * Merge: dados do DB (services table) + fallback hardcoded
 */
export async function GET() {
    try {
        const supabase = getSupabase();

        // Try to load services from the DB table first
        const { data: dbServices, error: dbError } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        // If we have DB services, use them as the source of truth
        if (!dbError && dbServices && dbServices.length > 0) {
            const [photosResult] = await Promise.all([
                supabase.from('service_photos').select('service_id, photo_url'),
            ]);

            const photoMap: Record<string, string> = {};
            (photosResult.data || []).forEach(row => {
                photoMap[row.service_id] = row.photo_url;
            });

            const services = dbServices
                .filter(s => s.active !== false)
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || '',
                    details: s.details || [],
                    duration: s.duration || '1h',
                    durationMinutes: s.duration_minutes || parseDuration(s.duration),
                    price: Number(s.price),
                    defaultPrice: Number(s.price),
                    icon: s.icon || '🦶',
                    category: s.category || 'Pedicura',
                    active: s.active !== false,
                    photoUrl: photoMap[s.id] || null,
                }));

            return NextResponse.json({ services });
        }

        // Fallback: use hardcoded services + DB prices/photos overlay
        const [pricesResult, photosResult] = await Promise.all([
            supabase.from('service_prices').select('service_id, price'),
            supabase.from('service_photos').select('service_id, photo_url'),
        ]);

        const priceMap: Record<string, number> = {};
        (pricesResult.data || []).forEach(row => {
            priceMap[row.service_id] = Number(row.price);
        });

        const photoMap: Record<string, string> = {};
        (photosResult.data || []).forEach(row => {
            photoMap[row.service_id] = row.photo_url;
        });

        const mergedServices = defaultServices
            .filter(s => s.active !== false)
            .map(service => ({
                id: service.id,
                name: service.name,
                description: service.description,
                details: service.details,
                duration: service.duration,
                durationMinutes: service.durationMinutes || parseDuration(service.duration),
                price: priceMap[service.id] !== undefined ? priceMap[service.id] : service.price,
                defaultPrice: service.price,
                icon: service.icon,
                category: service.category,
                active: true,
                photoUrl: photoMap[service.id] || null,
            }));

        return NextResponse.json({ services: mergedServices });
    } catch (error) {
        console.error('❌ Erro ao buscar serviços do DB, usando fallback:', error);
        const fallback = defaultServices
            .filter(s => s.active !== false)
            .map(service => ({
                ...service,
                durationMinutes: service.durationMinutes || parseDuration(service.duration),
                defaultPrice: service.price,
                photoUrl: null,
            }));
        return NextResponse.json({ services: fallback });
    }
}

/**
 * POST /api/services - Criar novo serviço (ADMIN ONLY)
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, details, duration, durationMinutes, price, icon, category } = body;

        if (!name || !price || !duration) {
            return NextResponse.json(
                { error: 'Nome, preço e duração são obrigatórios' },
                { status: 400 }
            );
        }

        const supabase = getSupabase();
        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const calcDuration = durationMinutes || parseDuration(duration);

        const { data: inserted, error } = await supabase
            .from('services')
            .insert({
                id,
                name,
                description: description || '',
                details: details || [],
                duration,
                duration_minutes: calcDuration,
                price: Number(price),
                icon: icon || '🦶',
                category: category || 'Pedicura',
                active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar serviço:', error);
            return NextResponse.json({
                error: 'Erro ao criar serviço',
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({ service: inserted }, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

/**
 * PUT /api/services - Atualizar serviço existente (ADMIN ONLY)
 */
export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, description, details, duration, durationMinutes, price, icon, category, active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 });
        }

        const supabase = getSupabase();

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (details !== undefined) updates.details = details;
        if (duration !== undefined) {
            updates.duration = duration;
            updates.duration_minutes = durationMinutes || parseDuration(duration);
        }
        if (durationMinutes !== undefined) updates.duration_minutes = durationMinutes;
        if (price !== undefined) updates.price = Number(price);
        if (icon !== undefined) updates.icon = icon;
        if (category !== undefined) updates.category = category;
        if (active !== undefined) updates.active = active;
        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar serviço:', error);
            // Fallback: try to update service_prices table for legacy support
            if (price !== undefined) {
                await supabase.from('service_prices').upsert({
                    service_id: id,
                    price: Number(price),
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'service_id' });
            }
            return NextResponse.json({ error: 'Serviço atualizado parcialmente (tabela legacy)' }, { status: 200 });
        }

        // Also sync to service_prices for backward compatibility
        if (price !== undefined) {
            await supabase.from('service_prices').upsert({
                service_id: id,
                price: Number(price),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'service_id' });
        }

        return NextResponse.json({ service: updated });
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

/**
 * DELETE /api/services - Remover serviço (ADMIN ONLY)
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
            return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 });
        }

        const supabase = getSupabase();

        // Soft delete: marca como inactive
        const { error } = await supabase
            .from('services')
            .update({ active: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao remover serviço:', error);
            return NextResponse.json({ error: 'Erro ao remover serviço' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover serviço:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
