'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Calendar, CalendarDays, RefreshCw } from 'lucide-react';
import { MonthlyScheduleDialog } from './MonthlyScheduleDialog';

interface HeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNewAppointment: () => void;
  onSearch: (query: string) => void;
  onRefresh?: () => void;
}

export function Header({ currentDate, onDateChange, onNewAppointment, onSearch, onRefresh }: HeaderProps) {
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-900">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" />
            <span className="font-semibold text-sm sm:text-lg capitalize">{formatDate(currentDate)}</span>
          </div>
        </div>

        {/* Right: Search and Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Botão Atualizar */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-indigo-600"
              title="Atualizar agendamentos"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Botão Agenda Mensal */}
          <button
            onClick={() => setIsMonthlyDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl sm:rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <CalendarDays className="w-5 h-5" />
            <span className="hidden sm:inline">Agenda Mensal</span>
            <span className="sm:hidden">Agenda</span>
          </button>

          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 text-sm"
            />
          </div>
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Modal de Agenda Mensal */}
      <MonthlyScheduleDialog
        isOpen={isMonthlyDialogOpen}
        onClose={() => setIsMonthlyDialogOpen(false)}
      />
    </header>
  );
}
