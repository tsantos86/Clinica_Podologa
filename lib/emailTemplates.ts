/**
 * Templates de email para agendamentos
 * Inclui confirmação ao cliente e notificação ao admin
 */

interface BookingEmailData {
  nome: string;
  servico: string;
  data: string;
  hora: string;
  preco: number;
  telefone: string;
  email: string;
  observacoes?: string;
  tipoPagamento?: string;
  valorPagamento?: number;
}

const BRAND_COLOR = '#c9a3ad';
const BRAND_LIGHT = '#f5d5de';
const BRAND_DARK = '#8b6b75';
const SITE_NAME = 'Stephanie Oliveira - Podologia';
const PHONE = '+351 934 504 542';
const EMAIL_CONTACT = 'stepodologa@gmail.com';
const INSTAGRAM = '@stepodologia';

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    return `${day} de ${months[month - 1]} de ${year}`;
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number): string {
  return `€${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Email de confirmação enviado ao CLIENTE após agendamento
 */
export function clientConfirmationEmail(data: BookingEmailData): { subject: string; html: string } {
  const formattedDate = formatDate(data.data);

  return {
    subject: `Confirmação de Agendamento - ${SITE_NAME}`,
    html: `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_DARK}); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
        🦶 ${SITE_NAME}
      </h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
        Podologia Profissional
      </p>
    </div>

    <!-- Success Badge -->
    <div style="text-align: center; padding: 30px 30px 10px;">
      <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 50px; padding: 10px 24px;">
        <span style="color: #059669; font-size: 14px; font-weight: 600;">
          ✅ Agendamento Confirmado
        </span>
      </div>
    </div>

    <!-- Greeting -->
    <div style="padding: 20px 30px 10px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
        Olá <strong>${data.nome}</strong>,
      </p>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 10px 0 0;">
        O seu agendamento foi registado com sucesso! Aqui estão os detalhes:
      </p>
    </div>

    <!-- Booking Details Card -->
    <div style="margin: 20px 30px; background-color: ${BRAND_LIGHT}; border-radius: 12px; padding: 24px; border-left: 4px solid ${BRAND_COLOR};">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">📋 Serviço</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.servico}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">📅 Data</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">⏰ Hora</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.hora}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">💰 Valor</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${formatCurrency(data.preco)}</td>
        </tr>
        ${data.tipoPagamento ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">💳 Pagamento</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
            ${data.tipoPagamento === 'signal' ? 'Sinal' : 'Pagamento Total'}
            ${data.valorPagamento ? ` (${formatCurrency(data.valorPagamento)})` : ''}
          </td>
        </tr>
        ` : ''}
        ${data.observacoes ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">📝 Notas</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${data.observacoes}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Important Notes -->
    <div style="margin: 20px 30px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
      <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 10px;">
        ⚠️ Informações Importantes:
      </p>
      <ul style="color: #78350f; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Por favor, chegue <strong>5 minutos antes</strong> do horário agendado</li>
        <li>Se precisar cancelar ou reagendar, entre em contacto com pelo menos <strong>24 horas de antecedência</strong></li>
        <li>Traga os pés limpos e secos para o atendimento</li>
      </ul>
    </div>

    <!-- Contact Info -->
    <div style="margin: 20px 30px; background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #4b5563; font-size: 14px; font-weight: 600; margin: 0 0 12px;">
        Precisa alterar o agendamento?
      </p>
      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.8;">
        📞 ${PHONE}<br>
        ✉️ ${EMAIL_CONTACT}<br>
        📱 Instagram: ${INSTAGRAM}
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f4f6; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: ${BRAND_COLOR}; font-size: 14px; font-weight: 600; margin: 0;">
        ${SITE_NAME}
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
        Este email foi enviado automaticamente. Por favor não responda diretamente.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 12px 0 0;">
        © ${new Date().getFullYear()} Stephanie Oliveira - Todos os direitos reservados
      </p>
    </div>

  </div>
</body>
</html>
    `,
  };
}

/**
 * Email de notificação enviado à DONA (admin) quando há novo agendamento
 */
export function adminNotificationEmail(data: BookingEmailData): { subject: string; html: string } {
  const formattedDate = formatDate(data.data);

  return {
    subject: `Novo Agendamento: ${data.nome} - ${formattedDate} às ${data.hora}`,
    html: `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4ff;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4338ca, #6366f1); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">
        📋 Novo Agendamento Recebido
      </h1>
    </div>

    <!-- Details -->
    <div style="padding: 30px;">
      <div style="background-color: #f5d5de; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px; width: 130px;">👤 Cliente</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.nome}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">📞 Telefone</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.telefone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">✉️ Email</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">📋 Serviço</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.servico}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">📅 Data</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">⏰ Hora</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.hora}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">💰 Valor</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${formatCurrency(data.preco)}</td>
          </tr>
          ${data.tipoPagamento ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">💳 Pagamento</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
              ${data.tipoPagamento === 'signal' ? 'Sinal' : 'Total'}
              ${data.valorPagamento ? ` - ${formatCurrency(data.valorPagamento)}` : ''}
            </td>
          </tr>
          ` : ''}
          ${data.observacoes ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">📝 Obs</td>
            <td style="padding: 6px 0; color: #1f2937; font-size: 14px;">${data.observacoes}</td>
          </tr>
          ` : ''}
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f4ff; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Notificação automática do sistema de agendamentos
      </p>
    </div>

  </div>
</body>
</html>
    `,
  };
}

/**
 * Email enviado ao CLIENTE quando o agendamento é CONFIRMADO pelo admin
 */
export function clientStatusConfirmedEmail(data: BookingEmailData): { subject: string; html: string } {
  const formattedDate = formatDate(data.data);

  return {
    subject: `Agendamento Confirmado! - ${SITE_NAME}`,
    html: `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
        ✅ Agendamento Confirmado!
      </h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
        ${SITE_NAME}
      </p>
    </div>

    <!-- Greeting -->
    <div style="padding: 30px 30px 10px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
        Olá <strong>${data.nome}</strong>,
      </p>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 10px 0 0;">
        Temos boas notícias! O seu agendamento foi <strong style="color: #059669;">confirmado</strong>. Estamos à sua espera!
      </p>
    </div>

    <!-- Booking Details -->
    <div style="margin: 20px 30px; background-color: #ecfdf5; border-radius: 12px; padding: 24px; border-left: 4px solid #059669;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">📋 Serviço</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.servico}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Data</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">⏰ Hora</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.hora}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">💰 Valor</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${formatCurrency(data.preco)}</td>
        </tr>
      </table>
    </div>

    <!-- Reminder -->
    <div style="margin: 20px 30px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
      <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">📌 Lembrete:</p>
      <p style="color: #78350f; font-size: 13px; line-height: 1.6; margin: 0;">
        Por favor, chegue <strong>5 minutos antes</strong> do horário agendado. Se precisar cancelar, entre em contacto com pelo menos 24 horas de antecedência.
      </p>
    </div>

    <!-- Contact -->
    <div style="margin: 20px 30px; background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.8;">
        📞 ${PHONE}<br>
        ✉️ ${EMAIL_CONTACT}<br>
        📱 Instagram: ${INSTAGRAM}
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0fdf4; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: ${BRAND_COLOR}; font-size: 14px; font-weight: 600; margin: 0;">${SITE_NAME}</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">Este email foi enviado automaticamente. Por favor não responda diretamente.</p>
    </div>

  </div>
</body>
</html>
        `,
  };
}

/**
 * Email enviado ao CLIENTE quando o agendamento é CANCELADO pelo admin
 */
export function clientStatusCancelledEmail(data: BookingEmailData): { subject: string; html: string } {
  const formattedDate = formatDate(data.data);

  return {
    subject: `Agendamento Cancelado - ${SITE_NAME}`,
    html: `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef2f2;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
        ❌ Agendamento Cancelado
      </h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
        ${SITE_NAME}
      </p>
    </div>

    <!-- Greeting -->
    <div style="padding: 30px 30px 10px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
        Olá <strong>${data.nome}</strong>,
      </p>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 10px 0 0;">
        Lamentamos informar que o seu agendamento foi <strong style="color: #dc2626;">cancelado</strong>. Pedimos desculpa por qualquer inconveniente.
      </p>
    </div>

    <!-- Booking Details -->
    <div style="margin: 20px 30px; background-color: #fef2f2; border-radius: 12px; padding: 24px; border-left: 4px solid #dc2626;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">📋 Serviço</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-decoration: line-through;">${data.servico}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Data</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-decoration: line-through;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">⏰ Hora</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-decoration: line-through;">${data.hora}</td>
        </tr>
      </table>
    </div>

    <!-- Reagendar CTA -->
    <div style="margin: 20px 30px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #0369a1; font-size: 14px; font-weight: 600; margin: 0 0 8px;">💡 Deseja reagendar?</p>
      <p style="color: #0284c7; font-size: 13px; line-height: 1.6; margin: 0;">
        Entre em contacto connosco para marcar uma nova data. Teremos todo o gosto em recebê-la!
      </p>
    </div>

    <!-- Contact -->
    <div style="margin: 20px 30px; background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #4b5563; font-size: 14px; font-weight: 600; margin: 0 0 12px;">Contacte-nos:</p>
      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.8;">
        📞 ${PHONE}<br>
        ✉️ ${EMAIL_CONTACT}<br>
        📱 Instagram: ${INSTAGRAM}
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #fef2f2; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: ${BRAND_COLOR}; font-size: 14px; font-weight: 600; margin: 0;">${SITE_NAME}</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">Este email foi enviado automaticamente. Por favor não responda diretamente.</p>
    </div>

  </div>
</body>
</html>
        `,
  };
}

/**
 * Email enviado ao CLIENTE quando o agendamento é marcado como CONCLUÍDO
 */
export function clientStatusCompletedEmail(data: BookingEmailData): { subject: string; html: string } {
  const formattedDate = formatDate(data.data);

  return {
    subject: `Obrigado pela sua visita! - ${SITE_NAME}`,
    html: `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_DARK}); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
        💜 Obrigado pela sua visita!
      </h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
        ${SITE_NAME}
      </p>
    </div>

    <!-- Greeting -->
    <div style="padding: 30px 30px 10px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
        Olá <strong>${data.nome}</strong>,
      </p>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 10px 0 0;">
        Esperamos que tenha ficado satisfeita com o seu tratamento de <strong>${data.servico}</strong> no dia ${formattedDate}.
      </p>
    </div>

    <!-- Feedback CTA -->
    <div style="margin: 20px 30px; background-color: ${BRAND_LIGHT}; border-radius: 12px; padding: 24px; text-align: center;">
      <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 8px;">⭐ A sua opinião é importante!</p>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
        Se tiver um momento, adoraríamos receber o seu feedback. Visite o nosso site para deixar o seu testemunho.
      </p>
    </div>

    <!-- Next booking -->
    <div style="margin: 20px 30px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #0369a1; font-size: 14px; font-weight: 600; margin: 0 0 8px;">📅 Próximo agendamento</p>
      <p style="color: #0284c7; font-size: 13px; line-height: 1.6; margin: 0;">
        Não se esqueça de agendar o seu próximo tratamento para manter a saúde dos seus pés em dia!
      </p>
    </div>

    <!-- Contact -->
    <div style="margin: 20px 30px; background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.8;">
        📞 ${PHONE}<br>
        ✉️ ${EMAIL_CONTACT}<br>
        📱 Instagram: ${INSTAGRAM}
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f4f6; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: ${BRAND_COLOR}; font-size: 14px; font-weight: 600; margin: 0;">${SITE_NAME}</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">Este email foi enviado automaticamente. Por favor não responda diretamente.</p>
      <p style="color: #9ca3af; font-size: 11px; margin: 12px 0 0;">© ${new Date().getFullYear()} Stephanie Oliveira - Todos os direitos reservados</p>
    </div>

  </div>
</body>
</html>
        `,
  };
}
