'use client';

import Modal from './Modal';
import { motion } from 'framer-motion';
import { useModal } from '@/contexts/ModalContext';
import { useServices } from '@/hooks/useServices';
import { Loader2 } from 'lucide-react';

const PricingModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'pricing';
  const { services, loading } = useServices();

  // Agrupar serviços por categoria dinamicamente
  const categories = services.reduce<Record<string, typeof services>>((acc, service) => {
    const cat = service.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  const categoryColors: Record<string, string> = {
    'Pedicura': 'from-orange-500 to-orange-400',
    'Verniz': 'from-slate-700 to-slate-600',
    'Outros': 'from-indigo-500 to-indigo-400',
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Tabela de Preços" size="lg">
      <div className="p-6">
        <p className="text-text-secondary mb-8 text-center">
          Preços atualizados dos serviços de podologia
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <span className="text-text-secondary text-sm">A carregar preços...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(categories).map(([category, items], sectionIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <div
                  className={`bg-gradient-to-r ${categoryColors[category] || 'from-gray-500 to-gray-400'} text-white px-4 py-3 rounded-button font-bold mb-3 shadow-md`}
                >
                  {category}
                </div>
                <div className="space-y-2">
                  {items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="flex justify-between items-center p-4 rounded-button transition-all bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <span className="font-semibold text-text-primary">
                            {item.name}
                          </span>
                          {item.duration && (
                            <p className="text-xs text-text-secondary mt-0.5">
                              ⏱️ {item.duration}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {item.price}€
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PricingModal;
