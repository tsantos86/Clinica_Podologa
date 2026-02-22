'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, X, Loader2, Package } from 'lucide-react';

interface ProductData {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    active: boolean;
}

interface ProductsManagementProps {
    token: string;
}

export function ProductsManagement({ token }: ProductsManagementProps) {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: 0,
        icon: '📦',
    });

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreate = async () => {
        if (!form.name || !form.price) {
            toast.error('Nome e preço são obrigatórios');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                toast.success('Produto criado com sucesso!');
                setShowCreate(false);
                resetForm();
                fetchProducts();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erro ao criar produto');
            }
        } catch {
            toast.error('Erro ao criar produto');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, ...form }),
            });

            if (res.ok) {
                toast.success('Produto atualizado!');
                setEditingId(null);
                resetForm();
                fetchProducts();
            } else {
                toast.error('Erro ao atualizar');
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
            const res = await fetch('/api/products', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                toast.success('Produto removido');
                fetchProducts();
            } else {
                toast.error('Erro ao remover');
            }
        } catch {
            toast.error('Erro ao remover');
        }
    };

    const startEdit = (product: ProductData) => {
        setEditingId(product.id);
        setShowCreate(false);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            icon: product.icon || '📦',
        });
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            price: 0,
            icon: '📦',
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
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
                    <p className="text-gray-500 text-sm mt-1">Criar, editar e remover produtos disponíveis para agendamento</p>
                </div>
                <button
                    onClick={() => { setShowCreate(!showCreate); setEditingId(null); resetForm(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <ProductForm
                    form={form}
                    setForm={setForm}
                    onSave={handleCreate}
                    onCancel={() => { setShowCreate(false); resetForm(); }}
                    saving={saving}
                    title="Criar Produto"
                />
            )}

            {/* Products List */}
            <div className="space-y-3">
                {products.map(product => (
                    <div key={product.id}>
                        {editingId === product.id ? (
                            <ProductForm
                                form={form}
                                setForm={setForm}
                                onSave={() => handleUpdate(product.id)}
                                onCancel={() => { setEditingId(null); resetForm(); }}
                                saving={saving}
                                title={`Editar: ${product.name}`}
                            />
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{product.icon || '📦'}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        {product.description && (
                                            <p className="text-sm text-gray-500">{product.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-indigo-600">{product.price}€</span>
                                    <button
                                        onClick={() => startEdit(product)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
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

            {products.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">Nenhum produto cadastrado</p>
                    <p className="text-sm mt-1">Clique em "Novo Produto" para começar</p>
                </div>
            )}
        </div>
    );
}

function ProductForm({
    form,
    setForm,
    onSave,
    onCancel,
    saving,
    title,
}: {
    form: { name: string; description: string; price: number; icon: string };
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
                        placeholder="Nome do produto"
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
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Descrição do produto"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                <input
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="📦"
                    style={{ maxWidth: 80 }}
                />
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
