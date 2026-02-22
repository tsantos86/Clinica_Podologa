/**
 * WhatsApp Gateway Service
 * Configuração adaptada para API Oficial da Meta (Cloud API)
 */

import { logAudit } from './db';

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Padrão de URL da API Meta: https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages
const META_API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

export class WhatsAppService {
    /**
     * Formata o número de telemóvel para o padrão internacional (DDI + DDD + Número)
     * A API da Meta exige números "limpos" e com DDI, sem o '+'
     */
    private static formatPhone(phone: string): string {
        let cleaned = phone.replace(/\D/g, '');

        // Se começar com 9 e tiver 9 dígitos, assume Portugal
        if (cleaned.length === 9 && cleaned.startsWith('9')) {
            cleaned = '351' + cleaned;
        }

        // Se não tiver o prefixo 351 mas tiver 9 dígitos começados por 9
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
        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
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
            const response = await fetch(META_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro na API Meta (WhatsApp):', JSON.stringify(errorData, null, 2));
                return false;
            }

            // Sucesso!
            const responseData = await response.json();
            // Opcional: Logar a msgID
            // console.log('✅ Mensagem enviada via Meta:', responseData.messages[0].id);
            return true;
        } catch (error) {
            console.error('❌ Falha de conexão com API Meta:', error);
            return false;
        }
    }

    /**
     * Tenta enviar mensagem de texto simples.
     * ATENÇÃO: Na API Oficial, isso SÓ funciona se o cliente tiver falado com a empresa nas últimas 24h.
     * Caso contrário, a mensagem será rejeitada. Para iniciar conversa, USE TEMPLATES.
     */
    static async sendText(phone: string, message: string): Promise<boolean> {
        // Implementação básica de texto livre (reply apenas)
        // Se precisar iniciar conversa, use sendTemplate
        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return false;

        const formattedPhone = this.formatPhone(phone);

        try {
            const response = await fetch(META_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: formattedPhone,
                    type: 'text',
                    text: { // Objeto text corrigido
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
     * Variáveis esperadas no template: {{1}}=Nome, {{2}}=Hora
     */
    static async sendReminder(nome: string, hora: string, phone: string) {
        // Exemplo de corpo do template: "Olá {{1}}! Lembramos que sua consulta é amanhã às {{2}}. Endereço: Rua Luz Soriano 20. Confirme ou reagende se necessário."
        const templateName = process.env.WHATSAPP_TEMPLATE_REMINDER || 'lembrete_consulta_24h';

        return this.sendTemplate(
            phone,
            templateName,
            'pt_PT',
            [nome, hora]
        );
    }
}
