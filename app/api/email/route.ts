import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimitResponse } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/** Sanitiza string para uso seguro em HTML (previne XSS) */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: { user, pass },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = rateLimitResponse(request, 'email');
    if (rateLimited) return rateLimited;

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

    const transporter = getTransporter();
    if (!transporter) {
      return NextResponse.json(
        { error: 'SMTP não configurado. Defina SMTP_USER e SMTP_PASS.' },
        { status: 500 }
      );
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@stepodologia.com';
    const to = process.env.EMAIL_OWNER || process.env.NEXT_PUBLIC_EMAIL || 'stepodologa@gmail.com';

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    await transporter.sendMail({
      from,
      to,
      subject: `Novo Contato: ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9a3ad;">Novo Contacto Recebido</h2>
          <div style="background-color: #f5d5de; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Assunto:</strong> ${safeSubject}</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #c9a3ad; border-radius: 4px;">
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso! Responderemos em breve.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
