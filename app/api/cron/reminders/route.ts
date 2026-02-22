import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { WhatsAppService } from '@/lib/whatsapp';

/**
 * Cron Job: Lembretes 24h via WhatsApp
 * Configurado no vercel.json para rodar diariamente às 08:00 UTC
 * 
 * Envia o template 'lembrete_consulta_24h' para agendamentos
 * confirmados do dia seguinte que ainda não receberam lembrete.
 */
export async function GET(request: NextRequest) {
    // Verificação de segurança — CRON_SECRET deve estar nas env vars da Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = getSupabase();

        // 1. Calcular data de amanhã usando o fuso horário de Portugal
        const now = new Date();
        const ptFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        // Obter data "hoje" em Portugal e somar 1 dia
        const todayPT = new Date(ptFormatter.format(now) + 'T12:00:00');
        todayPT.setDate(todayPT.getDate() + 1);
        const tomorrowStr = todayPT.toISOString().split('T')[0];

        console.log(`📅 Cron Lembretes: Buscando agendamentos para ${tomorrowStr} (Timezone: Europe/Lisbon)`);

        // 2. Buscar agendamentos confirmados para amanhã que ainda não receberam lembrete
        //    Busca onde reminder_sent é NULL ou false
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('data', tomorrowStr)
            .eq('status', 'confirmed')
            .or('reminder_sent.is.null,reminder_sent.eq.false');

        if (error) throw error;

        const results = {
            total: appointments?.length || 0,
            sent: 0,
            failed: 0
        };

        console.log(`📋 Encontrados ${results.total} agendamento(s) para lembrar`);

        if (appointments && appointments.length > 0) {
            for (const appt of appointments) {
                try {
                    const success = await WhatsAppService.sendReminder(
                        appt.nome,
                        appt.hora,
                        appt.telefone
                    );

                    if (success) {
                        // 3. Marcar como enviado para não repetir
                        await supabase
                            .from('appointments')
                            .update({ reminder_sent: true })
                            .eq('id', appt.id);
                        results.sent++;
                        console.log(`✅ Lembrete enviado para ${appt.nome} (${appt.telefone}) — ${appt.hora}`);
                    } else {
                        results.failed++;
                        console.warn(`⚠️ Falha ao enviar lembrete para ${appt.nome} (${appt.telefone})`);
                    }
                } catch (sendError) {
                    results.failed++;
                    console.error(`❌ Erro ao enviar lembrete para ${appt.nome}:`, sendError);
                }
            }
        }

        console.log(`📊 Resultado: ${results.sent} enviados, ${results.failed} falharam, de ${results.total} total`);

        return NextResponse.json({
            success: true,
            date: tomorrowStr,
            timezone: 'Europe/Lisbon',
            ...results
        });

    } catch (error) {
        console.error('❌ Falha no Cron de WhatsApp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
