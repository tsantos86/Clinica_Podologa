import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Webhook para receber notificações do IFTHENPAY/MBWAY
 * POST /api/mbway/callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📩 Callback IFTHENPAY recebido:', body);

    // Reencaminhar para o backend Express
    const response = await fetch(`${BACKEND_URL}/api/pagamento/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erro no callback:', error);
    return NextResponse.json(
      { error: 'Erro ao processar callback' },
      { status: 500 }
    );
  }
}
