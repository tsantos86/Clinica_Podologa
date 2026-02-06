'use client';

import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '@/contexts/ModalContext';

const PrimaryActionButton = () => {
  const { openModal } = useModal();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="mb-6 sm:mb-8"
    >
      <button
        onClick={() => openModal('booking')}
        className="w-full bg-background-light text-text-primary font-bold py-4 sm:py-5 px-5 sm:px-6 rounded-button border border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:bg-background-dark flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl touch-manipulation"
      >
        <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
        Marcar a Minha Consulta
      </button>
    </motion.div>
  );
};

export default PrimaryActionButton;
