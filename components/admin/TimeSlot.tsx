'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { CompactAppointmentCard } from './CompactAppointmentCard';
import type { Appointment } from '@/types';

interface TimeSlotProps {
  id: string;
  time: string;
  date: string;
  appointments: Appointment[];
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onClickEmptySlot?: (date: string, time: string) => void;
}

export function TimeSlot({ 
  id, 
  time, 
  date,
  appointments, 
  onEditAppointment, 
  onDeleteAppointment,
  onStatusChange,
  onClickEmptySlot
}: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const hasAppointments = appointments.length > 0;

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Time Label */}
      <div className="w-14 sm:w-20 flex-shrink-0 p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-600 border-r border-gray-200">
        {time}
      </div>

      {/* Appointments Area */}
      <SortableContext
        id={id}
        items={appointments.map(apt => apt.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 p-1.5 sm:p-2 min-h-[60px] transition-all relative",
            isOver && hasAppointments && "bg-amber-50 ring-2 ring-amber-400 ring-inset",
            isOver && !hasAppointments && "bg-indigo-50 ring-2 ring-indigo-300 ring-inset"
          )}
        >
          {/* Indicador visual de troca */}
          {isOver && hasAppointments && (
            <div className="absolute inset-0 flex items-center justify-center bg-amber-100/80 rounded z-10 pointer-events-none">
              <span className="text-amber-800 font-semibold text-xs sm:text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Trocar horários
              </span>
            </div>
          )}

          {/* Indicador visual de mover para vazio */}
          {isOver && !hasAppointments && (
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-100/80 rounded z-10 pointer-events-none">
              <span className="text-indigo-800 font-semibold text-xs sm:text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Soltar aqui</span>
                <span className="sm:hidden">OK</span>
              </span>
            </div>
          )}
          
          {appointments.length === 0 ? (
            <button
              onClick={() => onClickEmptySlot?.(date, time)}
              className="w-full h-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 text-xs transition-all rounded-md border-2 border-dashed border-transparent hover:border-indigo-300 group"
            >
              <span className="hidden sm:inline group-hover:font-medium transition-all">+ Adicionar agendamento</span>
              <span className="sm:hidden text-2xl group-hover:scale-110 transition-transform">+</span>
            </button>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {appointments.map((appointment) => (
                <CompactAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEditAppointment}
                  onDelete={onDeleteAppointment}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
