'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, X, Loader2, Clock, DollarSign, Tag } from 'lucide-react';
import { parseDuration } from '@/lib/utils/schedule';

interface ServiceData {
    id: string;
    name: string;
    description: string;
    details: string[];
    duration: string;
    duration_minutes: number;
    price: number;
    icon: string;
    category: string;
    active: boolean;
}

interface ServicesManagementProps {
    token: string;
}

export function ServicesManagement({ token }: ServicesManagementProps) {
    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        details: '',
        duration: '1h',
        durationMinutes: 60,
        price: 0,
        icon: '🦶',
        category: 'Pedicura',
    });

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                setServices((data.services || []).map((s: Record<string, unknown>) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || '',
                    details: s.details || [],
                    duration: s.duration || '1h',
                    duration_minutes: (s.durationMinutes as number) || parseDuration(s.duration as string),
                    price: s.price,
                    icon: s.icon || '🦶',
                    category: s.category || 'Pedicura',
                    active: s.active !== false,
                })));
            }
        } catch (err) {
            console.error('Erro ao buscar serviços:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleCreate = async () => {
        if (!form.name || !form.price) {
            toast.error('Nome e preço são obrigatórios');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    details: form.details.split('\n').filter(Boolean),
                    duration: form.duration,
                    durationMinutes: form.durationMinutes || parseDuration(form.duration),
                    price: form.price,
                    icon: form.icon,
                    category: form.category,
                }),
            });

            if (res.ok) {
                toast.success('Serviço criado com sucesso!');
                setShowCreate(false);
                resetForm();
                fetchServices();
            } else {
                const data = await res.json();
                toast.error(data.details || data.error || 'Erro ao criar serviço');
                console.error('Erro ao criar serviço:', data);
            }
        } catch {
            toast.error('Erro ao criar serviço');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/services', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id,
                    name: form.name,
                    description: form.description,
                    details: form.details.split('\n').filter(Boolean),
                    duration: form.duration,
                    durationMinutes: form.durationMinutes || parseDuration(form.duration),
                    price: form.price,
                    icon: form.icon,
                    category: form.category,
                }),
            });

            if (res.ok) {
                toast.success('Serviço atualizado!');
                setEditingId(null);
                resetForm();
                fetchServices();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erro ao atualizar');
            }
        } catch {
            toast.error('Erro ao atualizar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover "${name}"?`)) return;

        try {
            const res = await fetch('/api/services', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                toast.success('Serviço removido');
                fetchServices();
            } else {
                toast.error('Erro ao remover');
            }
        } catch {
            toast.error('Erro ao remover');
        }
    };

    const startEdit = (service: ServiceData) => {
        setEditingId(service.id);
        setShowCreate(false);
        setForm({
            name: service.name,
            description: service.description,
            details: (service.details || []).join('\n'),
            duration: service.duration,
            durationMinutes: service.duration_minutes,
            price: service.price,
            icon: service.icon,
            category: service.category,
        });
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            details: '',
            duration: '1h',
            durationMinutes: 60,
            price: 0,
            icon: '🦶',
            category: 'Pedicura',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Serviços</h1>
                    <p className="text-gray-500 text-sm mt-1">Criar, editar e remover serviços de podologia</p>
                </div>
                <button
                    onClick={() => { setShowCreate(!showCreate); setEditingId(null); resetForm(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Novo Serviço
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <ServiceForm
                    form={form}
                    setForm={setForm}
                    onSave={handleCreate}
                    onCancel={() => { setShowCreate(false); resetForm(); }}
                    saving={saving}
                    title="Criar Serviço"
                />
            )}

            {/* Services List */}
            <div className="space-y-3">
                {services.map(service => (
                    <div key={service.id}>
                        {editingId === service.id ? (
                            <ServiceForm
                                form={form}
                                setForm={setForm}
                                onSave={() => handleUpdate(service.id)}
                                onCancel={() => { setEditingId(null); resetForm(); }}
                                saving={saving}
                                title={`Editar: ${service.name}`}
                            />
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{service.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                        <p className="text-sm text-gray-500">{service.description}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {service.duration} ({service.duration_minutes}min)
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-3 h-3" /> {service.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-indigo-600">{service.price}€</span>
                                    <button
                                        onClick={() => startEdit(service)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id, service.name)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                                        title="Remover"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {services.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg">Nenhum serviço cadastrado</p>
                    <p className="text-sm mt-1">Clique em "Novo Serviço" para começar</p>
                </div>
            )}
        </div>
    );
}

function ServiceForm({
    form,
    setForm,
    onSave,
    onCancel,
    saving,
    title,
}: {
    form: { name: string; description: string; details: string; duration: string; durationMinutes: number; price: number; icon: string; category: string };
    setForm: React.Dispatch<React.SetStateAction<typeof form>>;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    title: string;
}) {
    return (
        <div className="bg-white rounded-xl border-2 border-indigo-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">{title}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nome do serviço"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <input
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="ex: Pedicura"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Breve descrição do serviço"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes (um por linha)</label>
                <textarea
                    value={form.details}
                    onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Escalda-pés&#10;Lixamento e esfoliação&#10;Hidratação"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração *</label>
                    <input
                        value={form.duration}
                        onChange={e => {
                            const dur = e.target.value;
                            setForm(f => ({ ...f, duration: dur, durationMinutes: parseDuration(dur) }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="1h20m"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minutos</label>
                    <input
                        type="number"
                        value={form.durationMinutes}
                        onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (€) *</label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: Math.floor(parseFloat(e.target.value)) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        step="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                    <input
                        value={form.icon}
                        onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="🦶"
                    />
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                    <strong>Tempo total bloqueado:</strong> {form.durationMinutes}min (apenas o serviço)
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                </button>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                    <X className="w-4 h-4" />
                    Cancelar
                </button>
            </div>
        </div>
    );
}
