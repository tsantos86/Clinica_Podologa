import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/testimonials - Buscar TODOS os testemunhos (incluindo pendentes)
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    const { data: rows, error } = await supabase
      .from('testimonials')
      .select('id, name, text, rating, approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar testemunhos (admin):', error);
      return NextResponse.json({ testimonials: [] });
    }

    const testimonials = (rows || []).map(row => ({
      id: row.id,
      name: row.name,
      text: row.text,
      rating: row.rating,
      approved: row.approved,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('❌ Erro ao buscar testemunhos (admin):', error);
    return NextResponse.json({ testimonials: [] });
  }
}

/**
 * PATCH /api/admin/testimonials - Aprovar/Rejeitar testemunho
 */
export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { id, approved } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('testimonials')
      .update({ approved: !!approved })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao atualizar testemunho:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar testemunho.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: approved ? 'Testemunho aprovado.' : 'Testemunho rejeitado.',
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar testemunho:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar testemunho.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/testimonials - Eliminar testemunho
 */
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao eliminar testemunho:', error);
      return NextResponse.json(
        { error: 'Erro ao eliminar testemunho.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Testemunho eliminado.' });
  } catch (error) {
    console.error('❌ Erro ao eliminar testemunho:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar testemunho.' },
      { status: 500 }
    );
  }
}
