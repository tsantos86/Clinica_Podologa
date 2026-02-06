import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy para backend Express
 * POST /api/mbway/iniciar - Iniciar pagamento MBWay
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone, valor, referencia, agendamento } = body;

    if (!telefone || !valor || !referencia) {
      return NextResponse.json(
        { error: 'Faltam alguns dados necessários. Por favor, verifique e tente novamente.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/pagamento/iniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agendamento_id: referencia,
        valor: parseFloat(valor),
        email: body.email || '',
        phone: telefone,
        descricao: 'Sinal consulta podologia',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao iniciar pagamento:', error);
    return NextResponse.json(
      { error: 'Não foi possível processar o pagamento. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}
