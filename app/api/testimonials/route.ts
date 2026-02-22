import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { rateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/** Sanitiza texto para prevenir XSS */
function sanitize(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
}

/**
 * GET /api/testimonials - Buscar testemunhos aprovados
 */
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: rows, error } = await supabase
      .from('testimonials')
      .select('id, name, text, rating, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar testemunhos:', error);
      return NextResponse.json({ testimonials: [] });
    }

    const testimonials = (rows || []).map(row => ({
      id: row.id,
      name: row.name,
      text: row.text,
      rating: row.rating,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('❌ Erro ao buscar testemunhos:', error);
    return NextResponse.json({ testimonials: [] });
  }
}

/**
 * POST /api/testimonials - Submeter novo testemunho
 */
export async function POST(request: NextRequest) {
  const rateLimited = rateLimitResponse(request, 'testimonials');
  if (rateLimited) return rateLimited;

  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { name, text, rating } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome deve ter pelo menos 2 caracteres.' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Depoimento deve ter pelo menos 10 caracteres.' },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5.' },
        { status: 400 }
      );
    }

    const safeName = sanitize(name).slice(0, 100);
    const safeText = sanitize(text).slice(0, 1000);
    const id = `TST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const { data: inserted, error } = await supabase
      .from('testimonials')
      .insert({
        id,
        name: safeName,
        text: safeText,
        rating: ratingNum,
        approved: false,
      })
      .select('id, name, text, rating, approved, created_at')
      .single();

    if (error) {
      console.error('❌ Erro ao criar testemunho:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar testemunho. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Obrigado pelo seu testemunho! Será publicado após aprovação.',
      testimonial: {
        id: inserted.id,
        name: inserted.name,
        text: inserted.text,
        rating: inserted.rating,
        approved: inserted.approved,
        createdAt: inserted.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro ao criar testemunho:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar testemunho. Tente novamente.' },
      { status: 500 }
    );
  }
}
