'use client';

import { useState, useEffect, useCallback } from 'react';
import { services as defaultServices } from '@/lib/services';
import { parseDuration } from '@/lib/utils/schedule';
import type { Service } from '@/types';

export interface ServiceWithPrice extends Service {
    defaultPrice: number;
    photoUrl?: string | null;
}

/**
 * Hook para buscar serviços com preços e durações atualizados do backend.
 *
 * Fallback: se a API falhar, usa os dados hardcoded de lib/services.ts.
 * Os dados do admin panel têm prioridade.
 */
export function useServices() {
    const [services, setServices] = useState<ServiceWithPrice[]>(
        defaultServices
            .filter(s => s.active !== false)
            .map(s => ({
                ...s,
                durationMinutes: s.durationMinutes || parseDuration(s.duration),
                defaultPrice: s.price,
                photoUrl: null,
            }))
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                if (data.services && Array.isArray(data.services)) {
                    setServices(data.services.map((s: ServiceWithPrice) => ({
                        ...s,
                        durationMinutes: s.durationMinutes || parseDuration(s.duration),
                    })));
                }
            } else {
                console.warn('Falha ao buscar serviços do API, usando fallback');
            }
        } catch (err) {
            console.warn('Erro ao buscar serviços, usando preços padrão:', err);
            setError('Não foi possível carregar preços atualizados');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const getServiceById = useCallback((id: string) => {
        return services.find(s => s.id === id);
    }, [services]);

    const getServiceByName = useCallback((name: string) => {
        return services.find(s => s.name === name);
    }, [services]);

    return {
        services,
        loading,
        error,
        refresh: fetchServices,
        getServiceById,
        getServiceByName,
    };
}
