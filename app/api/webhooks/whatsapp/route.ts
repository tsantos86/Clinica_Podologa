import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook para WhatsApp Cloud API (Meta)
 * Serve para validação do endpoint e recebimento de eventos (status de mensagens, respostas de clientes)
 */

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // O VERIFY_TOKEN deve ser configurado no Meta Developer Portal e no .env do Vercel
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('✅ Webhook WhatsApp verificado com sucesso!');
            return new NextResponse(challenge, { status: 200 });
        } else {
            console.error('❌ Falha na verificação do Webhook: Token incorreto');
            return new NextResponse('Forbidden', { status: 403 });
        }
    }

    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log para depuração em desenvolvimento
        // console.log('📩 Evento WhatsApp recebido:', JSON.stringify(body, null, 2));

        // Aqui você pode processar status de mensagens (sent, delivered, read)
        // Ou respostas automáticas se o cliente escrever algo.

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
            // Cliente enviou uma mensagem
            const message = value.messages[0];
            const from = message.from;
            const text = message.text?.body;

            console.log(`💬 Mensagem de ${from}: ${text}`);

            // Exemplo: Salvar no banco ou notificar admin
        }

        if (value?.statuses) {
            // Status de uma mensagem enviada por nós
            const status = value.statuses[0];
            // console.log(`📊 Status da mensagem ${status.id}: ${status.status}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Erro ao processar Webhook WhatsApp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
