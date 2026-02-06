import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy para backend Express
 * POST /api/agendamentos - Criar novo agendamento
 * GET /api/agendamentos - Listar agendamentos
 */

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let response: Response;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      response = await fetch(`${BACKEND_URL}/api/agendamentos`, {
        method: 'POST',
        body: formData,
      });
    } else {
      const body = await request.json();
      response = await fetch(`${BACKEND_URL}/api/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');

    const url = data 
      ? `${BACKEND_URL}/api/agendamentos?data=${data}`
      : `${BACKEND_URL}/api/agendamentos`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data_response = await response.json();

    if (!response.ok) {
      return NextResponse.json(data_response, { status: response.status });
    }

    return NextResponse.json(data_response, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
