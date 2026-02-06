import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy para backend Express
 * POST /api/email - Enviar email
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    if (subject.length < 5) {
      return NextResponse.json(
        { error: 'O assunto deve ter pelo menos 5 caracteres.' },
        { status: 400 }
      );
    }

    if (message.length < 20) {
      return NextResponse.json(
        { error: 'A mensagem deve ter pelo menos 20 caracteres.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/email/enviar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: name,
        email,
        assunto: subject,
        mensagem: message,
        para: process.env.NEXT_PUBLIC_EMAIL || 'stepodologa@gmail.com',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
