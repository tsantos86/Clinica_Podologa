'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import type { Testimonial } from '@/types';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Maria Silva',
    text: 'Excelente profissional! Muito atenciosa e cuidadosa. Recomendo!',
    rating: 5,
  },
  {
    id: 2,
    name: 'João Santos',
    text: 'Serviço de qualidade, ambiente limpo e confortável.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ana Costa',
    text: 'A Stephanie é muito profissional e dedicada. Adorei o resultado!',
    rating: 5,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([...INITIAL_TESTIMONIALS]);
  const [showForm, setShowForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    text: '',
    rating: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTestimonial.name && newTestimonial.text) {
      setTestimonials([
        ...testimonials,
        {
          id: testimonials.length + 1,
          ...newTestimonial,
        },
      ]);
      setNewTestimonial({ name: '', text: '', rating: 5 });
      setShowForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.5 }}
      className="space-y-3 mb-8 sm:mb-12"
    >
      {/* Add Testimonial Button */}
      <motion.button
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-background-light text-text-primary font-bold py-3.5 sm:py-4 px-5 sm:px-6 rounded-button border border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex items-center gap-3 sm:gap-4 hover:bg-background-dark touch-manipulation active:scale-95 text-sm sm:text-base"
      >
        <MessageSquare className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">
          {showForm ? 'Cancelar' : 'Partilhar a Minha Experiência'}
        </span>
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

      {/* Testimonial Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="card space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  value={newTestimonial.name}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Seu Depoimento
                </label>
                <textarea
                  value={newTestimonial.text}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, text: e.target.value })
                  }
                  className="input-field min-h-[100px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Avaliação
                </label>
                <div className="flex gap-2">
                  {STAR_VALUES.map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewTestimonial({ ...newTestimonial, rating: star })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newTestimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                Enviar Depoimento
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-6 p-6 rounded-button bg-white shadow-card">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <h2 className="text-xl font-bold text-text-primary">
            Opiniões dos Nossos Clientes
          </h2>
        </div>
        <p className="text-text-secondary text-sm">
          Veja o que dizem quem já foi tratado por nós
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex gap-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-text-secondary italic mb-3">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="text-text-primary font-semibold text-sm">
                — {testimonial.name}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Testimonials;
