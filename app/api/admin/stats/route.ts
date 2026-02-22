import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/stats - Métricas do dashboard
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    // Buscar todos os agendamentos para calcular métricas
    const { data: allAppointments, error } = await supabase
      .from('appointments')
      .select('id, servico, nome, telefone, email, data, hora, preco, status');

    if (error) {
      throw error;
    }

    const rows = allAppointments || [];
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7); // "2026-02"
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    // Totais gerais
    const totals = {
      appointments: rows.length,
      pending: rows.filter(r => r.status === 'pending').length,
      confirmed: rows.filter(r => r.status === 'confirmed').length,
      completed: rows.filter(r => r.status === 'completed').length,
      cancelled: rows.filter(r => r.status === 'cancelled').length,
      revenue: rows.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (Number(r.preco) || 0), 0),
      uniqueClients: new Set(rows.map(r => r.telefone)).size,
    };

    // Hoje
    const todayRows = rows.filter(r => String(r.data).startsWith(today));
    const todayStats = {
      appointments: todayRows.length,
      revenue: todayRows.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (Number(r.preco) || 0), 0),
    };

    // Este mês
    const monthRows = rows.filter(r => String(r.data).startsWith(currentMonth));
    const monthStats = {
      appointments: monthRows.length,
      revenue: monthRows.filter(r => r.status !== 'cancelled').reduce((sum, r) => sum + (Number(r.preco) || 0), 0),
      newClients: new Set(monthRows.map(r => r.telefone)).size,
    };

    // Últimos 6 meses (para gráfico)
    const recentRows = rows.filter(r => String(r.data) >= sixMonthsAgoStr);
    const monthlyMap = new Map<string, { total: number; revenue: number }>();
    recentRows.forEach(r => {
      const month = String(r.data).slice(0, 7);
      if (!monthlyMap.has(month)) monthlyMap.set(month, { total: 0, revenue: 0 });
      const entry = monthlyMap.get(month)!;
      entry.total++;
      if (r.status !== 'cancelled') entry.revenue += Number(r.preco) || 0;
    });
    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, appointments: data.total, revenue: data.revenue }));

    // Serviços mais populares
    const serviceMap = new Map<string, { count: number; revenue: number }>();
    rows.filter(r => r.status !== 'cancelled').forEach(r => {
      const name = r.servico as string;
      if (!serviceMap.has(name)) serviceMap.set(name, { count: 0, revenue: 0 });
      const entry = serviceMap.get(name)!;
      entry.count++;
      entry.revenue += Number(r.preco) || 0;
    });
    const popularServices = Array.from(serviceMap.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }));

    // Próximos agendamentos
    const upcoming = rows
      .filter(r => String(r.data) >= today && ['pending', 'confirmed'].includes(r.status as string))
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
      .slice(0, 10);

    return NextResponse.json({
      totals,
      today: todayStats,
      month: monthStats,
      monthly,
      popularServices,
      upcoming,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar stats:', error);
    return NextResponse.json({
      totals: { appointments: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0, uniqueClients: 0 },
      today: { appointments: 0, revenue: 0 },
      month: { appointments: 0, revenue: 0, newClients: 0 },
      monthly: [],
      popularServices: [],
      upcoming: [],
    });
  }
}
