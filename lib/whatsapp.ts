/**
 * WhatsApp Gateway Service
 * Configuração adaptada para API Oficial da Meta (Cloud API)
 */

import { logAudit } from './db';

// Configuração é lida das variáveis de ambiente
const getMetaConfig = () => ({
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    url: `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
});

export class WhatsAppService {
    /**
     * Formata o número de telemóvel para o padrão internacional (DDI + DDD + Número)
     * A API da Meta exige números "limpos" e com DDI, sem o '+'
     */
    private static formatPhone(phone: string): string {
        // Remover tudo que não é número
        let cleaned = phone.replace(/\D/g, '');

        // Remover prefixo 00 (formato internacional alternativo)
        if (cleaned.startsWith('00')) {
            cleaned = cleaned.slice(2);
        }

        // Se tem 9 dígitos e começa com 9 → número PT sem prefixo
        if (cleaned.length === 9 && cleaned.startsWith('9')) {
            cleaned = '351' + cleaned;
        }

        // Se tem 12 dígitos e começa com 351 → já está correto
        // Se tem outro comprimento, enviar como está (pode ser número internacional)

        return cleaned;
    }

    /**
     * Envia um Template (Obrigatório para mensagens iniciadas pela empresa)
     * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
     */
    static async sendTemplate(
        phone: string,
        templateName: string,
        languageCode: string = 'pt_PT',
        variables: string[] = [] // Variáveis do template {{1}}, {{2}}, etc.
    ): Promise<boolean> {
        const config = getMetaConfig();

        if (!config.token || !config.phoneId) {
            console.warn('⚠️ WhatsApp (Meta API) não configurado. Mensagem não enviada.');
            return false;
        }

        const formattedPhone = this.formatPhone(phone);

        // Estrutura do corpo da mensagem
        const bodyComponents = variables.length > 0
            ? [{
                type: 'body',
                parameters: variables.map(v => ({
                    type: 'text',
                    text: v
                }))
            }]
            : [];

        const payload = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: languageCode
                },
                components: bodyComponents
            }
        };

        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('❌ ERRO META API:', JSON.stringify({
                    status: response.status,
                    statusText: response.statusText,
                    error: responseData
                }, null, 2));
                return false;
            }

            console.log(`✅ WhatsApp enviado com sucesso! (ID: ${responseData.messages?.[0]?.id})`);
            return true;
        } catch (error) {
            console.error('❌ FALHA DE CONEXÃO META:', error);
            return false;
        }
    }

    /**
     * Tenta enviar mensagem de texto simples.
     * ATENÇÃO: Na API Oficial, isso SÓ funciona se o cliente tiver falado com a empresa nas últimas 24h.
     * Caso contrário, a mensagem será rejeitada. Para iniciar conversa, USE TEMPLATES.
     */
    static async sendText(phone: string, message: string): Promise<boolean> {
        const config = getMetaConfig();
        if (!config.token || !config.phoneId) return false;

        const formattedPhone = this.formatPhone(phone);

        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: formattedPhone,
                    type: 'text',
                    text: {
                        body: message,
                        preview_url: false
                    }
                })
            });

            if (!response.ok) {
                // Muito provável de falhar se fora da janela de 24h
                console.warn('⚠️ Falha ao enviar texto livre (provavelmente fora da janela de 24h). Use Templates.');
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Template: Confirmação de Agendamento
     * Nome do Template sugerido: agendamento_confirmado
     * Variáveis esperadas no template: {{1}}=Nome, {{2}}=Serviço, {{3}}=Data, {{4}}=Hora
     */
    static async sendConfirmation(nome: string, servico: string, data: string, hora: string, phone: string) {
        // Você deve criar um template no Meta Manager com o nome configurado no .env ou 'agendamento_confirmado'
        // Exemplo de corpo do template: "Olá {{1}}! Seu agendamento para {{2}} está confirmado para {{3}} às {{4}}. Até breve!"
        const templateName = process.env.WHATSAPP_TEMPLATE_CONFIRMATION || 'agendamento_confirmado';

        return this.sendTemplate(
            phone,
            templateName,
            'pt_PT',
            [nome, servico, data, hora]
        );
    }

    /**
     * Template: Agendamento Recebido (status pending)
     * Enviado imediatamente ao criar a marcação, antes da confirmação do admin.
     * Nome do Template sugerido: agendamento_recebido
     * Variáveis esperadas no template: {{1}}=Nome, {{2}}=Serviço, {{3}}=Data, {{4}}=Hora
     */
    static async sendBookingReceived(nome: string, servico: string, data: string, hora: string, phone: string) {
        // Exemplo de corpo do template: "Olá {{1}}! Recebemos o seu pedido de agendamento para {{2}} no dia {{3}} às {{4}}. Iremos confirmar brevemente. Obrigada!"
        const templateName = process.env.WHATSAPP_TEMPLATE_BOOKING_RECEIVED || 'agendamento_recebido';

        return this.sendTemplate(
            phone,
            templateName,
            'pt_PT',
            [nome, servico, data, hora]
        );
    }

    /**
     * Template: Lembrete 24h Antes
     * Nome do Template sugerido: lembrete_consulta_24h
     *
     * NOVO TEXTO SOLICITADO (Configure no Meta Manager):
     * "Olá! Tudo bem? 😊
     *
     * A sua marcação está confirmada para amanhã {{1}}.
     *
     * 📍 Morada:
     * Rua Luz Soriano, nº 20,
     * Loja 16 – Centro Comercial Girassol
     * 2845-120 Amora
     *
     * ⚠️ Caso a marcação não seja confirmada até às 19h, será cancelada automaticamente.
     *
     * Tolerância máxima de atraso:10 minutos.
     * 💳 Formas de pagamento:
     * Revolut, MB Way ou Dinheiro
     *
     * Obrigada,
     * Stephanie Oliveira"
     *
     * Variáveis esperadas no template: {{1}}=Hora
     */
    static async sendReminder(nome: string, hora: string, phone: string) {
        const templateName = process.env.WHATSAPP_TEMPLATE_REMINDER || 'lembrete_consulta_24h';

        return this.sendTemplate(
            phone,
            templateName,
            'pt_PT',
            [hora] // Agora usando apenas a hora conforme o novo padrão
        );
    }

    /**
     * Notifica a Admin (Stephanie) sobre um novo agendamento
     */
    static async notifyAdmin(nome: string, servico: string, data: string, hora: string) {
        const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '351934504542';
        const templateName = process.env.WHATSAPP_TEMPLATE_BOOKING_RECEIVED || 'agendamento_recebido';

        return this.sendTemplate(
            adminPhone,
            templateName,
            'pt_PT',
            [nome, servico, data, hora]
        );
    }
}
