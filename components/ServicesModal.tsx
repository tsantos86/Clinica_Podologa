'use client';

import Modal from './Modal';
import { services, serviceCategories } from '@/lib/services';
import { motion } from 'framer-motion';
import { useModal } from '@/contexts/ModalContext';

const ServicesModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'services';

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal} title="Serviços de Podologia" size="lg">
        <div className="p-6">
          <p className="text-text-secondary mb-8 text-center">
            Cuidados especializados para que os seus pés fiquem saudáveis, bonitos e bem tratados
          </p>

          {serviceCategories.map((category) => {
            const categoryServices = services.filter((s) => s.category === category);
            if (categoryServices.length === 0) return null;

            return (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card relative overflow-hidden group hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{service.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-text-primary mb-1">
                              {service.name}
                            </h4>
                            {service.badge && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  service.badge === 'popular'
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'bg-purple-100 text-purple-600'
                                }`}
                              >
                                {service.badge === 'popular' ? 'Popular' : 'Premium'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary">
                            {service.description}
                          </p>
                          <p className="text-lg font-bold text-primary mt-2">
                            {service.price}€
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default ServicesModal;
