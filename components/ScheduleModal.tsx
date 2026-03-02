'use client';

import Modal from './Modal';
import { Clock } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { SCHEDULE, DAY_NAMES } from '@/lib/constants';
import { getDaySchedule } from '@/lib/utils/schedule';

const ScheduleModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'schedule';

  const schedule = [1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
    // Usamos uma data de referência para obter a configuração do dia
    // 2024-02-04 foi um domingo, então 2024-02-04 + dayNum nos dá os dias certos
    const referenceDate = new Date(2024, 1, 4 + dayNum);
    const config = getDaySchedule(referenceDate);

    return {
      day: DAY_NAMES[dayNum],
      hours: config.isClosed ? 'Fechado' : `${config.opening} - ${config.lastStart}`,
      available: !config.isClosed,
    };
  });

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
                <span className={`font-bold block ${item.available ? 'text-text-primary' : 'text-gray-400'}`}>
                  {item.hours}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>📝 Importante:</strong> Trabalho apenas com marcação prévia para garantir
            o melhor atendimento. Para a Podologia Profissional, é necessária avaliação profissional.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
