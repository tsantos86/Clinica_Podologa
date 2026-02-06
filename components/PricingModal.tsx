'use client';

import Modal from './Modal';
import { motion } from 'framer-motion';
import { useModal } from '@/contexts/ModalContext';

interface PricingItem {
  name: string;
  price: string;
  icon: string;
  featured?: boolean;
  premium?: boolean;
  badge?: string;
}

interface PricingSection {
  category: string;
  color: string;
  items: PricingItem[];
}

const PricingModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'pricing';

  const pricingData: PricingSection[] = [
    {
      category: '🌟 Principais Serviços',
      color: 'from-orange-500 to-orange-400',
      items: [
        { name: 'Terapia Podal', price: '30€', icon: '🦶', featured: true },
        { name: 'Pedicure Medical', price: '35€', icon: '👨‍⚕️' },
        { name: 'SPA dos Pés (completo)', price: '50€', icon: '💆', premium: true },
        { name: 'Plástica dos Pés', price: '45€', icon: '✨' },
        { name: 'Plástica + Gelinho', price: '50€', icon: '💅' },
      ],
    },
    {
      category: '🌸 Pedicure',
      color: 'from-pink-500 to-pink-400',
      items: [
        { name: 'Tradicional + Gelinho', price: '30€', icon: '💅' },
        { name: 'Tradicional + Verniz Tradicional', price: '20€', icon: '🌸' },
      ],
    },
    {
      category: '💼 Pedicure Medical (Pacotes)',
      color: 'from-green-500 to-green-400',
      items: [
        { name: '3 Sessões', price: '90€', icon: '🎫', badge: 'Economize' },
        { name: '5 Sessões', price: '150€', icon: '🎫', badge: 'Melhor Preço' },
      ],
    },
    {
      category: '🎨 Verniz',
      color: 'from-slate-700 to-slate-600',
      items: [
        { name: 'Gelinho Pés', price: '15€', icon: '💅' },
        { name: 'Gelinho c/ Reconstrução', price: '20€', icon: '✨' },
        { name: 'Verniz Tradicional Mãos', price: '10€', icon: '💅' },
        { name: 'Verniz Tradicional Pés', price: '13€', icon: '🦶' },
      ],
    },
    {
      category: '🌿 Outros Serviços',
      color: 'from-cyan-500 to-cyan-400',
      items: [
        { name: 'Parafina Mãos/Pés', price: '10€', icon: '🌿' },
        { name: 'Massagem e Acupuntura Electrónica', price: '30€', icon: '💆‍♀️' },
        { name: 'Escada Pés', price: '30€', icon: '🦶' },
        { name: 'Detox Iónico', price: '15€', icon: '💚' },
        { name: 'Jelly SPA', price: '25€', icon: '💧' },
        { name: 'Jato Plasma', price: '20€', icon: '⚡' },
      ],
    },
    {
      category: '✨ Extras',
      color: 'from-purple-500 to-purple-400',
      items: [
        { name: 'Francesa', price: '5€', icon: '💅' },
        { name: 'Nail Art', price: '1€', icon: '🎨' },
        { name: 'Reconstrução Fungo (cada unha)', price: '5€', icon: '🔧' },
        { name: 'Remoção Verniz Gel', price: '5€', icon: '🧴' },
        { name: 'Remoção Verniz Tradicional', price: '5€', icon: '🧽' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Tabela de Preços" size="lg">
      <div className="p-6">
        <p className="text-text-secondary mb-8 text-center">
          Preços justos e transparentes para cuidar dos seus pés com a qualidade que você merece
        </p>

        <div className="space-y-6">
          {pricingData.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <div
                className={`bg-gradient-to-r ${section.color} text-white px-4 py-3 rounded-button font-bold mb-3 shadow-md`}
              >
                {section.category}
              </div>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                    className={`flex justify-between items-center p-4 rounded-button transition-all ${
                      item.featured
                        ? 'bg-orange-50 border-2 border-orange-200'
                        : item.premium
                        ? 'bg-purple-50 border-2 border-purple-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold text-text-primary">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {item.price}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default PricingModal;
