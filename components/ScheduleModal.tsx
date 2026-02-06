'use client';

import Modal from './Modal';
import { Clock } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

const ScheduleModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'schedule';

  const schedule = [
    { day: 'Segunda-feira', hours: '08:30 - 19:00', available: true },
    { day: 'Terça-feira', hours: '08:30 - 19:00', available: true },
    { day: 'Quarta-feira', hours: '08:30 - 19:00', available: true },
    { day: 'Quinta-feira', hours: 'Fechado', available: false },
    { day: 'Sexta-feira', hours: '08:30 - 19:00', available: true },
    { day: 'Sábado', hours: '09:00 - 19:00', available: true },
    { day: 'Domingo', hours: 'Fechado', available: false },
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Horários de Atendimento" size="md">
      <div className="p-6">
        <p className="text-text-secondary mb-6 text-center">
          Atendo com hora marcada para garantir que recebe toda a minha atenção
        </p>

        <div className="space-y-3 mb-6">
          {schedule.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-4 rounded-button ${
                item.available
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${item.available ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-semibold text-text-primary">{item.day}</span>
              </div>
              <span className={`font-bold ${item.available ? 'text-green-600' : 'text-gray-400'}`}>
                {item.hours}
              </span>
            </div>
          ))}
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>📝 Importante:</strong> Trabalho apenas com marcação prévia para garantir
            o melhor atendimento. Entre em contacto para reservar o seu horário!
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
