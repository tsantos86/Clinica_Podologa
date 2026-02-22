import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, logAudit } from '@/lib/db';
import nodemailer from 'nodemailer';
import {
  clientStatusConfirmedEmail,
  clientStatusCancelledEmail,
  clientStatusCompletedEmail,
} from '@/lib/emailTemplates';
import { WhatsAppService } from '@/lib/whatsapp';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeStatus(status?: string) {
  const allowed = new Set(['pending', 'confirmed', 'completed', 'cancelled']);
  return status && allowed.has(status) ? status : undefined;
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

/** Envia email de status ao cliente quando o status muda */
async function sendStatusChangeEmail(appointment: Record<string, unknown>, newStatus: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  if (!appointment.email) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@stepodologia.com';

  const emailData = {
    nome: String(appointment.nome || ''),
    servico: String(appointment.servico || ''),
    data: String(appointment.data || '').split('T')[0],
    hora: String(appointment.hora || ''),
    preco: Number(appointment.preco) || 0,
    telefone: String(appointment.telefone || ''),
    email: String(appointment.email || ''),
    observacoes: appointment.observacoes ? String(appointment.observacoes) : undefined,
    tipoPagamento: appointment.tipo_pagamento ? String(appointment.tipo_pagamento) : undefined,
    valorPagamento: appointment.valor_pagamento ? Number(appointment.valor_pagamento) : undefined,
  };

  let emailContent: { subject: string; html: string } | null = null;

  switch (newStatus) {
    case 'confirmed':
      emailContent = clientStatusConfirmedEmail(emailData);
      break;
    case 'cancelled':
      emailContent = clientStatusCancelledEmail(emailData);
      break;
    case 'completed':
      emailContent = clientStatusCompletedEmail(emailData);
      break;
  }

  if (!emailContent) return;

  try {
    await transporter.sendMail({
      from,
      to: String(appointment.email),
      subject: emailContent.subject,
      html: emailContent.html,
    });
    console.log(`✅ Email de ${newStatus} enviado para ${appointment.email}`);
  } catch (err) {
    console.error(`❌ Erro ao enviar email de ${newStatus}:`, err);
  }
}

/** Envia WhatsApp de status ao cliente quando o status muda */
async function sendStatusChangeWhatsApp(appointment: Record<string, any>, newStatus: string) {
  if (newStatus !== 'confirmed') return; // Meta API exige templates, focamos na confirmação

  try {
    const success = await WhatsAppService.sendConfirmation(
      String(appointment.nome || ''),
      String(appointment.servico || ''),
      String(appointment.data || '').split('T')[0],
      String(appointment.hora || ''),
      String(appointment.telefone || '')
    );

    if (success) {
      console.log(`✅ WhatsApp de confirmação enviado para ${appointment.telefone}`);
    } else {
      console.warn(`⚠️ Falha ao enviar WhatsApp de confirmação para ${appointment.telefone}`);
    }
  } catch (err) {
    console.error(`❌ Erro ao enviar WhatsApp de confirmação:`, err);
  }
}

function mapRow(row: Record<string, unknown>) {
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
    duracaoMinutos: row.duracao_minutos,
    produtos: row.produtos ? (typeof row.produtos === 'string' ? JSON.parse(row.produtos) : row.produtos) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data: row, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(mapRow(row), { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao buscar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id } = await params;

    // Buscar status anterior para detectar mudança
    const { data: previous } = await supabase
      .from('appointments')
      .select('status, email')
      .eq('id', id)
      .single();

    const previousStatus = previous?.status as string | undefined;
    const normalizedStatus = normalizeStatus(body.status);

    const updateData: Record<string, unknown> = {
      servico: body.servico,
      preco: body.preco || 0,
      data: body.data,
      hora: body.hora,
      nome: body.nome,
      telefone: body.telefone,
      status: normalizedStatus || 'pending',
      duracao_minutos: body.duracaoMinutos || 60,
      updated_at: new Date().toISOString(),
    };

    // Campos opcionais
    if (body.servicoId !== undefined) updateData.servico_id = body.servicoId;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;
    if (body.tipoPagamento !== undefined) updateData.tipo_pagamento = body.tipoPagamento;
    if (body.valorPagamento !== undefined) updateData.valor_pagamento = body.valorPagamento;
    if (body.produtos !== undefined) {
      updateData.produtos = Array.isArray(body.produtos) ? JSON.stringify(body.produtos) : body.produtos;
    }

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Audit log
    logAudit({
      entityType: 'appointment',
      entityId: id,
      action: 'update',
      changes: body,
      performedBy: 'admin',
    });

    // Enviar notificações se o status mudou
    const newStatus = normalizedStatus || 'pending';
    if (previousStatus && previousStatus !== newStatus) {
      sendStatusChangeEmail(updated, newStatus);
      sendStatusChangeWhatsApp(updated, newStatus);
    }

    return NextResponse.json(mapRow(updated), { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const normalizedStatus = normalizeStatus(body.status);
    const { id } = await params;

    // Buscar status anterior
    const { data: previous } = await supabase
      .from('appointments')
      .select('status, email')
      .eq('id', id)
      .single();

    const previousStatus = previous?.status as string | undefined;

    // Construir update parcial
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.servico !== undefined) updateData.servico = body.servico;
    if (body.servicoId !== undefined) updateData.servico_id = body.servicoId;
    if (body.preco !== undefined) updateData.preco = body.preco;
    if (body.data !== undefined) updateData.data = body.data;
    if (body.hora !== undefined) updateData.hora = body.hora;
    if (body.nome !== undefined) updateData.nome = body.nome;
    if (body.telefone !== undefined) updateData.telefone = body.telefone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;
    if (body.tipoPagamento !== undefined) updateData.tipo_pagamento = body.tipoPagamento;
    if (body.valorPagamento !== undefined) updateData.valor_pagamento = body.valorPagamento;
    if (body.duracaoMinutos !== undefined) updateData.duracao_minutos = body.duracaoMinutos;
    if (body.produtos !== undefined) {
      updateData.produtos = Array.isArray(body.produtos) ? JSON.stringify(body.produtos) : body.produtos;
    }
    if (normalizedStatus) updateData.status = normalizedStatus;

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Audit log
    logAudit({
      entityType: 'appointment',
      entityId: id,
      action: body.status ? `status_change:${body.status}` : 'partial_update',
      changes: body,
      performedBy: 'admin',
    });

    // Enviar notificações se o status mudou
    const newStatus = String(updated.status);
    if (previousStatus && previousStatus !== newStatus && normalizedStatus) {
      sendStatusChangeEmail(updated, newStatus);
      sendStatusChangeWhatsApp(updated, newStatus);
    }

    return NextResponse.json(mapRow(updated), { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data: deleted, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error || !deleted) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Audit log
    logAudit({
      entityType: 'appointment',
      entityId: id,
      action: 'delete',
      performedBy: 'admin',
    });

    return NextResponse.json({ message: 'Agendamento cancelado.' }, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar com o servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
