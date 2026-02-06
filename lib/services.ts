import { Service } from '@/types';

export const services: Service[] = [
  {
    id: 'terapia-podal',
    name: 'Terapia Podal',
    description: 'Cuidado completo e especializado para manter os seus pés saudáveis.',
    price: 30,
    icon: '🦶',
    badge: 'popular',
    category: 'Principais Serviços',
  },
  {
    id: 'pedicure-medical',
    name: 'Pedicure Medical',
    description: 'Avaliação profissional com tratamento personalizado para os seus pés.',
    price: 35,
    icon: '👨‍⚕️',
    category: 'Principais Serviços',
  },
  {
    id: 'spa-pes',
    name: 'SPA dos Pés',
    description: 'Uma experiência relaxante completa: limpeza, verniz, produtos premium e parafina.',
    price: 50,
    icon: '💆',
    badge: 'premium',
    category: 'Principais Serviços',
  },
  {
    id: 'plastica-pes',
    name: 'Plástica dos Pés',
    description: 'Renovação estética avançada com limpeza profunda e produtos de qualidade.',
    price: 45,
    icon: '✨',
    category: 'Principais Serviços',
  },
  {
    id: 'plastica-gelinho',
    name: 'Plástica + Gelinho',
    description: 'Plástica dos pés com verniz em gel de longa duração.',
    price: 50,
    icon: '💅',
    category: 'Principais Serviços',
  },
  {
    id: 'tradicional-gelinho',
    name: 'Tradicional + Gelinho',
    description: 'Pedicure tradicional com verniz em gel de longa duração.',
    price: 30,
    icon: '💅',
    category: 'Pedicure',
  },
  {
    id: 'tradicional-verniz',
    name: 'Tradicional + Verniz',
    description: 'Pedicure tradicional com verniz tradicional.',
    price: 20,
    icon: '🌸',
    category: 'Pedicure',
  },
  {
    id: 'gelinho-pes',
    name: 'Gelinho Pés',
    description: 'Verniz em gel de longa duração para pés.',
    price: 15,
    icon: '💅',
    category: 'Verniz',
  },
  {
    id: 'gelinho-reconstrucao',
    name: 'Gelinho c/ Reconstrução',
    description: 'Verniz gel duradouro com reconstrução de unha para um resultado perfeito.',
    price: 20,
    icon: '✨',
    category: 'Verniz',
  },
  {
    id: 'parafina',
    name: 'Parafina Mãos/Pés',
    description: 'Tratamento hidratante intensivo com parafina.',
    price: 10,
    icon: '🌿',
    category: 'Outros Serviços',
  },
  {
    id: 'massagem-acupuntura',
    name: 'Massagem e Acupuntura Electrónica',
    description: 'Tratamento terapêutico com massagem e acupuntura.',
    price: 30,
    icon: '💆‍♀️',
    category: 'Outros Serviços',
  },
  {
    id: 'detox-ionico',
    name: 'Detox Iónico',
    description: 'Tratamento de desintoxicação através dos pés.',
    price: 15,
    icon: '💚',
    category: 'Outros Serviços',
  },
  {
    id: 'jelly-spa',
    name: 'Jelly SPA',
    description: 'Tratamento SPA com gelatina aromática.',
    price: 25,
    icon: '💧',
    category: 'Outros Serviços',
  },
];

export const getServiceById = (id: string): Service | undefined => {
  return services.find((service) => service.id === id);
};

export const getServicesByCategory = (category: string): Service[] => {
  return services.filter((service) => service.category === category);
};

export const serviceCategories = [
  'Principais Serviços',
  'Pedicure',
  'Verniz',
  'Outros Serviços',
];
