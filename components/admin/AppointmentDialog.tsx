'use client';

import { X, Clock, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import type { Appointment, Product } from '@/types';
import { useServices } from '@/hooks/useServices';
import { HOURLY_TIMES, getHourlyTimes, generateTimeSlots, isSlotAvailable, parseDuration } from '@/lib/utils/schedule';
import { isValidHourlyTime } from '@/lib/formatters';
import { toast } from 'sonner';

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  appointment?: Appointment | null;
  initialDate?: string;
  initialTime?: string;
  allAppointments?: Appointment[];
}

export function AppointmentDialog({
  isOpen,
  onClose,
  onSave,
  appointment,
  initialDate,
  initialTime,
  allAppointments = []
}: AppointmentDialogProps) {
  const { services, getServiceById } = useServices();
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState<Partial<Appointment>>({
    nome: '',
    telefone: '',
    email: '',
    servico: '',
    data: '',
    hora: '',
    preco: 0,
    observacoes: '',
    status: 'pending',
    duracaoMinutos: 60,
    produtos: [],
  });

  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Fetch products
  useEffect(() => {
    if (isOpen) {
      fetch('/api/products')
        .then(r => r.json())
        .then(d => setProducts(d.products || []))
        .catch(() => setProducts([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment,
        duracaoMinutos: appointment.duracaoMinutos || 60,
        produtos: appointment.produtos || [],
      });
      setPriceManuallyEdited(true);
    } else {
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        servico: '',
        data: initialDate || '',
        hora: initialTime || '',
        preco: 0,
        observacoes: '',
        status: 'pending',
        duracaoMinutos: 60,
        produtos: [],
      });
      setPriceManuallyEdited(false);
    }
  }, [appointment, isOpen, initialDate, initialTime]);

  const selectedServiceDuration = useMemo(() => {
    return formData.duracaoMinutos || 60;
  }, [formData.duracaoMinutos]);

  // Calcular horários disponíveis considerando a duração do serviço
  const availableHours = useMemo(() => {
    if (!formData.data) return HOURLY_TIMES;

    const bookedAppointments = allAppointments
      .filter(apt =>
        apt.data === formData.data &&
        apt.id !== appointment?.id &&
        apt.status !== 'cancelled'
      )
      .map(apt => ({
        hora: apt.hora,
        duracaoMinutos: apt.duracaoMinutos || 60,
      }));

    const slotsPossible = formData.data ? getHourlyTimes(formData.data) : HOURLY_TIMES;

    return slotsPossible.filter(time =>
      isSlotAvailable(time, selectedServiceDuration, bookedAppointments, formData.data)
    );
  }, [formData.data, selectedServiceDuration, allAppointments, appointment?.id]);

  const handleServiceChange = (serviceId: string) => {
    const selected = services.find(s => s.id === serviceId);
    if (!selected) return;

    const duration = selected.durationMinutes || parseDuration(selected.duration) || 60;

    // Calcular novo preço total (serviço + produtos já selecionados)
    const productsTotal = (formData.produtos || []).reduce((sum, p) => sum + p.price, 0);
    const newPrice = selected.price + productsTotal;

    setFormData(prev => ({
      ...prev,
      servico: selected.name,
      servicoId: selected.id,
      duracaoMinutos: duration,
      preco: newPrice,
    }));

    if (selected) {
      setPriceManuallyEdited(false);
    }
  };

  const handlePriceChange = (value: string) => {
    setPriceManuallyEdited(true);
    setFormData(prev => ({ ...prev, preco: Math.floor(parseFloat(value)) || 0 }));
  };

  const addProduct = (product: Product) => {
    const current = formData.produtos || [];
    if (current.find(p => p.id === product.id)) return;

    const updated = [...current, { id: product.id, name: product.name, price: product.price }];
    const newPrice = (formData.preco || 0) + product.price;

    setFormData(prev => ({
      ...prev,
      produtos: updated,
      preco: newPrice,
    }));
    setShowProductPicker(false);
  };

  const removeProduct = (productId: string) => {
    const current = formData.produtos || [];
    const p = current.find(item => item.id === productId);
    if (!p) return;

    const updated = current.filter(item => item.id !== productId);
    const newPrice = Math.max(0, (formData.preco || 0) - p.price);

    setFormData(prev => ({
      ...prev,
      produtos: updated,
      preco: newPrice,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.hora && !isValidHourlyTime(formData.hora)) {
      toast.error('Por favor, selecione uma hora inteira (ex: 09:00)');
      return;
    }

    const appointmentData: Appointment = {
      id: formData.id || `temp-${Date.now()}`,
      nome: formData.nome || '',
      telefone: formData.telefone || '',
      email: formData.email || '',
      servico: formData.servico || '',
      servicoId: formData.servicoId,
      data: formData.data || '',
      hora: formData.hora || '',
      preco: formData.preco || 0,
      observacoes: formData.observacoes || '',
      status: formData.status || 'pending',
      duracaoMinutos: formData.duracaoMinutos || 60,
      produtos: formData.produtos || [],
      valorPagamento: formData.valorPagamento,
      tipoPagamento: formData.tipoPagamento,
      criadoEm: formData.criadoEm,
    };

    onSave(appointmentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
              <select
                value={formData.servicoId || ''}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione um serviço</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration}) - {s.price}€
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
              <input
                type="number"
                value={formData.duracaoMinutos}
                onChange={(e) => setFormData({ ...formData, duracaoMinutos: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Total (€)</label>
              <input
                type="number"
                step="1"
                value={formData.preco}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <select
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione um horário</option>
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
                {!availableHours.includes(formData.hora || '') && formData.hora && (
                  <option value={formData.hora}>{formData.hora} (atual/ocupado)</option>
                )}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Produtos Associados */}
            <div className="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Produtos
                </label>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(!showProductPicker)}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              {showProductPicker && (
                <div className="mb-3 p-2 bg-white border border-gray-300 rounded-lg max-h-40 overflow-auto shadow-sm">
                  {products.length === 0 && <p className="text-xs text-gray-400 p-2">Nenhum produto cadastrado</p>}
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="w-full text-left p-2 hover:bg-indigo-50 text-xs rounded flex justify-between items-center"
                    >
                      <span>{p.name}</span>
                      <span className="font-bold">{p.price}€</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                {(formData.produtos || []).map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-gray-200 text-xs">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-600">{p.price}€</span>
                      <button type="button" onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {(formData.produtos || []).length === 0 && (
                  <p className="text-xs text-gray-400 italic">Nenhum produto selecionado</p>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              {appointment ? 'Salvar Alterações' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
