import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/clients - Lista de clientes (agrupados por telefone)
 * 
 * Usa uma database function (RPC) para aggregate queries que o client builder não suporta diretamente
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(10, Number(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    // Buscar todos os appointments e agrupar no servidor
    let query = supabase
      .from('appointments')
      .select('telefone, nome, email, preco, status, data');

    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return NextResponse.json({
        clients: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }

    // Agrupar por telefone no servidor
    const grouped = new Map<string, {
      telefone: string;
      nome: string;
      email: string | null;
      totalAppointments: number;
      completed: number;
      cancelled: number;
      totalSpent: number;
      firstVisit: string | null;
      lastVisit: string | null;
    }>();

    (rows || []).forEach(row => {
      const key = row.telefone as string;
      if (!grouped.has(key)) {
        grouped.set(key, {
          telefone: key,
          nome: row.nome as string,
          email: row.email as string | null,
          totalAppointments: 0,
          completed: 0,
          cancelled: 0,
          totalSpent: 0,
          firstVisit: null,
          lastVisit: null,
        });
      }
      const client = grouped.get(key)!;
      client.totalAppointments++;
      if (row.status === 'completed') client.completed++;
      if (row.status === 'cancelled') client.cancelled++;
      if (row.status !== 'cancelled') client.totalSpent += Number(row.preco) || 0;

      const dateStr = row.data as string;
      if (!client.firstVisit || dateStr < client.firstVisit) client.firstVisit = dateStr;
      if (!client.lastVisit || dateStr > client.lastVisit) client.lastVisit = dateStr;

      // Usar o nome/email mais recente
      if (row.nome) client.nome = row.nome as string;
      if (row.email) client.email = row.email as string;
    });

    // Sort by last visit descending and paginate
    const allClients = Array.from(grouped.values())
      .sort((a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || ''));

    const total = allClients.length;
    const paginatedClients = allClients.slice(offset, offset + limit);

    return NextResponse.json({
      clients: paginatedClients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    return NextResponse.json({
      clients: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  }
}
