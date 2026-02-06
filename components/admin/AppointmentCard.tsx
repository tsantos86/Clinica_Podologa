'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User, Phone, Euro, MoreVertical, GripVertical, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function AppointmentCard({ appointment, onEdit, onDelete, onStatusChange }: AppointmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    confirmed: 'bg-green-50 border-green-200 text-green-800',
    completed: 'bg-blue-50 border-blue-200 text-blue-800',
    cancelled: 'bg-red-50 border-red-200 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">{appointment.servico}</h4>
            <div className="flex items-center space-x-1 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">{appointment.hora}</span>
            </div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
              <button
                onClick={() => {
                  if (onEdit) onEdit(appointment);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
              >
                Editar
              </button>
              {appointment.status === 'pending' && (
                <button
                  onClick={() => {
                    if (onStatusChange) onStatusChange(appointment.id, 'confirmed');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-green-600"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Confirmar
                </button>
              )}
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => {
                    if (onStatusChange) onStatusChange(appointment.id, 'completed');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-blue-600"
                >
                  Marcar Concluído
                </button>
              )}
              <button
                onClick={() => {
                  if (onDelete) onDelete(appointment.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 rounded-b-lg border-t border-gray-100"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Client info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{appointment.nome}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{appointment.telefone}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <Euro className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm">
            {appointment.preco.toFixed(2)}
          </span>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium border",
            statusColors[appointment.status || 'pending']
          )}
        >
          {statusLabels[appointment.status || 'pending']}
        </span>
      </div>
    </div>
  );
}
