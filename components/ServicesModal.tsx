'use client';

import { useMemo } from 'react';
import Modal from './Modal';
import { useServices } from '@/hooks/useServices';
import { useModal } from '@/contexts/ModalContext';
import { useServicePhotos } from '@/hooks/useServicePhotos';
import ServiceCard from './ServiceCard';

const ServicesModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'services';
  const { photos, isLoading: photosLoading } = useServicePhotos();
  const { services, loading: servicesLoading } = useServices();
  const isLoading = photosLoading || servicesLoading;

  // Agrupar serviços por categoria dinamicamente
  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    // Garantir ordem consistente (Pedicura primeiro se existir)
    const sorted = Array.from(cats);
    return sorted.sort((a, b) => {
      if (a === 'Pedicura') return -1;
      if (b === 'Pedicura') return 1;
      return a.localeCompare(b);
    });
  }, [services]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal} title="Serviços de Podologia" size="lg">
        <div className="p-6">
          <p className="text-text-secondary mb-8 text-center">
            Serviços de podologia com foco em saúde, conforto e estética dos seus pés
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">⏳</div>
              <span className="ml-2 text-text-secondary">A carregar serviços...</span>
            </div>
          ) : (
            <>
              {categories.map((category) => {
                const categoryServices = services.filter((s) => s.category === category);
                if (categoryServices.length === 0) return null;

                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-bold text-text-primary mb-4">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {categoryServices.map((service, index) => (
                        <div key={service.id} className="relative">
                          <ServiceCard
                            service={service}
                            photoUrl={photos[service.id]}
                            index={index}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {services.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Nenhum serviço disponível no momento.
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ServicesModal;
