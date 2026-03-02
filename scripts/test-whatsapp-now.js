
const fetch = require('node-fetch');
require('dotenv').config();

// CONFIGURAÇÃO MANUAL DE TESTE (Preencha aqui para testar na hora)
const TEST_CONFIG = {
    TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || 'COLE_SEU_TOKEN_AQUI',
    PHONE_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || 'COLE_SEU_ID_AQUI',
    DESTINATION: '351934504542', // Seu número para teste
    TEMPLATE_NAME: 'agendamento_recebido' // O nome do seu template no Meta
};

async function testWhatsApp() {
    console.log('🚀 Iniciando teste de WhatsApp...');
    console.log(`📍 Usando Phone ID: ${TEST_CONFIG.PHONE_ID}`);
    console.log(`📝 Template: ${TEST_CONFIG.TEMPLATE_NAME}`);

    const url = `https://graph.facebook.com/v22.0/${TEST_CONFIG.PHONE_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: TEST_CONFIG.DESTINATION,
        type: 'template',
        template: {
            name: TEST_CONFIG.TEMPLATE_NAME,
            language: { code: 'pt_PT' },
            components: [{
                type: 'body',
                parameters: [
                    { type: 'text', text: 'Cliente Teste' },
                    { type: 'text', text: 'Serviço Teste' },
                    { type: 'text', text: '2024-01-01' },
                    { type: 'text', text: '10:00' }
                ]
            }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCESSO! A mensagem deve chegar ao seu telemóvel em segundos.');
        } else {
            console.error('❌ ERRO DA META:', JSON.stringify(data, null, 2));
            console.log('\n💡 DICA: Se aparecer "template not found", o nome no Facebook é diferente de "agendamento_recebido".');
        }
    } catch (error) {
        console.error('❌ ERRO DE CONEXÃO:', error.message);
    }
}

testWhatsApp();
