/**
 * Hooks customizados para gerenciar estado e lógica reutilizável
 */

import { useState, useEffect, useCallback } from 'react';
import { AppointmentService, SettingsService, ApiError } from '@/lib/api';
import { CACHE, CLOSED_DAYS, ERROR_MESSAGES } from '@/lib/constants';
import { toast } from 'sonner';
import type { Appointment } from '@/types';

/**
 * Hook para gerenciar autenticação de admin
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem(CACHE.AUTH_KEY);
    setIsAuthenticated(auth === 'true');
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    localStorage.setItem(CACHE.AUTH_KEY, 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CACHE.AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}

/**
 * Hook para buscar e gerenciar agendamentos
 */
export function useAppointments(autoLoad = false) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await AppointmentService.getAll(date);
      setAppointments(data.agendamentos || []);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.NETWORK;
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointment: Partial<Appointment>) => {
    try {
      const newAppointment = await AppointmentService.create(appointment);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.GENERIC;
      
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (
    id: string, 
    updates: Partial<Appointment>
  ) => {
    // Optimistic update
    const previousAppointments = [...appointments];
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt)
    );

    try {
      await AppointmentService.patch(id, updates);
    } catch (err) {
      // Rollback em caso de erro
      setAppointments(previousAppointments);
      
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.GENERIC;
      
      toast.error(errorMessage);
      throw err;
    }
  }, [appointments]);

  const deleteAppointment = useCallback(async (id: string) => {
    // Optimistic delete
    const previousAppointments = [...appointments];
    setAppointments(prev => prev.filter(apt => apt.id !== id));

    try {
      await AppointmentService.delete(id);
    } catch (err) {
      // Rollback em caso de erro
      setAppointments(previousAppointments);
      
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.GENERIC;
      
      toast.error(errorMessage);
      throw err;
    }
  }, [appointments]);

  useEffect(() => {
    if (autoLoad) {
      fetchAppointments();
    }
  }, [autoLoad, fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    setAppointments,
  };
}

/**
 * Hook para verificar configurações de agendamento de um mês
 */
export function useBookingSettings(month?: string) {
  const [bookingsEnabled, setBookingsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!month) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await SettingsService.get(month);
        setBookingsEnabled(data.bookingsEnabled);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        // Em caso de erro, assume que está aberto
        setBookingsEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [month]);

  const toggleBookings = useCallback(async (newMonth: string) => {
    const newStatus = !bookingsEnabled;
    
    // Optimistic update
    setBookingsEnabled(newStatus);

    try {
      await SettingsService.update(newMonth, newStatus);
    } catch (err) {
      // Rollback em caso de erro
      setBookingsEnabled(!newStatus);
      
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.GENERIC;
      
      toast.error(errorMessage);
      throw err;
    }
  }, [bookingsEnabled]);

  return {
    bookingsEnabled,
    loading,
    toggleBookings,
    setBookingsEnabled,
  };
}

/**
 * Hook para validar e filtrar dias de trabalho
 */
export function useWorkingDays() {
  const isWorkingDay = useCallback((date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    const dayOfWeek = d.getDay();
    
    return !CLOSED_DAYS.includes(dayOfWeek as any);
  }, []);

  const getClosedDayMessage = useCallback((date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    const dayOfWeek = d.getDay();
    
    if (dayOfWeek === 0) return 'Domingo é dia de descanso';
    if (dayOfWeek === 4) return 'Quinta-feira é dia de descanso';
    
    return null;
  }, []);

  return {
    isWorkingDay,
    getClosedDayMessage,
  };
}

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para gerenciar estado de loading com timeout
 */
export function useLoadingWithTimeout(timeout: number = 10000) {
  const [loading, setLoading] = useState(false);

  const startLoading = useCallback(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
      toast.error('A operação demorou muito tempo. Por favor, tente novamente.');
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    startLoading,
    stopLoading,
    setLoading,
  };
}

/**
 * Hook para detectar clique fora de um elemento
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [handler]);

  return ref;
}

/**
 * Hook para detectar tamanho de tela
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * Hook para detectar se está em mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

import { useRef } from 'react';
