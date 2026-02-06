import { NextResponse } from 'next/server';

// Em produção, isso deveria ser um banco de dados
// Estrutura: { "2026-02": true, "2026-03": false }
let bookingsEnabledByMonth: Record<string, boolean> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // formato: "2026-02"
  
  if (month) {
    // Retornar status de um mês específico (padrão: aberto)
    return NextResponse.json({ 
      bookingsEnabled: bookingsEnabledByMonth[month] ?? true,
      month 
    });
  }
  
  // Retornar todos os meses
  return NextResponse.json({ bookingsEnabledByMonth });
}

export async function POST(request: Request) {
  const { month, bookingsEnabled } = await request.json();
  
  if (!month) {
    return NextResponse.json({ error: 'Month is required' }, { status: 400 });
  }
  
  bookingsEnabledByMonth[month] = bookingsEnabled;
  
  return NextResponse.json({ 
    bookingsEnabled,
    month,
    message: bookingsEnabled ? 'Agendamentos abertos' : 'Agendamentos fechados'
  });
}
