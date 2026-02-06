import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy para backend Express
 * GET /api/mbway/status - Verificar status do pagamento
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referencia = searchParams.get('referencia');

    if (!referencia) {
      return NextResponse.json(
        { error: 'Referência não fornecida' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/pagamento/status/${referencia}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
