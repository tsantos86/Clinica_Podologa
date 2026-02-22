// Hook para gerenciar fotos de serviços
// Centraliza a lógica de upload, cache e sincronização

import { useCallback, useEffect, useState } from 'react';
import { UPLOAD, CACHE } from '@/lib/constants';

interface UseServicePhotosReturn {
  photos: Record<string, string>;
  isLoading: boolean;
  uploadPhoto: (serviceId: string, file: File) => Promise<void>;
  removePhoto: (serviceId: string) => Promise<void>;
  sync: () => Promise<void>;
}

export function useServicePhotos(): UseServicePhotosReturn {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Sincronizar fotos do servidor
  const sync = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Erro ao sincronizar fotos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fazer upload de foto
  const uploadPhoto = useCallback(
    async (serviceId: string, file: File) => {
      // Validar arquivo
      if (!UPLOAD.ACCEPTED_FORMATS.includes(file.type as any)) {
        throw new Error(`Formato inválido. Aceitos: JPEG e PNG`);
      }

      if (file.size > UPLOAD.MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande. Máximo: ${UPLOAD.MAX_FILE_SIZE_LABEL}`);
      }

      const formData = new FormData();
      formData.append('serviceId', serviceId);
      formData.append('file', file);

      try {
        const response = await fetch('/api/services/photos', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''}`,
          },
        });

        if (!response.ok) {
          let message = 'Erro ao fazer upload';
          try {
            const error = await response.json();
            message = error.error || message;
          } catch {
            try {
              const text = await response.text();
              if (text) message = text;
            } catch {
              // Keep default message
            }
          }
          throw new Error(message);
        }

        const data = await response.json();
        setPhotos((prev) => ({ ...prev, [serviceId]: data.url }));
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        throw error;
      }
    },
    []
  );

  // Remover foto
  const removePhoto = useCallback(async (serviceId: string) => {
    try {
      const response = await fetch('/api/services/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''}`,
        },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover foto');
      }

      setPhotos((prev) => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      throw error;
    }
  }, []);

  // Carregar fotos ao montar
  useEffect(() => {
    sync();
  }, [sync]);

  return {
    photos,
    isLoading,
    uploadPhoto,
    removePhoto,
    sync,
  };
}
