'use client';

import Modal from './Modal';
import { Clock } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { SCHEDULE } from '@/lib/constants';

const ScheduleModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'schedule';

  const schedule = [
    { day: 'Segunda-feira', hours: `${SCHEDULE.OPENING_TIME} - ${SCHEDULE.LAST_START_TIME}`, available: true },
    { day: 'Terça-feira', hours: `${SCHEDULE.OPENING_TIME} - 15:30`, available: true },
    { day: 'Quarta-feira', hours: `${SCHEDULE.OPENING_TIME} - ${SCHEDULE.LAST_START_TIME}`, available: true },
    { day: 'Quinta-feira', hours: 'Fechado', available: false },
    { day: 'Sexta-feira', hours: `${SCHEDULE.OPENING_TIME} - ${SCHEDULE.LAST_START_TIME}`, available: true },
    { day: 'Sábado', hours: `09:00 - ${SCHEDULE.LAST_START_TIME}`, available: true },
    { day: 'Domingo', hours: 'Fechado', available: false },
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Horário de Funcionamento" size="md">
      <div className="p-6">
        <p className="text-text-secondary mb-6 text-center">
          Consulte os nossos horários e disponibilidade para agendamento
        </p>

        <div className="space-y-3 mb-6">
          {schedule.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-4 rounded-button ${item.available
                ? 'bg-primary/5 border-2 border-primary/20'
                : 'bg-gray-50 border-2 border-gray-100 opacity-60'
                }`}
            >
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${item.available ? 'text-primary' : 'text-gray-400'}`} />
                <span className="font-semibold text-text-primary">{item.day}</span>
              </div>
              <div className="text-right">
                <span className={`font-bold block ${item.available ? 'text-primary' : 'text-gray-400'}`}>
                  {item.hours}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>📝 Importante:</strong> Trabalho apenas com marcação prévia para garantir
            o melhor atendimento. Para a Pedicura Profissional, é necessária avaliação profissional.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
