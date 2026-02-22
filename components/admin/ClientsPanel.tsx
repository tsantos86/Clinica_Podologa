'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Phone, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Client {
  telefone: string;
  nome: string;
  email: string;
  totalAppointments: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  firstVisit: string;
  lastVisit: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ClientsPanelProps {
  token: string;
}

export function ClientsPanel({ token }: ClientsPanelProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async (page: number = 1, searchTerm: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/clients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClients(1, search);
  }, [fetchClients, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} cliente{pagination.total !== 1 ? 's' : ''} registado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pesquisar cliente..."
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-72 text-sm"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">Nenhum cliente encontrado</p>
          {search && (
            <button
              onClick={() => { setSearch(''); setSearchInput(''); }}
              className="mt-3 text-indigo-600 text-sm hover:underline"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="lg:hidden space-y-3">
            {clients.map((client) => (
              <div key={client.telefone} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{client.nome}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.telefone}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{client.totalSpent.toFixed(2)}€</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                  <span>{client.totalAppointments} consulta{client.totalAppointments !== 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Última: {formatDate(client.lastVisit)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Tabela */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contacto</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Consultas</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Concluídas</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Valor Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">1ª Visita</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Última</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.telefone} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{client.nome}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{client.telefone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-900">{client.totalAppointments}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-600 font-medium">{client.completed}</span>
                      {client.cancelled > 0 && (
                        <span className="text-red-400 text-xs ml-1">({client.cancelled} canc.)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-indigo-600">{client.totalSpent.toFixed(2)}€</td>
                    <td className="py-3 px-4 text-center text-gray-500">{formatDate(client.firstVisit)}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{formatDate(client.lastVisit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-sm text-gray-500">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchClients(pagination.page - 1, search)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchClients(pagination.page + 1, search)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
