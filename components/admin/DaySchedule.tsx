'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import { TimeSlot } from './TimeSlot';
import { CompactAppointmentCard } from './CompactAppointmentCard';
import type { Appointment } from '@/types';

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

  // Configurar sensores para melhor detecção de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Pequeno movimento antes de ativar drag
      },
    })
  );

  // Horários de trabalho (08:30 às 19:00 - intervalos de 30 min)
  const workingHours = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  const dateStr = date.toISOString().split('T')[0];
  
  // Verificar se é quinta (4) ou domingo (0)
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
    const newTimeSlot = over.id as string;

    // Extrair apenas o horário do timeSlot (formato: "2024-02-04-09:00")
    const newTime = newTimeSlot.split('-').slice(-1)[0];

    // Encontrar o agendamento arrastado
    const draggedAppointment = appointments.find((apt: Appointment) => apt.id === draggedAppointmentId);
    
    if (!draggedAppointment || draggedAppointment.hora === newTime) {
      setActiveAppointment(null);
      return;
    }

    // Verificar se já existe um agendamento no horário de destino
    const targetAppointment = appointments.find(
      (apt: Appointment) => 
        apt.data === dateStr && 
        apt.hora === newTime && 
        apt.id !== draggedAppointmentId
    );

    if (targetAppointment && onSwapAppointments) {
      // TROCAR os dois agendamentos
      onSwapAppointments(draggedAppointmentId, targetAppointment.id);
    } else {
      // Apenas MOVER para horário vazio
      onUpdateAppointment(draggedAppointmentId, newTime);
    }

    setActiveAppointment(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`${
        isClosed 
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
            {workingHours.map((time) => {
              const slotId = `${dateStr}-${time}`;
              const slotAppointments = appointments.filter(
                (apt: Appointment) => apt.data === dateStr && apt.hora === time
              );

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
