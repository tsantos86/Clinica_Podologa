'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState, useMemo } from 'react';
import { TimeSlot } from './TimeSlot';
import { CompactAppointmentCard } from './CompactAppointmentCard';
import type { Appointment } from '@/types';
import { SCHEDULE } from '@/lib/constants';
import { HOURLY_TIMES, getHourlyTimes, timeToMinutes } from '@/lib/utils/schedule';

interface DayScheduleProps {
  date: Date;
  appointments: Appointment[];
  onUpdateAppointment: (appointmentId: string, newTime: string) => void;
  onSwapAppointments?: (appointment1Id: string, appointment2Id: string) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onNewAppointmentAtTime?: (date: string, time: string) => void;
}

export function DaySchedule({
  date,
  appointments,
  onUpdateAppointment,
  onSwapAppointments,
  onEditAppointment,
  onDeleteAppointment,
  onStatusChange,
  onNewAppointmentAtTime
}: DayScheduleProps) {
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dateStr = date.toISOString().split('T')[0];

  // Verificar se é dia de folga (Quinta ou Domingo por padrão)
  const dayOfWeek = date.getDay();
  const isClosed = dayOfWeek === 0 || dayOfWeek === 4;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const appointment = appointments.find((apt: Appointment) => apt.id === active.id);
    if (appointment) {
      setActiveAppointment(appointment);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveAppointment(null);
      return;
    }

    const draggedAppointmentId = active.id as string;
    const overId = over.id as string;

    // Detectar se soltou sobre um agendamento ou um slot
    const targetAppointment = appointments.find(apt => apt.id === overId);

    let newTime: string;
    if (targetAppointment) {
      newTime = targetAppointment.hora;
    } else if (overId.startsWith('slot-')) {
      // Se soltou num slot vazio, extrair o horário do ID do slot (formato: "slot-YYYY-MM-DD-HH:MM")
      newTime = overId.split('-').slice(-1)[0];
    } else {
      // Se não é algo reconhecido (ex: drop em lugar inválido), cancelar
      setActiveAppointment(null);
      return;
    }

    // Encontrar o agendamento arrastado
    const draggedAppointment = appointments.find((apt: Appointment) => apt.id === draggedAppointmentId);

    if (!draggedAppointment || draggedAppointment.hora === newTime) {
      setActiveAppointment(null);
      return;
    }

    // Se houver um agendamento no destino (seja detectado pelo ID ou pelo horário)
    const activeTargetAppointment = targetAppointment || appointments.find(
      (apt: Appointment) =>
        apt.data === dateStr &&
        apt.hora === newTime &&
        apt.id !== draggedAppointmentId
    );

    if (activeTargetAppointment && onSwapAppointments) {
      onSwapAppointments(draggedAppointmentId, activeTargetAppointment.id);
    } else {
      onUpdateAppointment(draggedAppointmentId, newTime);
    }

    setActiveAppointment(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
      {/* Header */}
      <div className={`${isClosed
        ? 'bg-gradient-to-r from-gray-500 to-gray-600'
        : 'bg-gradient-to-r from-indigo-600 to-purple-600'
        } text-white px-3 sm:px-6 py-3 sm:py-4`}>
        <h3 className="text-base sm:text-lg font-semibold">
          {date.toLocaleDateString('pt-PT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
          {isClosed && <span className="ml-2 text-sm">🔒 Fechado</span>}
        </h3>
        <p className="text-xs sm:text-sm text-indigo-100 mt-1">
          {isClosed
            ? 'Não atendemos às quintas-feiras e domingos'
            : `${appointments.length} agendamento(s)`
          }
        </p>
      </div>

      {/* Schedule Grid */}
      {isClosed ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Dia de Descanso</h3>
          <p className="text-gray-500">
            Não realizamos atendimentos {dayOfWeek === 0 ? 'aos domingos' : 'às quintas-feiras'}.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="divide-y divide-gray-200">
            {getHourlyTimes(dateStr).map((time) => {
              const slotId = `slot-${dateStr}-${time}`;
              const slotStart = timeToMinutes(time);
              const slotEnd = slotStart + SCHEDULE.SLOT_INTERVAL;

              const slotAppointments = appointments.filter((apt: Appointment) => {
                const aptTime = timeToMinutes(apt.hora);
                const isInSlot = apt.data === dateStr && aptTime >= slotStart && aptTime < slotEnd;
                if (apt.nome.includes('Rui') && time === '08:30') {
                  console.log(`Debug Rui: data=${apt.data}, dateStr=${dateStr}, aptTime=${aptTime}, slot=${slotStart}-${slotEnd}, equal=${apt.data === dateStr}`);
                }
                return isInSlot;
              });

              return (
                <TimeSlot
                  key={slotId}
                  id={slotId}
                  time={time}
                  date={dateStr}
                  appointments={slotAppointments}
                  onEditAppointment={onEditAppointment}
                  onDeleteAppointment={onDeleteAppointment}
                  onStatusChange={onStatusChange}
                  onClickEmptySlot={onNewAppointmentAtTime}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeAppointment ? (
              <div className="rotate-2 scale-105 opacity-95 shadow-2xl">
                <CompactAppointmentCard appointment={activeAppointment} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
