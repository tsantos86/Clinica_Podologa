'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment } from '@/types';

interface ColumnProps {
  id: string;
  title: string;
  appointments: Appointment[];
  date?: string;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function Column({ id, title, appointments, date, onEditAppointment, onDeleteAppointment, onStatusChange }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-50 rounded-lg p-4 h-full">
        {/* Column Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {appointments.length}
            </span>
          </div>
          {date && (
            <p className="text-xs text-gray-500 mt-1">{formatDate(date)}</p>
          )}
        </div>

        {/* Droppable Area */}
        <SortableContext
          id={id}
          items={appointments.map(apt => apt.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={cn(
              "space-y-3 min-h-[200px] transition-colors rounded-lg p-2",
              isOver && "bg-indigo-50 ring-2 ring-indigo-300"
            )}
          >
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhum agendamento
              </div>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEditAppointment}
                  onDelete={onDeleteAppointment}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
