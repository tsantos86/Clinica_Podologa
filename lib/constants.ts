/**
 * Constantes centralizadas do projeto
 * Apenas dados estáticos. Sem funções ou lógica computada.
 */

// URLs e Endpoints
export const API = {
  ENDPOINTS: {
    APPOINTMENTS: '/api/agendamentos',
    SETTINGS: '/api/settings',
    EMAIL: '/api/email',
    SERVICES: '/api/services',
    PRODUCTS: '/api/products',
    MBWAY: {
      START: '/api/mbway/iniciar',
      STATUS: '/api/mbway/status',
      CALLBACK: '/api/mbway/callback',
    },
  },
} as const;

// ── Configurações de Agenda ──────────────────────────────
// Dias da semana não úteis (0 = Domingo, 4 = Quinta)
export const CLOSED_DAYS = [0, 4] as const;

/** Intervalo entre slots de horário (minutos) */
export const SCHEDULE = {
  SLOT_INTERVAL: 30,
  HYGIENIZATION_TIME: 0,
  OPENING_TIME: '08:30',
  CLOSING_TIME: '18:30',
  LAST_START_TIME: '17:30',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'Agendamento realizado com sucesso! Entraremos em contacto em breve.',
  APPOINTMENT_UPDATED: 'Agendamento atualizado com sucesso!',
  APPOINTMENT_DELETED: 'Agendamento cancelado com sucesso.',
  EMAIL_SENT: 'Mensagem enviada! Responderemos o mais breve possível.',
  MONTH_OPENED: 'Agendamentos abertos para este mês. Clientes já podem agendar!',
  MONTH_CLOSED: 'Agendamentos fechados para este mês. Clientes não poderão agendar.',
  LOGIN_SUCCESS: 'Bem-vinda de volta! ✨',
  PAYMENT_CONFIRMED: 'Pagamento confirmado! Agendamento garantido.',
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
  GENERIC: 'Algo correu mal. Por favor, tente novamente.',
  NETWORK: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
  APPOINTMENT_NOT_FOUND: 'Agendamento não encontrado. Por favor, atualize a página.',
  SLOT_UNAVAILABLE: 'Este horário já não está disponível. Por favor, escolha outro.',
  INVALID_DATE: 'Por favor, selecione uma data válida.',
  INVALID_TIME: 'Por favor, selecione um horário.',
  INVALID_PHONE: 'Por favor, insira um número de telefone válido (ex: 912345678).',
  INVALID_EMAIL: 'Por favor, insira um email válido.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  CLOSED_DAY: 'Quinta e domingo são dias de descanso. Por favor, escolha outro dia.',
  BOOKINGS_CLOSED: 'Desculpe, não estamos a aceitar agendamentos neste momento.',
  LOGIN_FAILED: 'Email ou senha incorretos. Tente novamente.',
  UNAUTHORIZED: 'Precisa de fazer login para aceder a esta página.',
  TIME_OVERFLOW: 'Este horário ultrapassa o horário de funcionamento (fecho às 18:30).',
  OVERLAP: 'Este horário conflita com outro agendamento existente.',
} as const;

// Mensagens informativas
export const INFO_MESSAGES = {
  DEMO_MODE: 'Modo demonstração: usando dados de exemplo',
  LOADING: 'A carregar...',
  PROCESSING: 'A processar...',
  SAVING: 'A guardar...',
  DELETING: 'A remover...',
  SENDING: 'A enviar...',
  NO_APPOINTMENTS: 'Nenhum agendamento para este dia.',
  NO_RESULTS: 'Nenhum resultado encontrado.',
  SELECT_SERVICE: 'Escolha o serviço que deseja',
  SELECT_DATE: 'Escolha uma data que lhe seja conveniente',
  SELECT_TIME: 'Escolha o horário que prefere',
  FILL_DETAILS: 'Preencha os seus dados de contacto',
  PAYMENT_INFO: 'Para garantir o seu agendamento, é necessário um sinal de 10€',
} as const;

// Mensagens de confirmação
export const CONFIRMATION_MESSAGES = {
  DELETE_APPOINTMENT: 'Tem certeza que deseja cancelar este agendamento?',
  OPEN_MONTH: (monthName: string) =>
    `Deseja abrir os agendamentos de ${monthName}?\n\n✅ Clientes poderão agendar para este mês`,
  CLOSE_MONTH: (monthName: string) =>
    `Deseja fechar os agendamentos de ${monthName}?\n\n❌ Clientes não poderão agendar para este mês`,
  LOGOUT: 'Tem certeza que deseja sair?',
} as const;

// Configurações de validação
export const VALIDATION = {
  PHONE: {
    PATTERN: /^[0-9]{9}$/,
    MESSAGE: 'Número de telefone deve ter 9 dígitos',
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Por favor, insira um email válido',
  },
  NAME: {
    MIN_LENGTH: 3,
    MESSAGE: 'Nome deve ter pelo menos 3 caracteres',
  },
} as const;

// Status de agendamentos
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Labels para status
export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pendente',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmado',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelado',
  [APPOINTMENT_STATUS.COMPLETED]: 'Concluído',
} as const;

// Cores para status
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: 'orange',
  [APPOINTMENT_STATUS.CONFIRMED]: 'green',
  [APPOINTMENT_STATUS.CANCELLED]: 'red',
  [APPOINTMENT_STATUS.COMPLETED]: 'blue',
} as const;

// Autenticação via Supabase Auth (sem credenciais hardcoded)

// Configurações de cache
export const CACHE = {
  AUTH_KEY: 'admin_authenticated',
  APPOINTMENTS_TTL: 5 * 60 * 1000, // 5 minutos
} as const;

// Meses do ano em português
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const;

// Dias da semana em português
export const DAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
] as const;

// Configurações de paginação
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGES_SHOWN: 5,
} as const;

// Configurações de upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  MAX_FILE_SIZE_LABEL: '5MB',
} as const;
