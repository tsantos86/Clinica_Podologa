'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Check, X, Trash2, Star, Clock, CheckCircle } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

interface TestimonialsManagementProps {
  token: string;
}

export function TestimonialsManagement({ token }: TestimonialsManagementProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Erro ao buscar testemunhos:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, approved }),
      });
      if (res.ok) {
        setTestimonials(prev =>
          prev.map(t => t.id === id ? { ...t, approved } : t)
        );
        toast.success(approved ? 'Testemunho aprovado' : 'Testemunho rejeitado');
      }
    } catch (err) {
      toast.error('Erro ao atualizar testemunho');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este testemunho?')) return;
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
        toast.success('Testemunho eliminado');
      }
    } catch (err) {
      toast.error('Erro ao eliminar testemunho');
    }
  };

  const filtered = testimonials.filter(t => {
    if (filter === 'pending') return !t.approved;
    if (filter === 'approved') return t.approved;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testemunhos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {testimonials.length} testemunho{testimonials.length !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span className="ml-2 text-orange-500 font-medium">
                ({pendingCount} pendente{pendingCount !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Aprovados'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">Nenhum testemunho{filter !== 'all' ? ` ${filter === 'pending' ? 'pendente' : 'aprovado'}` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 ${
                t.approved ? 'border-green-200' : 'border-orange-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{t.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {t.approved ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Aprovado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(t.createdAt).toLocaleDateString('pt-PT', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {!t.approved && (
                    <button
                      onClick={() => handleApprove(t.id, true)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                      title="Aprovar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {t.approved && (
                    <button
                      onClick={() => handleApprove(t.id, false)}
                      className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                      title="Rejeitar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
