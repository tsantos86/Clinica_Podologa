'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Calendar, ToggleLeft, ToggleRight, Loader2, Shield, Database, Mail,
  CheckCircle, XCircle, RefreshCw, CreditCard, Ban, ChevronLeft, ChevronRight, Plus, Trash2
} from 'lucide-react';

interface SettingsPanelProps {
  token: string;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getNext12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }
  return months;
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${MONTHS_PT[idx]} ${year}`;
}

function formatDatePT(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getWeekDates(date: Date): string[] {
  const dates: string[] = [];
  const d = new Date(date);
  const day = d.getDay();
  // Start of week (Monday)
  d.setDate(d.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

interface DiagData {
  env: {
    isVercel: boolean;
    hasBlobToken: boolean;
    hasDatabaseUrl: boolean;
    hasJwtSecret: boolean;
    smtp: { hasUser: boolean; hasPass: boolean; hasService: boolean; hasFrom: boolean; configured: boolean };
  };
  db: { ok: boolean; error: string | null; tableCounts: Record<string, number> | null };
  timestamp: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
  createdAt: string;
}

export function SettingsPanel({ token }: SettingsPanelProps) {
  // Monthly availability
  const [bookingsEnabled, setBookingsEnabled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  // Payment settings
  const [mbwayEnabled, setMbwayEnabled] = useState(true);
  const [signalEnabled, setSignalEnabled] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentToggling, setPaymentToggling] = useState<string | null>(null);

  // Blocked dates
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [blockReason, setBlockReason] = useState('');
  const [blockingDates, setBlockingDates] = useState(false);
  const [removingDates, setRemovingDates] = useState<Set<string>>(new Set());

  // Diagnostics
  const [diag, setDiag] = useState<DiagData | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  // ── Fetch functions ──────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBookingsEnabled(data.bookingsEnabledByMonth || {});
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentSettings = useCallback(async () => {
    try {
      setPaymentLoading(true);
      const res = await fetch('/api/settings/payment');
      if (res.ok) {
        const data = await res.json();
        setMbwayEnabled(data.mbwayEnabled ?? true);
        setSignalEnabled(data.signalEnabled ?? true);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações de pagamento:', err);
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  const fetchBlockedDates = useCallback(async () => {
    try {
      setBlockedLoading(true);
      const res = await fetch('/api/settings/blocked-dates');
      if (res.ok) {
        const data = await res.json();
        setBlockedDates(data.blockedDates || []);
      }
    } catch (err) {
      console.error('Erro ao buscar datas bloqueadas:', err);
    } finally {
      setBlockedLoading(false);
    }
  }, []);

  const fetchDiagnostics = useCallback(async () => {
    try {
      setDiagLoading(true);
      const res = await fetch('/api/admin/diagnostics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDiag(await res.json());
      }
    } catch (err) {
      console.error('Erro ao buscar diagnósticos:', err);
    } finally {
      setDiagLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
    fetchPaymentSettings();
    fetchBlockedDates();
    fetchDiagnostics();
  }, [fetchSettings, fetchPaymentSettings, fetchBlockedDates, fetchDiagnostics]);

  // ── Monthly toggle ──────────────────────────────
  const handleToggle = async (month: string) => {
    const current = bookingsEnabled[month] ?? true;
    const newValue = !current;

    setToggling(month);
    setBookingsEnabled(prev => ({ ...prev, [month]: newValue }));

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ month, bookingsEnabled: newValue }),
      });

      if (res.ok) {
        toast.success(
          newValue
            ? `Agendamentos abertos para ${formatMonth(month)}`
            : `Agendamentos fechados para ${formatMonth(month)}`
        );
      } else {
        setBookingsEnabled(prev => ({ ...prev, [month]: current }));
        toast.error('Erro ao atualizar');
      }
    } catch {
      setBookingsEnabled(prev => ({ ...prev, [month]: current }));
      toast.error('Erro ao atualizar');
    } finally {
      setToggling(null);
    }
  };

  // ── Payment toggle ──────────────────────────────
  const handlePaymentToggle = async (field: 'mbwayEnabled' | 'signalEnabled') => {
    const currentMbway = mbwayEnabled;
    const currentSignal = signalEnabled;

    setPaymentToggling(field);

    let newMbway = mbwayEnabled;
    let newSignal = signalEnabled;

    if (field === 'mbwayEnabled') {
      newMbway = !mbwayEnabled;
      setMbwayEnabled(newMbway);
      // If disabling MBWay, also disable signal
      if (!newMbway) {
        newSignal = false;
        setSignalEnabled(false);
      }
    } else {
      newSignal = !signalEnabled;
      setSignalEnabled(newSignal);
    }

    try {
      const res = await fetch('/api/settings/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mbwayEnabled: newMbway, signalEnabled: newSignal }),
      });

      if (res.ok) {
        if (field === 'mbwayEnabled') {
          toast.success(newMbway ? 'Pagamento MBWay ativado' : 'Pagamento MBWay desativado');
        } else {
          toast.success(newSignal ? 'Sinal MBWay ativado' : 'Sinal MBWay desativado');
        }
      } else {
        setMbwayEnabled(currentMbway);
        setSignalEnabled(currentSignal);
        toast.error('Erro ao atualizar');
      }
    } catch {
      setMbwayEnabled(currentMbway);
      setSignalEnabled(currentSignal);
      toast.error('Erro ao atualizar');
    } finally {
      setPaymentToggling(null);
    }
  };

  // ── Blocked dates ──────────────────────────────
  const blockedDateSet = new Set(blockedDates.map(bd => bd.date));

  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const selectWeek = (dateInWeek: Date) => {
    const weekDates = getWeekDates(dateInWeek);
    setSelectedDates(prev => {
      const newSet = new Set(prev);
      const allSelected = weekDates.every(d => newSet.has(d));
      if (allSelected) {
        weekDates.forEach(d => newSet.delete(d));
      } else {
        weekDates.forEach(d => newSet.add(d));
      }
      return newSet;
    });
  };

  const handleBlockSelected = async () => {
    if (selectedDates.size === 0) {
      toast.error('Selecione pelo menos uma data para bloquear.');
      return;
    }

    setBlockingDates(true);
    try {
      const res = await fetch('/api/settings/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dates: Array.from(selectedDates),
          reason: blockReason || 'Bloqueado pela profissional',
        }),
      });

      if (res.ok) {
        toast.success(`${selectedDates.size} data(s) bloqueada(s) com sucesso!`);
        setSelectedDates(new Set());
        setBlockReason('');
        fetchBlockedDates();
      } else {
        toast.error('Erro ao bloquear datas.');
      }
    } catch {
      toast.error('Erro ao bloquear datas.');
    } finally {
      setBlockingDates(false);
    }
  };

  const handleUnblockDate = async (dateStr: string) => {
    setRemovingDates(prev => new Set(prev).add(dateStr));
    try {
      const res = await fetch('/api/settings/blocked-dates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dates: [dateStr] }),
      });

      if (res.ok) {
        toast.success(`Data ${formatDatePT(dateStr)} desbloqueada`);
        setBlockedDates(prev => prev.filter(bd => bd.date !== dateStr));
      } else {
        toast.error('Erro ao desbloquear data.');
      }
    } catch {
      toast.error('Erro ao desbloquear data.');
    } finally {
      setRemovingDates(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateStr);
        return newSet;
      });
    }
  };

  // ── Calendar rendering ──────────────────────────
  const calendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    const cells: { dateStr: string; day: number; isCurrentMonth: boolean; isPast: boolean }[] = [];

    // Fill empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, -firstDay + i + 1);
      cells.push({
        dateStr: d.toISOString().split('T')[0],
        day: d.getDate(),
        isCurrentMonth: false,
        isPast: d.toISOString().split('T')[0] < today,
      });
    }

    // Fill days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split('T')[0];
      cells.push({
        dateStr,
        day,
        isCurrentMonth: true,
        isPast: dateStr < today,
      });
    }

    // Fill remaining cells to complete grid
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        dateStr: d.toISOString().split('T')[0],
        day: d.getDate(),
        isCurrentMonth: false,
        isPast: false,
      });
    }

    return cells;
  };

  const months = getNext12Months();

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Gerir disponibilidade, pagamentos e diagnósticos</p>
      </div>

      {/* ─── Payment Settings (MBWay) ─────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Pagamento MBWay</h2>
        </div>

        {paymentLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* MBWay Toggle */}
            <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-gray-700 font-medium">Pagamento MBWay</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ativar ou desativar pagamento via MBWay para clientes
                </p>
              </div>
              <button
                onClick={() => handlePaymentToggle('mbwayEnabled')}
                disabled={paymentToggling === 'mbwayEnabled'}
                className="flex items-center gap-2 transition-colors"
              >
                {paymentToggling === 'mbwayEnabled' ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : mbwayEnabled ? (
                  <>
                    <span className="text-xs text-green-600 font-medium">Ativo</span>
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="text-xs text-red-500 font-medium">Desativado</span>
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  </>
                )}
              </button>
            </div>

            {/* Signal Toggle */}
            <div className={`flex items-center justify-between px-5 py-4 transition-colors ${!mbwayEnabled ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}>
              <div>
                <p className="text-gray-700 font-medium">Sinal (10€)</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Exigir sinal para confirmar agendamento
                </p>
              </div>
              <button
                onClick={() => handlePaymentToggle('signalEnabled')}
                disabled={paymentToggling === 'signalEnabled' || !mbwayEnabled}
                className="flex items-center gap-2 transition-colors"
              >
                {paymentToggling === 'signalEnabled' ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : signalEnabled ? (
                  <>
                    <span className="text-xs text-green-600 font-medium">Ativo</span>
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="text-xs text-red-500 font-medium">Desativado</span>
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info card MBWay */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-800">
          <strong>Nota:</strong> Quando o MBWay está desativado, os clientes ainda podem agendar mas não terão a opção de pagamento por MBWay.
          O sinal só pode ser ativado se o MBWay estiver ativo.
        </p>
      </div>

      {/* ─── Blocked Dates ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Ban className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Bloquear Dias</h2>
        </div>

        <div className="p-5">
          {/* Calendar navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-800">
              {MONTHS_PT[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
            </h3>
            <button
              onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-8 gap-1 mb-4">
            {/* Week select header */}
            <div className="text-center text-xs text-gray-400 font-medium py-2">Sem</div>
            {DAY_HEADERS.map(day => (
              <div key={day} className="text-center text-xs text-gray-400 font-medium py-2">{day}</div>
            ))}

            {/* Calendar cells with week selectors */}
            {(() => {
              const cells = calendarDays();
              const rows: React.JSX.Element[] = [];

              for (let weekIdx = 0; weekIdx < 6; weekIdx++) {
                const weekCells = cells.slice(weekIdx * 7, (weekIdx + 1) * 7);
                if (weekCells.length === 0) break;

                // Get a representative date for the week
                const representativeDate = new Date(weekCells[0].dateStr + 'T00:00:00');

                // Week selector button
                rows.push(
                  <button
                    key={`week-${weekIdx}`}
                    onClick={() => selectWeek(representativeDate)}
                    className="flex items-center justify-center p-1 text-xs text-indigo-500 hover:bg-indigo-50 rounded transition-colors"
                    title="Selecionar semana inteira"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                );

                // Day cells
                weekCells.forEach(cell => {
                  const isBlocked = blockedDateSet.has(cell.dateStr);
                  const isSelected = selectedDates.has(cell.dateStr);

                  let className = 'relative p-2 text-center text-sm rounded-lg transition-all cursor-pointer ';

                  if (!cell.isCurrentMonth) {
                    className += 'text-gray-300 ';
                  } else if (cell.isPast) {
                    className += 'text-gray-300 cursor-not-allowed ';
                  } else if (isBlocked) {
                    className += 'bg-red-100 text-red-700 font-medium ring-1 ring-red-200 ';
                  } else if (isSelected) {
                    className += 'bg-indigo-100 text-indigo-700 font-medium ring-2 ring-indigo-400 ';
                  } else {
                    className += 'text-gray-700 hover:bg-gray-100 ';
                  }

                  rows.push(
                    <button
                      key={cell.dateStr}
                      onClick={() => {
                        if (!cell.isPast && cell.isCurrentMonth) {
                          if (isBlocked) {
                            handleUnblockDate(cell.dateStr);
                          } else {
                            toggleDateSelection(cell.dateStr);
                          }
                        }
                      }}
                      disabled={cell.isPast || !cell.isCurrentMonth}
                      className={className}
                      title={isBlocked ? `Bloqueado – clique para desbloquear` : isSelected ? 'Selecionado' : ''}
                    >
                      {cell.day}
                      {isBlocked && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                  );
                });
              }

              return rows;
            })()}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-100 border border-red-200 rounded" />
              Bloqueado
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-100 border-2 border-indigo-400 rounded" />
              Selecionado
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" />
              Disponível
            </div>
          </div>

          {/* Block selected dates */}
          {selectedDates.size > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-indigo-700">
                {selectedDates.size} data(s) selecionada(s)
              </p>
              <input
                type="text"
                placeholder="Motivo (ex: Férias, Formação...)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleBlockSelected}
                  disabled={blockingDates}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {blockingDates ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  Bloquear selecionadas
                </button>
                <button
                  onClick={() => { setSelectedDates(new Set()); setBlockReason(''); }}
                  className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* List blocked dates */}
          {!blockedLoading && blockedDates.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Datas bloqueadas</h4>
              <div className="space-y-1.5 max-h-48 overflow-auto">
                {blockedDates
                  .filter(bd => bd.date >= new Date().toISOString().split('T')[0])
                  .map(bd => (
                    <div
                      key={bd.date}
                      className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div>
                        <span className="text-sm font-medium text-red-700">{formatDatePT(bd.date)}</span>
                        {bd.reason && (
                          <span className="text-xs text-red-500 ml-2">— {bd.reason}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnblockDate(bd.date)}
                        disabled={removingDates.has(bd.date)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Desbloquear"
                      >
                        {removingDates.has(bd.date) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info card blocked dates */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Nota:</strong> Datas bloqueadas impedem novos agendamentos nesses dias.
          Use o botão &ldquo;Sem&rdquo; para selecionar uma semana inteira de uma vez.
          Clique em datas já bloqueadas (vermelho) para as desbloquear.
        </p>
      </div>

      {/* ─── Monthly Availability ─────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Disponibilidade Mensal</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {months.map((month) => {
            const enabled = bookingsEnabled[month] ?? true;
            const isToggling = toggling === month;
            return (
              <div
                key={month}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 font-medium">{formatMonth(month)}</span>
                <button
                  onClick={() => handleToggle(month)}
                  disabled={isToggling}
                  className="flex items-center gap-2 transition-colors"
                >
                  {isToggling ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : enabled ? (
                    <>
                      <span className="text-xs text-green-600 font-medium">Aberto</span>
                      <ToggleRight className="w-8 h-8 text-green-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-red-500 font-medium">Fechado</span>
                      <ToggleLeft className="w-8 h-8 text-gray-300" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Quando um mês está &ldquo;Fechado&rdquo;, os clientes não poderão
          fazer novos agendamentos para datas nesse mês. Os agendamentos já existentes não são afetados.
        </p>
      </div>

      {/* ─── Diagnostics ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Diagnósticos do Sistema</h2>
          </div>
          <button
            onClick={fetchDiagnostics}
            disabled={diagLoading}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${diagLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {diagLoading && !diag ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : diag ? (
          <div className="divide-y divide-gray-100">
            {/* Database */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Base de Dados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${diag.db.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {diag.db.ok ? 'Conectado' : diag.db.error || 'Erro'}
                </span>
                <StatusIcon ok={diag.db.ok} />
              </div>
            </div>

            {/* JWT */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">JWT Secret</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${diag.env.hasJwtSecret ? 'text-green-600' : 'text-red-600'}`}>
                  {diag.env.hasJwtSecret ? 'Configurado' : 'Em falta'}
                </span>
                <StatusIcon ok={diag.env.hasJwtSecret} />
              </div>
            </div>

            {/* Blob */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">🗄️</span>
                <span className="text-sm text-gray-700">Vercel Blob Token</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${diag.env.hasBlobToken ? 'text-green-600' : 'text-orange-500'}`}>
                  {diag.env.hasBlobToken ? 'Configurado' : 'Em falta'}
                </span>
                <StatusIcon ok={diag.env.hasBlobToken} />
              </div>
            </div>

            {/* SMTP */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Email (SMTP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${diag.env.smtp.configured ? 'text-green-600' : 'text-orange-500'}`}>
                  {diag.env.smtp.configured ? 'Configurado' : 'Parcial'}
                </span>
                <StatusIcon ok={diag.env.smtp.configured} />
              </div>
            </div>

            {/* Table counts */}
            {diag.db.tableCounts && (
              <div className="px-5 py-3">
                <p className="text-xs text-gray-400 mb-2">Tabelas do DB</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(diag.db.tableCounts).map(([table, count]) => (
                    <div key={table} className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-600 font-mono">{table}</span>
                      <span className={`text-xs font-bold ${count >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                        {count >= 0 ? count : '❌'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
