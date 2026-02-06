'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { useState } from 'react';
import { Column } from './Column';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment, BoardColumn } from '@/types';

interface BoardProps {
  columns: BoardColumn[];
  onUpdateAppointment: (appointmentId: string, newColumnId: string) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function Board({ columns, onUpdateAppointment, onEditAppointment, onDeleteAppointment, onStatusChange }: BoardProps) {
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Find the appointment being dragged
    for (const column of columns) {
      const appointment = column.appointments.find((apt: Appointment) => apt.id === active.id);
      if (appointment) {
        setActiveAppointment(appointment);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveAppointment(null);
      return;
    }

    const appointmentId = active.id as string;
    const newColumnId = over.id as string;

    // If dropped on the same column, no need to update
    const currentColumn = columns.find(col => 
      col.appointments.some((apt: Appointment) => apt.id === appointmentId)
    );

    if (currentColumn?.id !== newColumnId) {
      onUpdateAppointment(appointmentId, newColumnId);
    }

    setActiveAppointment(null);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            date={column.date}
            appointments={column.appointments}
            onEditAppointment={onEditAppointment}
            onDeleteAppointment={onDeleteAppointment}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <DragOverlay>
        {activeAppointment ? (
          <div className="rotate-3 opacity-80">
            <AppointmentCard appointment={activeAppointment} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
