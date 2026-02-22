/**
 * Camada de serviço para chamadas API
 * Centraliza toda a comunicação com o backend
 */

import { API } from './constants';
import type { Appointment } from '@/types';

/**
 * Classe de erro personalizada para erros de API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Obtém o token de autenticação admin do localStorage (client-side)
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

/**
 * Função auxiliar para fazer requisições HTTP
 * Injeta automaticamente o Authorization header para rotas admin quando disponível
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  try {
    const authHeaders: Record<string, string> = {};

    // Usar token explícito ou auto-detectar para rotas admin
    const token = options?.token || getAuthToken();
    if (token && (endpoint.includes('/admin') || endpoint.includes('/agendamentos'))) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    const { token: _token, ...restOptions } = options || {};

    const response = await fetch(endpoint, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...restOptions?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Erro na requisição',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Erro de rede ou parse
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua internet.',
      undefined,
      error
    );
  }
}

/**
 * Serviço de Agendamentos
 */
export const AppointmentService = {
  /**
   * Busca todos os agendamentos ou de uma data específica
   */
  async getAll(date?: string): Promise<{ agendamentos: Appointment[] }> {
    const url = date
      ? `${API.ENDPOINTS.APPOINTMENTS}?data=${date}`
      : API.ENDPOINTS.APPOINTMENTS;

    return fetchApi<{ agendamentos: Appointment[] }>(url);
  },

  /**
   * Cria um novo agendamento
   */
  async create(data: Partial<Appointment>): Promise<Appointment> {
    const response = await fetchApi<any>(API.ENDPOINTS.APPOINTMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response?.agendamento || response;
  },

  /**
   * Atualiza um agendamento existente
   */
  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return fetchApi<Appointment>(`${API.ENDPOINTS.APPOINTMENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Atualiza parcialmente um agendamento (PATCH)
   */
  async patch(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return fetchApi<Appointment>(`${API.ENDPOINTS.APPOINTMENTS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove um agendamento
   */
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`${API.ENDPOINTS.APPOINTMENTS}/${id}`, {
      method: 'DELETE',
    });
  },


};

/**
 * Serviço de Configurações (Settings)
 */
export const SettingsService = {
  /**
   * Busca configurações de um mês específico ou de todos os meses
   */
  async get(month?: string): Promise<{ bookingsEnabled: boolean }> {
    const url = month
      ? `${API.ENDPOINTS.SETTINGS}?month=${month}`
      : API.ENDPOINTS.SETTINGS;

    return fetchApi<{ bookingsEnabled: boolean }>(url);
  },

  /**
   * Atualiza configurações de agendamento para um mês
   */
  async update(month: string, bookingsEnabled: boolean): Promise<{ bookingsEnabled: boolean }> {
    return fetchApi<{ bookingsEnabled: boolean }>(API.ENDPOINTS.SETTINGS, {
      method: 'POST',
      body: JSON.stringify({ month, bookingsEnabled }),
    });
  },
};

/**
 * Serviço de Email
 */
export const EmailService = {
  /**
   * Envia um email de contato
   */
  async send(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(API.ENDPOINTS.EMAIL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Serviço de Pagamento MB WAY
 */
export const PaymentService = {
  /**
   * Inicia um pagamento MB WAY
   */
  async initiate(data: {
    phone: string;
    amount: number;
    appointmentId?: string;
  }): Promise<{
    transactionId: string;
    status: string;
    message: string;
  }> {
    return fetchApi<{
      transactionId: string;
      status: string;
      message: string;
    }>(API.ENDPOINTS.MBWAY.START, {
      method: 'POST',
      body: JSON.stringify({
        telefone: data.phone,
        valor: data.amount,
        referencia: data.appointmentId
      }),
    });
  },

  /**
   * Consulta o status de um pagamento MB WAY
   */
  async status(transactionId: string): Promise<{
    transactionId: string;
    status: string;
    message: string;
  }> {
    return fetchApi<{
      transactionId: string;
      status: string;
      message: string;
    }>(`${API.ENDPOINTS.MBWAY.STATUS}?referencia=${transactionId}`);
  },
};

/**
 * Função auxiliar para criar FormData de um objeto
 */
export function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

/**
 * Função auxiliar para retry de requisições
 */
export async function retryFetch<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    await new Promise(resolve => setTimeout(resolve, delay));
    return retryFetch(fn, retries - 1, delay * 2);
  }
}
