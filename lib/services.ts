import { Service } from '@/types';
import { parseDuration } from '@/lib/utils/schedule';

/**
 * Serviços padrão (fallback).
 * Em produção, os serviços são geridos pelo admin panel e servidos pela API.
 * Este ficheiro serve apenas como seed/fallback.
 */
export const services: Service[] = [
  {
    id: 'pedicura-classica',
    name: 'Pedicura Clássica (Embelezamento)',
    description: 'Embelezamento completo para manter os pés cuidados e saudáveis. (Duração estimada: 1h20m)',
    details: [
      'Escalda-pés',
      'Lixamento e esfoliação',
      'Hidratação',
      'Cutilagem',
      'Corte técnico das unhas',
      'Opcional: verniz normal',
    ],
    duration: '1h20m',
    durationMinutes: 80,
    price: 22,
    icon: '🦶',
    category: 'Pedicura',
    active: true,
  },
  {
    id: 'pedicura-completa-verniz-gel',
    name: 'Pedicura Completa com Verniz de Gel',
    description: 'Cuidado completo com acabamento de verniz de gel. (Duração estimada: 1h30m)',
    details: [
      'Escalda-pés',
      'Lixamento e esfoliação',
      'Hidratação',
      'Cutilagem',
      'Corte técnico das unhas',
      'Aplicação de verniz de gel',
    ],
    duration: '1h30m',
    durationMinutes: 90,
    price: 30,
    icon: '💅',
    category: 'Pedicura',
    active: true,
  },
  {
    id: 'pedicura-profunda',
    name: 'Pedicura Profunda',
    description: 'Indicada para pés com maior necessidade de cuidado. (Duração estimada: 1h30m)',
    details: [
      'Escalda-pés',
      'Lixamento e esfoliação',
      'Hidratação',
      'Remoção de calosidades',
      'Tratamento de fissuras',
      'Cutilagem',
      'Corte técnico das unhas',
    ],
    duration: '1h30m',
    durationMinutes: 90,
    price: 37,
    icon: '🦶',
    category: 'Pedicura',
    active: true,
  },
  {
    id: 'pedicura-tecnica',
    name: 'Pedicura Técnica',
    description: 'Correção técnica do corte das unhas (sem embelezamento). (Duração estimada: 20min)',
    details: [
      'Correção técnica do corte das unhas',
      'Sem embelezamento',
    ],
    duration: '20min',
    durationMinutes: 20,
    price: 10,
    icon: '✂️',
    category: 'Pedicura',
    active: true,
  },
  {
    id: 'pedicura-especializada',
    name: 'Pedicura Especializada',
    description: 'Indicada para unhas com alterações. (Duração estimada: 1h30m)',
    details: [
      'Escalda-pés',
      'Lixamento e esfoliação',
      'Hidratação',
      'Técnicas específicas nas unhas',
      'Limpeza profunda em unhas com onicomicose',
    ],
    duration: '1h30m',
    durationMinutes: 90,
    price: 40,
    icon: '🧴',
    category: 'Pedicura',
    active: true,
  },
  {
    id: 'pedicura-profissional',
    name: 'Pedicura Profissional',
    description: 'Atendimento personalizado conforme avaliação. (Duração estimada: 2h)',
    details: [
      'Escalda-pés',
      'Lixamento e esfoliação',
      'Hidratação',
      'Técnicas específicas conforme avaliação',
      'Atendimento a unhas encravadas',
      'Necessária avaliação profissional',
    ],
    duration: '2h',
    durationMinutes: 120,
    price: 42,
    icon: '👣',
    category: 'Pedicura',
    active: true,
  },
];

export const getServiceById = (id: string): Service | undefined => {
  return services.find((service) => service.id === id);
};

export const getServicesByCategory = (category: string): Service[] => {
  return services.filter((service) => service.category === category);
};

export const serviceCategories = [
  'Pedicura',
];
