import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';

export async function GET(request: NextRequest) {
    console.log('🧪 Iniciando TESTE de WhatsApp...');

    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '351934504542';
    const testStatus = {
        tokenConfigured: !!process.env.WHATSAPP_ACCESS_TOKEN,
        phoneIdConfigured: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        adminPhone
    };

    console.log('⚙️ Configuração detectada:', testStatus);

    try {
        const success = await WhatsAppService.notifyAdmin(
            'Teste Sistema',
            'Corte de Unhas',
            '2026-02-25',
            '20:00'
        );

        if (success) {
            return NextResponse.json({
                message: '✅ O teste parece ter sido enviado com sucesso para a Meta!',
                details: testStatus
            });
        } else {
            return NextResponse.json({
                error: '❌ A Meta recusou o envio. Verifique os LOGS da Vercel para o erro detalhado.',
                details: testStatus
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('💥 Erro Crítico no Teste:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
