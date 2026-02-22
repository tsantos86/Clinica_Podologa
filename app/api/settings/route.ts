import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // formato: "2026-02"

    if (month) {
      const { data: rows } = await supabase
        .from('booking_settings')
        .select('bookings_enabled')
        .eq('month', month)
        .limit(1);

      return NextResponse.json({
        bookingsEnabled: rows?.[0]?.bookings_enabled ?? true,
        month,
      });
    }

    const { data: rows } = await supabase
      .from('booking_settings')
      .select('month, bookings_enabled')
      .order('month');

    const bookingsEnabledByMonth = (rows || []).reduce<Record<string, boolean>>((acc, row) => {
      if (row.month) acc[row.month as string] = row.bookings_enabled as boolean;
      return acc;
    }, {});

    return NextResponse.json({ bookingsEnabledByMonth });
  } catch (error) {
    console.error('❌ Erro ao buscar settings:', error);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    if (month) {
      return NextResponse.json({ bookingsEnabled: true, month });
    }
    return NextResponse.json({ bookingsEnabledByMonth: {} });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { month, bookingsEnabled } = await request.json();

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('booking_settings')
      .upsert({
        month,
        bookings_enabled: !!bookingsEnabled,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'month' });

    if (error) {
      console.error('❌ Erro ao atualizar settings:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookingsEnabled: !!bookingsEnabled,
      month,
      message: bookingsEnabled ? 'Agendamentos abertos' : 'Agendamentos fechados'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar settings:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações. Verifique a conexão com o banco de dados.' },
      { status: 500 }
    );
  }
}
