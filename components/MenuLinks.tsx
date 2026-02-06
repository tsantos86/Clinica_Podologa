'use client';

import { motion } from 'framer-motion';
import { FootprintsIcon, Euro, Clock, User } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

const MenuLinks = () => {
  const { openModal } = useModal();

  const links = [
    {
      label: 'Serviços de Podologia',
      icon: FootprintsIcon,
      action: 'services',
    },
    {
      label: 'Preçário',
      icon: Euro,
      action: 'pricing',
    },
    {
      label: 'Horários',
      icon: Clock,
      action: 'schedule',
    },
    {
      label: 'Sobre Mim',
      icon: User,
      action: 'about',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="space-y-3 mb-3"
    >
      {links.map((link, index) => (
        <motion.button
          key={link.action}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal(link.action)}
          className="w-full bg-background-light text-text-primary font-bold py-3.5 sm:py-4 px-5 sm:px-6 rounded-button border border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex items-center gap-3 sm:gap-4 hover:bg-background-dark touch-manipulation active:scale-95 text-sm sm:text-base"
        >
          <link.icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">{link.label}</span>
          <svg
            className="w-5 h-5 text-text-light flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default MenuLinks;
