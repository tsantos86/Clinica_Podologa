import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { rateLimitResponse } from '@/lib/rateLimit';
import nodemailer from 'nodemailer';
import { clientConfirmationEmail, adminNotificationEmail } from '@/lib/emailTemplates';
import { SCHEDULE } from '@/lib/constants';
import { timeToMinutes, getTotalBlockedTime, parseDuration, getDaySchedule } from '@/lib/utils/schedule';
import { WhatsAppService } from '@/lib/whatsapp';

export const runtime = 'nodejs';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeStatus(status?: string) {
  const allowed = new Set(['pending', 'confirmed', 'completed', 'cancelled']);
  return status && allowed.has(status) ? status : 'pending';
}

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: { user, pass },
  });
}

/** Envia emails de confirmação ao cliente e notificação à admin */
async function sendBookingEmails(appointment: {
  nome: string;
  email?: string;
  servico: string;
  data: string;
  hora: string;
  preco: number;
  telefone: string;
  observacoes?: string;
  tipoPagamento?: string;
  valorPagamento?: number;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@stepodologia.com';
  const adminEmail = process.env.EMAIL_OWNER || process.env.NEXT_PUBLIC_EMAIL || 'stepodologa@gmail.com';

  const emailData = {
    nome: appointment.nome,
    servico: appointment.servico,
    data: appointment.data,
    hora: appointment.hora,
    preco: appointment.preco,
    telefone: appointment.telefone,
    email: appointment.email || '',
    observacoes: appointment.observacoes,
    tipoPagamento: appointment.tipoPagamento,
    valorPagamento: appointment.valorPagamento,
  };

  const emailPromises: Promise<unknown>[] = [];

  // 1. Email de confirmação ao CLIENTE
  if (appointment.email) {
    const clientEmail = clientConfirmationEmail(emailData);
    emailPromises.push(
      transporter.sendMail({
        from,
        to: appointment.email,
        subject: clientEmail.subject,
        html: clientEmail.html,
      }).catch(err => console.error('❌ Erro ao enviar email ao cliente:', err))
    );
  }

  // 2. Email de notificação à ADMIN
  const adminNotif = adminNotificationEmail(emailData);
  emailPromises.push(
    transporter.sendMail({
      from,
      to: adminEmail,
      subject: adminNotif.subject,
      html: adminNotif.html,
    }).catch(err => console.error('❌ Erro ao enviar email ao admin:', err))
  );

  await Promise.allSettled(emailPromises);
}

/**
 * Validates scheduling constraints:
 * - Overlap with existing appointments (considering duration + hygienization)
 * - Not exceeding closing time (18:30)
 * - Not starting after LAST_START_TIME (17:30)
 */
async function validateSchedule(
  supabase: ReturnType<typeof getSupabase>,
  date: string,
  time: string,
  durationMinutes: number,
  excludeId?: string
): Promise<{ valid: boolean; error?: string }> {
  const slotStart = timeToMinutes(time);
  const totalBlocked = getTotalBlockedTime(durationMinutes);

  const config = getDaySchedule(date);
  const maxStart = timeToMinutes(config.lastStart);

  if (slotStart > maxStart) {
    return {
      valid: false,
      error: `Para o dia selecionado, o último horário de início permitido é ${config.lastStart}.`
    };
  }

  // Check: service doesn't exceed closing
  const closingMinutes = timeToMinutes(config.closing);
  if (slotStart + totalBlocked > closingMinutes) {
    return {
      valid: false,
      error: `Este serviço (${durationMinutes}min) ultrapassa o horário de fecho (${config.closing}).`,
    };
  }

  // Check overlaps with existing appointments
  let query = supabase
    .from('appointments')
    .select('id, hora, duracao_minutos')
    .eq('data', date)
    .neq('status', 'cancelled');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data: existingAppts } = await query;

  if (existingAppts && existingAppts.length > 0) {
    const slotEnd = slotStart + totalBlocked;

    for (const appt of existingAppts) {
      const apptStart = timeToMinutes(appt.hora);
      const apptDuration = appt.duracao_minutos || 60;
      const apptEnd = apptStart + getTotalBlockedTime(apptDuration);

      if (slotStart < apptEnd && slotEnd > apptStart) {
        return {
          valid: false,
          error: 'Este horário conflita com outro agendamento existente.',
        };
      }
    }
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimited = rateLimitResponse(request, 'booking');
    if (rateLimited) return rateLimited;

    const supabase = getSupabase();
    const body = await request.json();
    const {
      servico,
      servicoId,
      preco,
      data,
      hora,
      nome,
      telefone,
      email,
      observacoes,
      tipoPagamento,
      valorPagamento,
      status,
      duracaoMinutos,
      produtos,
    } = body;

    if (!servico || !servicoId) {
      return NextResponse.json({ error: 'Por favor, selecione um serviço.' }, { status: 400 });
    }

    if (!data || !hora) {
      return NextResponse.json({ error: 'Por favor, selecione data e horário.' }, { status: 400 });
    }

    if (!nome || String(nome).trim().length < 3) {
      return NextResponse.json({ error: 'Por favor, insira o seu nome completo.' }, { status: 400 });
    }

    if (!telefone || String(telefone).replace(/\D/g, '').length < 9) {
      return NextResponse.json({ error: 'Por favor, insira um número de telefone válido.' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Por favor, insira um email válido.' }, { status: 400 });
    }

    // Determine duration: from body, or from service lookup
    let serviceDuration = duracaoMinutos || 60;
    if (!duracaoMinutos) {
      // Try to get from services table
      const { data: svcData } = await supabase
        .from('services')
        .select('duration_minutes, duration')
        .eq('id', servicoId)
        .single();

      if (svcData) {
        serviceDuration = svcData.duration_minutes || parseDuration(svcData.duration) || 60;
      }
    }

    // ── Check if date is blocked ──
    const { data: blockedRows } = await supabase
      .from('blocked_dates')
      .select('date')
      .eq('date', data)
      .limit(1);

    if (blockedRows && blockedRows.length > 0) {
      return NextResponse.json(
        { error: 'Este dia está indisponível para agendamentos. A profissional não atende neste dia.' },
        { status: 409 }
      );
    }

    // ── Validate scheduling constraints ──
    const scheduleCheck = await validateSchedule(supabase, data, hora, serviceDuration);
    if (!scheduleCheck.valid) {
      return NextResponse.json({ error: scheduleCheck.error }, { status: 409 });
    }

    const id = `AGD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const normalizedStatus = normalizeStatus(status);

    const insertData: Record<string, unknown> = {
      id,
      servico,
      servico_id: servicoId,
      preco: preco || 0,
      data,
      hora,
      nome,
      telefone,
      email: email || null,
      observacoes: observacoes || null,
      tipo_pagamento: tipoPagamento || 'signal',
      valor_pagamento: valorPagamento || null,
      status: normalizedStatus,
      duracao_minutos: serviceDuration,
    };

    // Add products if provided
    if (produtos && Array.isArray(produtos) && produtos.length > 0) {
      insertData.produtos = JSON.stringify(produtos);
    }

    const { data: inserted, error } = await supabase
      .from('appointments')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      return NextResponse.json(
        { error: 'Erro ao conectar com o servidor. Tente novamente.' },
        { status: 500 }
      );
    }

    const agendamento = {
      id: inserted.id,
      servico: inserted.servico,
      servicoId: inserted.servico_id,
      preco: inserted.preco,
      data: inserted.data,
      hora: inserted.hora,
      nome: inserted.nome,
      telefone: inserted.telefone,
      email: inserted.email,
      observacoes: inserted.observacoes,
      tipoPagamento: inserted.tipo_pagamento,
      valorPagamento: inserted.valor_pagamento,
      status: inserted.status,
      duracaoMinutos: inserted.duracao_minutos,
      produtos: inserted.produtos ? JSON.parse(inserted.produtos) : [],
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };

    // Enviar notificações (async, não bloqueia)
    sendBookingEmails({ nome, email, servico, data, hora, preco, telefone, observacoes, tipoPagamento, valorPagamento });

    if (normalizedStatus === 'confirmed') {
      // Agendamento já confirmado (ex: pagamento imediato)
      WhatsAppService.sendConfirmation(nome, servico, data, hora, telefone)
        .catch(err => console.error('⚠️ Falha ao enviar WhatsApp de confirmação:', err));
    } else {
      // Agendamento pendente — enviar msg de "recebido" ao cliente
      WhatsAppService.sendBookingReceived(nome, servico, data, hora, telefone)
        .catch(err => console.error('⚠️ Falha ao enviar WhatsApp de agendamento recebido:', err));
    }

    return NextResponse.json(
      {
        message: 'Perfeito! O seu agendamento foi registado com sucesso.',
        agendamento,
        id: agendamento.id,
      },
      { status: 201 }
    );
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
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');

    let query = supabase
      .from('appointments')
      .select('*');

    if (data) {
      query = query.eq('data', data).order('hora');
    } else {
      query = query.order('data').order('hora');
    }

    // Check for admin authentication
    const auth = await authenticateRequest(request);
    const isAdmin = auth.authenticated;

    const { data: rows, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar agendamentos:', error);
      return NextResponse.json({ error: 'Erro ao conectar com o servidor.' }, { status: 500 });
    }

    // Map rows based on role
    const agendamentos = (rows || []).map(row => {
      // If not admin, only return non-sensitive fields needed for availability check
      if (!isAdmin) {
        return {
          hora: row.hora,
          duracaoMinutos: row.duracao_minutos || 60,
        };
      }

      // If admin, return full record
      return {
        id: row.id,
        servico: row.servico,
        servicoId: row.servico_id,
        preco: row.preco,
        data: row.data,
        hora: row.hora,
        nome: row.nome,
        telefone: row.telefone,
        email: row.email,
        observacoes: row.observacoes,
        tipoPagamento: row.tipo_pagamento,
        valorPagamento: row.valor_pagamento,
        status: row.status,
        duracaoMinutos: row.duracao_minutos || 60,
        produtos: row.produtos ? (typeof row.produtos === 'string' ? JSON.parse(row.produtos) : row.produtos) : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return NextResponse.json({ agendamentos }, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
