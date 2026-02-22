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
              <a
                href={`https://wa.me/${(() => {
                  let p = appointment.telefone.replace(/\D/g, '');
                  if (p.length === 9 && p.startsWith('9')) return '351' + p;
                  return p;
                })()}?text=${encodeURIComponent(`Olá ${appointment.nome}! Sou da Clínica de Podologia Sónia Travassos. Gostaria de falar sobre o seu agendamento de ${appointment.servico} no dia ${appointment.data} às ${appointment.hora}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-green-600 rounded-b-lg border-t border-gray-100 flex items-center"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                WhatsApp
              </a>
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
