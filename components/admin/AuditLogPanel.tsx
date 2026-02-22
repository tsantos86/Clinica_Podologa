'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, ChevronLeft, ChevronRight, Filter, RefreshCw, Loader2, Calendar, Tag } from 'lucide-react';

interface AuditEntry {
    id: number;
    entityType: string;
    entityTypeLabel: string;
    entityId: string;
    action: string;
    actionLabel: string;
    changes: Record<string, unknown> | null;
    performedBy: string;
    createdAt: string;
}

interface AuditLogPanelProps {
    token: string;
}

const ENTITY_FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'appointment', label: 'Agendamentos' },
    { value: 'service_price', label: 'Preços' },
    { value: 'testimonial', label: 'Testemunhos' },
    { value: 'photo', label: 'Fotos' },
    { value: 'auth', label: 'Segurança' },
];

export function AuditLogPanel({ token }: AuditLogPanelProps) {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [entityFilter, setEntityFilter] = useState('');

    const fetchAuditLog = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page), limit: '15' });
            if (entityFilter) params.set('entity', entityFilter);

            const res = await fetch(`/api/admin/audit?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setEntries(data.entries || []);
                setTotalPages(data.pagination?.totalPages || 0);
                setTotal(data.pagination?.total || 0);
            }
        } catch (err) {
            console.error('Erro ao buscar audit log:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, entityFilter]);

    useEffect(() => {
        fetchAuditLog();
    }, [fetchAuditLog]);

    const handleFilterChange = (value: string) => {
        setEntityFilter(value);
        setPage(1);
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const renderChanges = (changes: Record<string, unknown> | null) => {
        if (!changes || Object.keys(changes).length === 0) return null;

        const relevantKeys = Object.keys(changes).filter(k =>
            !['id', 'createdAt', 'updatedAt'].includes(k)
        ).slice(0, 4);

        if (relevantKeys.length === 0) return null;

        return (
            <div className="mt-2 flex flex-wrap gap-1">
                {relevantKeys.map(key => (
                    <span
                        key={key}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono"
                    >
                        {key}: {String(changes[key]).substring(0, 30)}
                    </span>
                ))}
            </div>
        );
    };

    const getEntityColor = (entityType: string) => {
        switch (entityType) {
            case 'appointment': return 'bg-blue-100 text-blue-700';
            case 'service_price': return 'bg-green-100 text-green-700';
            case 'testimonial': return 'bg-purple-100 text-purple-700';
            case 'photo': return 'bg-orange-100 text-orange-700';
            case 'auth': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('delete') || action.includes('cancelled')) return 'text-red-600';
        if (action.includes('create') || action.includes('confirmed') || action.includes('completed')) return 'text-green-600';
        return 'text-indigo-600';
    };

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registos de Atividade</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {total} registos no total
                    </p>
                </div>
                <button
                    onClick={fetchAuditLog}
                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-indigo-600"
                    title="Atualizar"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {ENTITY_FILTERS.map(filter => (
                    <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${entityFilter === filter.value
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Entries */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum registo encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Os registos aparecerão aqui quando ações forem realizadas no painel
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getEntityColor(entry.entityType)}`}>
                                            {entry.entityTypeLabel}
                                        </span>
                                        <span className={`text-sm font-semibold ${getActionColor(entry.action)}`}>
                                            {entry.actionLabel}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                                        ID: {entry.entityId}
                                    </p>

                                    {renderChanges(entry.changes as Record<string, unknown>)}
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(entry.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                        <Tag className="w-3 h-3" />
                                        {entry.performedBy}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Página {page} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
