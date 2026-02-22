'use client';

import { useState, useEffect, useCallback } from 'react';
import { useServices } from '@/hooks/useServices';
import { toast } from 'sonner';
import { Upload, Trash2, Camera, Loader2, Euro, Save, X, RefreshCw } from 'lucide-react';

interface ServicesPhotosPanelProps {
  token: string;
}

export default function ServicesPhotosPanel({ token }: ServicesPhotosPanelProps) {
  const { services, loading: servicesLoading, refresh: refreshServices } = useServices();
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState('');

  // Carregar fotos do servidor
  const fetchPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleRefresh = async () => {
    await Promise.all([fetchPhotos(), refreshServices()]);
    toast.success('Dados atualizados');
  };

  const handleUpload = async (serviceId: string, file: File | null) => {
    if (!file) return;

    // Validar tipo
    const accepted = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!accepted.includes(file.type)) {
      toast.error('Formato inválido. Aceitos: JPEG, PNG, WebP');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ficheiro muito grande (máx. 5MB)');
      return;
    }

    setUploadingId(serviceId);

    try {
      const formData = new FormData();
      formData.append('serviceId', serviceId);
      formData.append('file', file);

      const response = await fetch('/api/services/photos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let msg = 'Erro ao fazer upload';
        try {
          const err = await response.json();
          msg = err.error || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const data = await response.json();
      setPhotos(prev => ({ ...prev, [serviceId]: data.url }));
      toast.success('Foto atualizada com sucesso! 📸');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload');
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemove = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja remover esta foto?')) return;

    try {
      const response = await fetch('/api/services/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao remover foto');
      }

      setPhotos(prev => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
      toast.success('Foto removida');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover foto');
    }
  };

  const startEditPrice = (serviceId: string, currentPrice: number) => {
    setEditingPrice(serviceId);
    setPriceValue(String(currentPrice));
  };

  const cancelEditPrice = () => {
    setEditingPrice(null);
    setPriceValue('');
  };

  const savePrice = async (serviceId: string) => {
    const newPrice = Math.floor(parseFloat(priceValue));
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Preço inválido');
      return;
    }

    try {
      const response = await fetch('/api/admin/services/prices', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId, price: newPrice }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar preço');
      }

      // Refresh de serviços para atualizar preços em todo o site
      await refreshServices();
      toast.success('Preço atualizado! O novo preço aparecerá no site 💰');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar preço');
    } finally {
      setEditingPrice(null);
      setPriceValue('');
    }
  };

  const photosCount = Object.keys(photos).length;
  const totalServices = services.length;

  if (isLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">A carregar serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços & Fotos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerir fotos e preços dos serviços — as alterações refletem no site público
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-indigo-600"
          title="Atualizar dados"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalServices}</p>
          <p className="text-xs text-gray-500 mt-1">Total Serviços</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{photosCount}</p>
          <p className="text-xs text-gray-500 mt-1">Com Foto</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{totalServices - photosCount}</p>
          <p className="text-xs text-gray-500 mt-1">Sem Foto</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        {services.map((service) => {
          const hasPhoto = !!photos[service.id];
          const isUploading = uploadingId === service.id;
          const isEditingThisPrice = editingPrice === service.id;
          const currentPrice = service.price;

          return (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Photo Section */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
                  {hasPhoto ? (
                    <img
                      src={photos[service.id]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Camera className="w-10 h-10 mb-2" />
                      <span className="text-xs">Sem foto</span>
                    </div>
                  )}

                  {/* Upload overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}

                  {/* Photo actions */}
                  <div className="absolute bottom-2 right-2 flex gap-1.5">
                    <label className="p-2 bg-white/90 hover:bg-white rounded-lg cursor-pointer shadow-sm transition-colors">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => handleUpload(service.id, e.target.files?.[0] || null)}
                      />
                    </label>
                    {hasPhoto && (
                      <button
                        onClick={() => handleRemove(service.id)}
                        disabled={isUploading}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{service.icon}</span>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{service.description}</p>

                      {/* Duration */}
                      {service.duration && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          ⏱️ {service.duration}
                        </span>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="flex-shrink-0">
                      {isEditingThisPrice ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            className="w-20 px-2 py-1.5 border border-indigo-300 rounded-lg text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePrice(service.id);
                              if (e.key === 'Escape') cancelEditPrice();
                            }}
                          />
                          <span className="text-sm font-bold text-gray-500">€</span>
                          <button
                            onClick={() => savePrice(service.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditPrice}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditPrice(service.id, currentPrice)}
                          className="group flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Clique para editar preço"
                        >
                          <span className="text-lg font-bold text-indigo-700">
                            {currentPrice}€
                          </span>
                          <Euro className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  {service.details && service.details.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {service.details.map((detail, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Photo status badge */}
                  <div className="mt-3">
                    {hasPhoto ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        📸 Com foto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        ⚠️ Sem foto
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
