import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { WhatsAppService } from '@/lib/whatsapp';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy para backend Express
 * GET /api/mbway/status - Verificar status do pagamento
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referencia = searchParams.get('referencia') || searchParams.get('transactionId');

    if (!referencia) {
      return NextResponse.json(
        { error: 'Referência ou Transaction ID não fornecida' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/pagamento/status/${referencia}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    // Lógica Senior: Se o pagamento foi confirmado, atualizamos o DB e enviamos WhatsApp
    if (response.ok && (data.status === 'PAID' || data.status === 'CONFIRMED')) {
      const supabase = getSupabase();

      // 1. Buscar agendamento para garantir que ainda está pendente
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', referencia)
        .single();

      if (appointment && appointment.status === 'pending') {
        // 2. Atualizar status para confirmado
        await supabase
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', referencia);

        // 3. Enviar WhatsApp de Confirmação (Async para não travar a resposta)
        // Usamos as variáveis dinâmicas do agendamento
        WhatsAppService.sendConfirmation(
          appointment.nome,
          appointment.servico,
          appointment.data,
          appointment.hora,
          appointment.telefone
        ).catch(err => console.error('⚠️ Falha ao enviar WhatsApp:', err));
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Erro ao verificar status (Network/Proxy):', error);
    return NextResponse.json(
      { error: 'Não foi possível contactar o servidor de pagamentos' },
      { status: 502 }
    );
  }
}
