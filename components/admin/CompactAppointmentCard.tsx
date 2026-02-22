'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Phone, GripVertical, Check, X, Clock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import type { Appointment } from '@/types';

interface CompactAppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function CompactAppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onStatusChange
}: CompactAppointmentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors: Record<string, string> = {
    pending: 'border-l-yellow-500 bg-yellow-50',
    confirmed: 'border-l-green-500 bg-green-50',
    completed: 'border-l-blue-500 bg-blue-50',
    cancelled: 'border-l-red-500 bg-red-50',
  };

  const statusIcons: Record<string, string> = {
    pending: '⏳',
    confirmed: '✓',
    completed: '✓✓',
    cancelled: '✗',
  };

  // Fechar ações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div
        ref={cardRef}
        {...attributes}
        {...listeners}
        className={cn(
          "border-l-4 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all bg-white cursor-grab active:cursor-grabbing",
          statusColors[appointment.status || 'pending']
        )}
      >
        <div className="flex items-start gap-1.5 sm:gap-3">
          {/* Drag Handle */}
          <div className="text-gray-400 mt-1 hidden sm:block pointer-events-none">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Content */}
          <div
            className="flex-1 min-w-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                    {appointment.nome}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1 truncate">
                  {appointment.servico}
                </div>

                {/* Duration and Products Info */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-[10px] text-gray-600 rounded">
                    <Clock className="w-2.5 h-2.5" />
                    {appointment.duracaoMinutos || 60} min
                  </span>

                  {appointment.produtos && appointment.produtos.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-[10px] text-indigo-600 rounded border border-indigo-100">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      {appointment.produtos.length} prod.
                    </span>
                  )}

                  <span className="text-[10px] font-bold text-gray-700">
                    {appointment.preco}€
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span className="truncate">{appointment.telefone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{appointment.hora}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <span className="text-base sm:text-lg" title={appointment.status}>
                  {statusIcons[appointment.status || 'pending']}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (onEdit) onEdit(appointment);
                setShowActions(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              📝 Editar detalhes
            </button>

            {(appointment.status === 'pending' || appointment.status === 'cancelled') && (
              <button
                onClick={() => {
                  if (onStatusChange) onStatusChange(appointment.id, 'confirmed');
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 text-green-700 transition-colors border-b border-gray-100"
              >
                <Check className="w-4 h-4 inline mr-2" />
                Confirmar agendamento
              </button>
            )}

            {appointment.status === 'confirmed' && (
              <button
                onClick={() => {
                  if (onStatusChange) onStatusChange(appointment.id, 'completed');
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 text-blue-700 transition-colors border-b border-gray-100"
              >
                ✓✓ Marcar como concluído
              </button>
            )}

            {appointment.status !== 'cancelled' && (
              <button
                onClick={() => {
                  if (onDelete) onDelete(appointment.id);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-700 transition-colors"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar agendamento
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
