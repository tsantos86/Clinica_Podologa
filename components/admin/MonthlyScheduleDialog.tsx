'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { MONTH_NAMES, SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRMATION_MESSAGES } from '@/lib/constants';
import { SettingsService } from '@/lib/api';

interface MonthlyScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MonthStatus {
  month: string;
  name: string;
  year: number;
  bookingsEnabled: boolean;
  loading?: boolean;
}

export function MonthlyScheduleDialog({ isOpen, onClose }: MonthlyScheduleDialogProps) {
  const [months, setMonths] = useState<MonthStatus[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Gerar meses do ano selecionado
  useEffect(() => {
    const generatedMonths: MonthStatus[] = MONTH_NAMES.map((name, index) => ({
      month: `${selectedYear}-${String(index + 1).padStart(2, '0')}`,
      name,
      year: selectedYear,
      bookingsEnabled: true,
      loading: false,
    }));

    setMonths(generatedMonths);
    
    // Carregar status de cada mês
    generatedMonths.forEach((m, index) => {
      SettingsService.get(m.month)
        .then(data => {
          setMonths(prev => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index].bookingsEnabled = data.bookingsEnabled;
            }
            return updated;
          });
        })
        .catch(err => console.error(`Erro ao carregar ${m.name}:`, err));
    });
  }, [selectedYear]);

  const toggleMonth = async (index: number) => {
    const month = months[index];
    const monthYearText = `${month.name} de ${month.year}`;
    
    const confirmed = confirm(
      month.bookingsEnabled 
        ? CONFIRMATION_MESSAGES.CLOSE_MONTH(monthYearText)
        : CONFIRMATION_MESSAGES.OPEN_MONTH(monthYearText)
    );
    
    if (!confirmed) return;

    // Otimistic update
    setMonths(prev => {
      const updated = [...prev];
      updated[index].loading = true;
      return updated;
    });

    try {
      const data = await SettingsService.update(month.month, !month.bookingsEnabled);
      
      setMonths(prev => {
        const updated = [...prev];
        updated[index].bookingsEnabled = data.bookingsEnabled;
        updated[index].loading = false;
        return updated;
      });
      
      if (data.bookingsEnabled) {
        toast.success(`✅ ${month.name}: ${SUCCESS_MESSAGES.MONTH_OPENED}`);
      } else {
        toast.warning(`🔒 ${month.name}: ${SUCCESS_MESSAGES.MONTH_CLOSED}`);
      }
    } catch (error) {
      // Rollback
      setMonths(prev => {
        const updated = [...prev];
        updated[index].loading = false;
        return updated;
      });
      toast.error(ERROR_MESSAGES.GENERIC);
    }
  };

  if (!isOpen) return null;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agenda Mensal</h2>
              <p className="text-sm text-gray-600">Gerir disponibilidade de agendamentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Year Selector */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setSelectedYear(prev => prev - 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              ← {selectedYear - 1}
            </button>
            <span className="text-2xl font-bold text-gray-900 min-w-[100px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(prev => prev + 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {selectedYear + 1} →
            </button>
          </div>
        </div>

        {/* Months Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {months.map((month, index) => {
              const isCurrentMonth = index === currentMonth && selectedYear === currentYear;
              const isPastMonth = selectedYear < currentYear || (selectedYear === currentYear && index < currentMonth);
              
              return (
                <div
                  key={month.month}
                  className={`relative bg-white border-2 rounded-xl p-4 transition-all ${
                    isCurrentMonth
                      ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                      : month.bookingsEnabled
                      ? 'border-green-200 hover:border-green-300 hover:shadow-md'
                      : 'border-red-200 hover:border-red-300 hover:shadow-md'
                  } ${isPastMonth ? 'opacity-60' : ''}`}
                >
                  {isCurrentMonth && (
                    <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Atual
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{month.name}</h3>
                      <p className="text-sm text-gray-500">{month.year}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      month.bookingsEnabled 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {month.bookingsEnabled ? (
                        <Unlock className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className={`mb-3 px-3 py-2 rounded-lg text-center font-medium text-sm ${
                    month.bookingsEnabled
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {month.bookingsEnabled ? '✅ Agendamentos Abertos' : '🔒 Agendamentos Fechados'}
                  </div>

                  <button
                    onClick={() => toggleMonth(index)}
                    disabled={month.loading}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                      month.bookingsEnabled
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                    } ${month.loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    {month.loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processando...
                      </span>
                    ) : (
                      <span>{month.bookingsEnabled ? 'Fechar Mês' : 'Abrir Mês'}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Aberto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Fechado</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
