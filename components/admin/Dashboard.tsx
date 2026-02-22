'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Calendar, Users, TrendingUp, DollarSign, Clock, 
  CheckCircle, XCircle, AlertCircle, BarChart3
} from 'lucide-react';

interface DashboardStats {
  totals: {
    appointments: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
    uniqueClients: number;
  };
  today: { appointments: number; revenue: number };
  month: { appointments: number; revenue: number; newClients: number };
  monthly: { month: string; appointments: number; revenue: number }[];
  popularServices: { name: string; count: number; revenue: number }[];
  upcoming: any[];
}

interface DashboardProps {
  token: string;
}

export function Dashboard({ token }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (value: number) => `${value.toFixed(2)}€`;

  const monthNames: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const s = stats || {
    totals: { appointments: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0, uniqueClients: 0 },
    today: { appointments: 0, revenue: 0 },
    month: { appointments: 0, revenue: 0, newClients: 0 },
    monthly: [],
    popularServices: [],
    upcoming: [],
  };

  const maxBarValue = Math.max(...s.monthly.map(m => m.revenue), 1);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hoje"
          value={String(s.today.appointments)}
          subtitle={formatCurrency(s.today.revenue)}
          icon={<Clock className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Este Mês"
          value={String(s.month.appointments)}
          subtitle={formatCurrency(s.month.revenue)}
          icon={<Calendar className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Total Clientes"
          value={String(s.totals.uniqueClients)}
          subtitle={`${s.month.newClients} novos este mês`}
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Receita Total"
          value={formatCurrency(s.totals.revenue)}
          subtitle={`${s.totals.completed} concluídos`}
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Status dos agendamentos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard icon={<AlertCircle className="w-4 h-4 text-orange-500" />} label="Pendentes" value={s.totals.pending} />
        <MiniCard icon={<CheckCircle className="w-4 h-4 text-green-500" />} label="Confirmados" value={s.totals.confirmed} />
        <MiniCard icon={<CheckCircle className="w-4 h-4 text-blue-500" />} label="Concluídos" value={s.totals.completed} />
        <MiniCard icon={<XCircle className="w-4 h-4 text-red-500" />} label="Cancelados" value={s.totals.cancelled} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Receita Mensal - Gráfico de barras simples */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Receita Mensal</h2>
          </div>
          {s.monthly.length > 0 ? (
            <div className="space-y-3">
              {s.monthly.map((m) => {
                const monthParts = m.month.split('-');
                const label = monthNames[monthParts[1]] || monthParts[1];
                const pct = (m.revenue / maxBarValue) * 100;
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-10 text-xs text-gray-500 font-medium">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                        {formatCurrency(m.revenue)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{m.appointments}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Sem dados para exibir</p>
          )}
        </div>

        {/* Serviços mais populares */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Serviços Populares</h2>
          </div>
          {s.popularServices.length > 0 ? (
            <div className="space-y-4">
              {s.popularServices.map((svc, i) => (
                <div key={svc.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{svc.name}</p>
                      <p className="text-xs text-gray-400">{svc.count} agendamentos</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{formatCurrency(svc.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Sem dados para exibir</p>
          )}
        </div>
      </div>

      {/* Próximos agendamentos */}
      {s.upcoming.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Próximos Agendamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Data</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Hora</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Serviço</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Valor</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.upcoming.map((apt: any) => (
                  <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900">{apt.data}</td>
                    <td className="py-2 px-3 text-gray-900">{apt.hora}</td>
                    <td className="py-2 px-3 text-gray-900">{apt.nome}</td>
                    <td className="py-2 px-3 text-gray-600">{apt.servico}</td>
                    <td className="py-2 px-3 text-right text-gray-900">{Number(apt.preco).toFixed(2)}€</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; color: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function MiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
