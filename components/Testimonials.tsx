'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import type { Testimonial } from '@/types';
import TestimonialForm from './TestimonialForm';

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Joana Martins',
    text: 'Bom dia alegria! Não senti nada nos pés, nada de nada. Obrigada, Stef, mãos maravilhosas!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Bianca Calheiros',
    text: 'Gosto muito do seu trabalho e pretendo voltar mais vezes.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Eliana Santos',
    text: 'Não tenho razão nenhuma de queixa do teu trabalho, amo e recomendo os teus serviços!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Carla Mendonça',
    text: 'Gosto muito do teu trabalho, és 5 estrelas. Fazes tudo com perfeição. Ainda bem que apareceste na minha vida. És batalhadora e trabalhas super bem.',
    rating: 5,
  },
  {
    id: 5,
    name: 'João Costa',
    text: 'Desde que comecei a fazer os tratamentos consegui ver melhoria na saúde dos meus pés. Antes tinha desconforto fúngico e muita pele, mas seguindo os seus tratamentos os meus pés estão muito melhores. Muito obrigado.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Izabel Cristina',
    text: 'Adoro o seu trabalho. Sinceramente, pra mim foi a podóloga melhor que encontrei até hoje. Além de ser a profissional que és, é simpática, comunicativa e muito prestativa. Adoro o seu trabalho!',
    rating: 5,
  },
  {
    id: 7,
    name: 'Marieta Venâncio',
    text: 'Da minha parte, nada a acrescentar. Todas as vezes que fui sempre foi muito bom. Espero ter ajudado. Bjsss',
    rating: 5,
  },
  {
    id: 8,
    name: 'Susana Prazeres',
    text: 'Sim, bastante! Porque não te conheci antes? Sinto que tenho outros pés! Ainda vou no primeiro tratamento e já estou maravilhada. Obrigada 🥰 Está a correr muito bem 😍 Estou ansiosa para voltar ❤️ E muito obrigada por perguntares, és uma pessoa muito querida.',
    rating: 5,
  },
  {
    id: 9,
    name: 'Clau Cliente',
    text: 'Oi Sté, tudo bem? Quero agradecer-te por cuidares dos meus pés com tanto cuidado e carinho. Em três meses as minhas unhas melhoraram muito com os teus cuidados e as tuas dicas ❤️ A cada mês que passa sinto-me mais confortável com os meus pés. Agradeço-te de coração por aumentares a minha auto-estima e tratares uma das minhas maiores inseguranças. Amei mais ainda agora que já podemos pintá-las ❤️',
    rating: 5,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([...INITIAL_TESTIMONIALS]);
  const [showForm, setShowForm] = useState(false);

  // Fetch approved testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          if (data.testimonials && data.testimonials.length > 0) {
            // Use API testimonials, map to expected shape
            const apiTestimonials: Testimonial[] = data.testimonials.map((t: { id: string; name: string; text: string; rating: number }, i: number) => ({
              id: i + 100, // offset to avoid collisions with initial
              name: t.name,
              text: t.text,
              rating: t.rating,
            }));
            // Merge: initial + API (deduplicate by name+text)
            const existing = new Set(INITIAL_TESTIMONIALS.map(t => `${t.name}:${t.text}`));
            const newOnes = apiTestimonials.filter(t => !existing.has(`${t.name}:${t.text}`));
            setTestimonials([...INITIAL_TESTIMONIALS, ...newOnes]);
          }
        }
      } catch {
        // Silently use initial testimonials if API unavailable
      }
    };
    fetchTestimonials();
  }, []);

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
            <TestimonialForm onClose={() => setShowForm(false)} />
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
