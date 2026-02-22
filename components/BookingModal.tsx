'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Modal from './Modal';
import Image from 'next/image';
import { useServices } from '@/hooks/useServices';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CreditCard, Check, ChevronLeft, ShoppingBag, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { BookingData, Product } from '@/types';
import { useModal } from '@/contexts/ModalContext';
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  INFO_MESSAGES,
  CLOSED_DAYS,
  SCHEDULE,
} from '@/lib/constants';
import {
  HOURLY_TIMES,
  isSlotAvailable,
  getTotalBlockedTime,
  timeToMinutes,
  parseDuration,
  generateTimeSlots,
  getHourlyTimes,
} from '@/lib/utils/schedule';
import { formatDateLong, formatDateShort, dateToString, isValidPhone, isValidEmail } from '@/lib/formatters';
import { AppointmentService } from '@/lib/api';
import { useBookingSettings, useWorkingDays } from '@/hooks/useCustomHooks';
import PolicyAcceptanceModal from './PolicyAcceptanceModal';

interface PaymentSettings {
  mbwayEnabled: boolean;
  signalEnabled: boolean;
  signalAmount: number;
}

const BookingModal = () => {
  const { activeModal, closeModal: closeModalContext } = useModal();
  const isOpen = activeModal === 'booking';
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    paymentType: 'signal',
    products: [],
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Política de agendamento (primeira vez)
  const [showPolicy, setShowPolicy] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [checkingFirstTime, setCheckingFirstTime] = useState(false);
  const checkedPhonesRef = useRef<Set<string>>(new Set());

  // Produtos
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    mbwayEnabled: true,
    signalEnabled: true,
    signalAmount: 10,
  });

  // Blocked dates
  const [blockedDatesSet, setBlockedDatesSet] = useState<Set<string>>(new Set());

  // Serviços com preços do backend (sincronizados com admin)
  const { services, getServiceById } = useServices();

  // Usar hooks customizados
  const { isWorkingDay, getClosedDayMessage } = useWorkingDays();

  // Calcular mês baseado na data selecionada
  const selectedMonth = useMemo(() => {
    if (!bookingData.date) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    const selectedDate = new Date(bookingData.date + 'T00:00:00');
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  }, [bookingData.date]);

  const { bookingsEnabled, loading: loadingSettings } = useBookingSettings(isOpen ? selectedMonth : undefined);

  // Fetch products, payment settings, and blocked dates
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setAllProducts(d.products || []))
      .catch(() => setAllProducts([]));

    fetch('/api/settings/payment')
      .then(r => r.json())
      .then(d => setPaymentSettings({
        mbwayEnabled: d.mbwayEnabled ?? true,
        signalEnabled: d.signalEnabled ?? true,
        signalAmount: d.signalAmount ?? 10,
      }))
      .catch(() => { });

    fetch('/api/settings/blocked-dates')
      .then(r => r.json())
      .then(d => {
        const dates = (d.blockedDates || []).map((bd: { date: string }) => bd.date);
        setBlockedDatesSet(new Set(dates));
      })
      .catch(() => { });
  }, [isOpen]);

  // Calcular duração do serviço selecionado
  const selectedServiceDuration = useMemo(() => {
    const svc = getServiceById(bookingData.serviceId || '');
    return svc?.durationMinutes || parseDuration(svc?.duration) || 60;
  }, [bookingData.serviceId, getServiceById]);

  const fetchAvailableSlots = useCallback(async (date: string) => {
    if (!isWorkingDay(date)) {
      setAvailableSlots([]);
      const message = getClosedDayMessage(date);
      if (message) toast.info(message);
      return;
    }

    // Check if date is blocked
    if (blockedDatesSet.has(date)) {
      setAvailableSlots([]);
      toast.info('Este dia está indisponível. Por favor, escolha outra data.');
      return;
    }

    setLoadingSlots(true);
    try {
      const data = await AppointmentService.getAll(date);
      const bookedAppointments = data.agendamentos
        .filter(a => a.status !== 'cancelled')
        .map(a => ({
          hora: a.hora,
          duracaoMinutos: a.duracaoMinutos || 60,
        }));

      const slotsForDay = generateTimeSlots(date, true);
      // Filter available slots based on service duration + hygienization + overlaps
      const available = slotsForDay.filter(time =>
        isSlotAvailable(time, selectedServiceDuration, bookedAppointments, date)
      );
      setAvailableSlots(available);

      if (available.length === 0) {
        toast.warning('Todos os horários estão ocupados para este serviço. Escolha outra data.');
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.NETWORK);
      setAvailableSlots(generateTimeSlots(date, true));
    } finally {
      setLoadingSlots(false);
    }
  }, [isWorkingDay, getClosedDayMessage, selectedServiceDuration, blockedDatesSet]);

  const selectService = useCallback((serviceId: string) => {
    const service = getServiceById(serviceId);
    if (service) {
      setBookingData({
        ...bookingData,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        paymentAmount: 10,
        // Reset date/time when service changes (different durations affect availability)
        date: '',
        time: '',
      });
      setAvailableSlots([]);
      setCurrentStep(2);
    }
  }, [bookingData, getServiceById]);

  const handleDateChange = useCallback((date: string) => {
    setBookingData(prev => ({ ...prev, date, time: '' }));
    fetchAvailableSlots(date);
  }, [fetchAvailableSlots]);

  // Product management
  const addProduct = (product: Product) => {
    const current = bookingData.products || [];
    if (current.find(p => p.id === product.id)) {
      toast.info('Produto já adicionado');
      return;
    }
    const updated = [...current, { id: product.id, name: product.name, price: product.price }];
    const totalProducts = updated.reduce((sum, p) => sum + p.price, 0);
    const basePrice = getServiceById(bookingData.serviceId || '')?.price || 0;
    const newTotal = basePrice + totalProducts;
    setBookingData(prev => ({
      ...prev,
      products: updated,
      price: newTotal,
      paymentAmount: 10,
    }));
    setShowProductPicker(false);
    toast.success(`${product.name} adicionado`);
  };

  const removeProduct = (productId: string) => {
    const current = bookingData.products || [];
    const updated = current.filter(p => p.id !== productId);
    const totalProducts = updated.reduce((sum, p) => sum + p.price, 0);
    const basePrice = getServiceById(bookingData.serviceId || '')?.price || 0;
    const newTotal = basePrice + totalProducts;
    setBookingData(prev => ({
      ...prev,
      products: updated,
      price: newTotal,
      paymentAmount: 10,
    }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.name || bookingData.name.length < 3) {
      toast.error('✏️ Por favor, preencha o seu nome completo');
      return;
    }

    if (!bookingData.phone || !isValidPhone(bookingData.phone)) {
      toast.error('📞 Por favor, insira um número de telefone válido (9 dígitos)');
      return;
    }

    if (bookingData.email && !isValidEmail(bookingData.email)) {
      toast.error('✉️ Por favor, insira um email válido');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('🚀 A processar o seu agendamento...');

    try {
      await AppointmentService.create({
        servico: bookingData.serviceName,
        servicoId: bookingData.serviceId,
        preco: bookingData.price,
        data: bookingData.date,
        hora: bookingData.time,
        nome: bookingData.name,
        telefone: bookingData.phone,
        email: bookingData.email || '',
        observacoes: bookingData.notes || '',
        tipoPagamento: bookingData.paymentType || 'signal',
        valorPagamento: bookingData.paymentAmount,
        duracaoMinutos: selectedServiceDuration,
        produtos: bookingData.products,
      } as Record<string, unknown>);

      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.APPOINTMENT_CREATED, {
        duration: 5000,
      });

      closeModal();
    } catch (error) {
      toast.dismiss(loadingToast);
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC;
      toast.error(message);
      console.error('Erro ao enviar agendamento:', error);
    } finally {
      setSubmitting(false);
    }
  };

  /** Verifica se é primeira marcação e mostra política se necessário */
  const handleContinueToPayment = useCallback(async () => {
    if (!bookingData.phone) return;

    // Se já aceitou a política nesta sessão, avançar direto
    if (policyAccepted) {
      setCurrentStep(3);
      return;
    }

    // Se já verificamos este telefone e já é cliente, avançar direto
    const cleanedPhone = bookingData.phone.replace(/\D/g, '');
    if (checkedPhonesRef.current.has(cleanedPhone)) {
      setCurrentStep(3);
      return;
    }

    setCheckingFirstTime(true);
    try {
      const res = await fetch(`/api/agendamentos/check-first-time?telefone=${encodeURIComponent(cleanedPhone)}`);
      const data = await res.json();

      if (data.firstTime) {
        // Primeira vez — mostrar política
        setShowPolicy(true);
      } else {
        // Cliente já existente — guardar no cache e avançar
        checkedPhonesRef.current.add(cleanedPhone);
        setCurrentStep(3);
      }
    } catch {
      // Em caso de erro, mostrar política por segurança
      setShowPolicy(true);
    } finally {
      setCheckingFirstTime(false);
    }
  }, [bookingData.phone, policyAccepted]);

  const handlePolicyAccept = useCallback(() => {
    setPolicyAccepted(true);
    setShowPolicy(false);
    setCurrentStep(3);
  }, []);

  const handlePolicyDecline = useCallback(() => {
    setShowPolicy(false);
  }, []);

  const closeModal = () => {
    closeModalContext();
    setCurrentStep(1);
    setBookingData({ paymentType: paymentSettings.signalEnabled ? 'signal' : 'full', products: [] });
    setAvailableSlots([]);
    setShowProductPicker(false);
    setShowPolicy(false);
    setPolicyAccepted(false);
  };

  const steps = [
    { number: 1, title: 'Serviços de Podologia', icon: Calendar },
    { number: 2, title: 'Agendamento', icon: Clock },
    { number: 3, title: 'Pagamento', icon: CreditCard },
  ];

  const getCurrentService = () => getServiceById(bookingData.serviceId || '');

  // Calcula o fim do atendimento para exibir ao utilizador
  const getEndTime = (startTime: string) => {
    const totalMin = timeToMinutes(startTime) + selectedServiceDuration;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="lg">
      <div className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.number
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-semibold ${currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                  }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {loadingSettings ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">{INFO_MESSAGES.LOADING}</p>
            </div>
          ) : !bookingsEnabled ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {ERROR_MESSAGES.BOOKINGS_CLOSED.split('.')[0]}
              </h3>
              <p className="text-gray-600 mb-6">
                Desculpe, não estamos a aceitar novos agendamentos no momento.
                <br />
                Por favor, tente novamente mais tarde ou entre em contacto connosco.
              </p>
              <button
                onClick={closeModal}
                className="btn-primary"
              >
                Entendi ✔️
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Select Service */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <h3 className="text-xl font-bold mb-4">Escolha o serviço de podologia</h3>
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => selectService(service.id)}
                      className="w-full p-4 rounded-button border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                          {service.photoUrl ? (
                            <Image
                              src={service.photoUrl}
                              alt={service.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized={service.photoUrl.includes('.svg')} // SVG doesn't need optimization
                            />
                          ) : (
                            <span className="text-3xl">{service.icon}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary group-hover:text-primary">
                            {service.name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {service.description}
                          </div>
                          {service.duration && (
                            <div className="text-xs text-text-secondary mt-0.5">
                              ⏱️ {service.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {service.price}€
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Step 2: Date, Time & Personal Info Combined */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-primary mb-4 hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                  <h3 className="text-xl font-bold mb-6">Finalize o seu agendamento</h3>

                  {/* Service Summary */}
                  <div className="card bg-gradient-to-br from-primary-light to-white mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">
                        {getCurrentService()?.icon}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-text-primary">{bookingData.serviceName}</h4>
                        <p className="text-sm text-text-secondary">
                          {getCurrentService()?.description}
                        </p>
                        {getCurrentService()?.duration && (
                          <p className="text-xs text-text-secondary mt-1">
                            ⏱️ Duração estimada: {getCurrentService()?.duration}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {getServiceById(bookingData.serviceId || '')?.price}€
                        </div>
                        <div className="text-xs text-text-secondary">valor serviço</div>
                      </div>
                    </div>
                  </div>

                  {/* Data e Hora */}
                  <div className="mb-6 p-4 bg-primary/5 rounded-button">
                    <h4 className="font-semibold mb-3 text-primary">📅 Quando prefere vir?</h4>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Selecione a data *</label>
                      <input
                        type="date"
                        value={bookingData.date || ''}
                        onChange={(e) => handleDateChange(e.target.value)}
                        onClick={(e) => {
                          try {
                            (e.target as HTMLInputElement).showPicker();
                          } catch (error) {
                            // Fallback para navegadores que não suportam showPicker()
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                        autoFocus
                        required
                      />
                      {bookingData.date && !isWorkingDay(bookingData.date) && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mt-2">
                          <p className="text-red-700 text-sm font-medium">
                            ❌ {getClosedDayMessage(bookingData.date)}
                          </p>
                          <p className="text-red-600 text-xs mt-1">
                            Por favor, escolha outra data para o seu agendamento.
                          </p>
                        </div>
                      )}
                      {bookingData.date && isWorkingDay(bookingData.date) && blockedDatesSet.has(bookingData.date) && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mt-2">
                          <p className="text-red-700 text-sm font-medium">
                            🚫 Este dia está bloqueado e indisponível para agendamentos.
                          </p>
                          <p className="text-red-600 text-xs mt-1">
                            A profissional não atende neste dia. Por favor, escolha outra data.
                          </p>
                        </div>
                      )}
                    </div>

                    {bookingData.date && isWorkingDay(bookingData.date) && !blockedDatesSet.has(bookingData.date) && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Horário disponível *
                          {loadingSlots && <span className="text-primary ml-2">Verificando...</span>}
                        </label>
                        <p className="text-xs text-text-secondary mb-3">
                          Horários disponíveis • Funcionamento: {bookingData.date && new Date(bookingData.date + 'T00:00:00').getDay() === 6 ? '09:00' : SCHEDULE.OPENING_TIME} – {SCHEDULE.CLOSING_TIME}
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                          {availableSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingData({ ...bookingData, time })}
                              className={`py-2 text-xs sm:text-sm rounded-button border-2 transition-all ${bookingData.time === time
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                                }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                        {bookingData.time && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-700 text-xs">
                              ✅ Atendimento das <strong>{bookingData.time}</strong> às <strong>{getEndTime(bookingData.time)}</strong> ({selectedServiceDuration}min)
                            </p>
                          </div>
                        )}
                        {availableSlots.length === 0 && !loadingSlots && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-2">
                            <p className="text-yellow-700 text-sm font-medium">
                              ⚠️ Nenhum horário disponível
                            </p>
                            <p className="text-yellow-600 text-xs mt-1">
                              Todos os horários estão ocupados para este serviço ({selectedServiceDuration}min). Escolha outra data.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dados Pessoais */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-primary">👤 Seus dados</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Nome completo *</label>
                        <input
                          type="text"
                          value={bookingData.name || ''}
                          onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          className="input-field"
                          placeholder="Como prefere ser chamado(a)?"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Telefone ou WhatsApp *</label>
                        <input
                          type="tel"
                          value={bookingData.phone || ''}
                          onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                          placeholder="+351 XXX XXX XXX"
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Email (opcional)</label>
                        <input
                          type="email"
                          value={bookingData.email || ''}
                          onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Observações (opcional)</label>
                        <textarea
                          value={bookingData.notes || ''}
                          onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                          className="input-field min-h-[80px]"
                          placeholder="Preferência de horário ou observação?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products Section */}
                  {allProducts.length > 0 && (
                    <div className="mb-6 p-4 bg-orange-50/50 rounded-button border border-orange-100">
                      <h4 className="font-semibold mb-3 text-orange-700 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Adicionar Produto
                      </h4>

                      {/* Selected products */}
                      {bookingData.products && bookingData.products.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {bookingData.products.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                              <span className="text-sm font-medium">{p.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">{p.price}€</span>
                                <button onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-600">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add product button */}
                      <button
                        type="button"
                        onClick={() => setShowProductPicker(!showProductPicker)}
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar produto
                      </button>

                      {/* Product picker */}
                      {showProductPicker && (
                        <div className="mt-3 space-y-1.5 p-3 bg-white rounded-lg border border-gray-200 max-h-48 overflow-auto">
                          {allProducts
                            .filter(p => !bookingData.products?.find(sp => sp.id === p.id))
                            .map(product => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => addProduct(product)}
                                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{product.icon || '📦'}</span>
                                  <span className="text-sm">{product.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">{product.price}€</span>
                              </button>
                            ))
                          }
                          {allProducts.filter(p => !bookingData.products?.find(sp => sp.id === p.id)).length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">Todos os produtos já foram adicionados</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    disabled={!bookingData.date || !bookingData.time || !bookingData.name || !bookingData.phone || !isWorkingDay(bookingData.date || '') || blockedDatesSet.has(bookingData.date || '') || checkingFirstTime}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingFirstTime ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </span>
                    ) : (
                      'Continuar para pagamento ➡️'
                    )}
                  </button>

                  {/* Modal de Política de Agendamento (primeira vez) */}
                  <PolicyAcceptanceModal
                    isOpen={showPolicy}
                    onAccept={handlePolicyAccept}
                    onDecline={handlePolicyDecline}
                    signalAmount={paymentSettings.signalAmount}
                  />
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 text-primary mb-4 hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                  <h3 className="text-xl font-bold mb-4">Confirmar dados e pagamento</h3>

                  {/* Booking Summary */}
                  <div className="card bg-gradient-to-br from-primary-light to-white mb-6">
                    <h4 className="font-bold mb-4 text-lg">📋 Resumo do agendamento</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 pb-3 border-b">
                        <span className="text-2xl">
                          {getCurrentService()?.icon}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary">{bookingData.serviceName}</p>
                          <p className="text-xs text-text-secondary">
                            ⏱️ {getCurrentService()?.duration} • {bookingData.time} – {bookingData.time ? getEndTime(bookingData.time) : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">📅 Data:</span>
                        <span className="font-semibold">{new Date(bookingData.date || '').toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">🕐 Horário:</span>
                        <span className="font-semibold">{bookingData.time} – {bookingData.time ? getEndTime(bookingData.time) : ''}</span>
                      </div>

                      {/* Products in summary */}
                      {bookingData.products && bookingData.products.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-text-secondary mb-1">📦 Produtos:</p>
                          {bookingData.products.map(p => (
                            <div key={p.id} className="flex justify-between text-sm">
                              <span>{p.name}</span>
                              <span className="font-medium">{p.price}€</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center py-3 border-t border-b">
                        <span className="text-text-secondary">Valor total:</span>
                        <span className="text-xl font-bold text-primary">{bookingData.price}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-primary">💳 Forma de pagamento</h4>

                    {!paymentSettings.mbwayEnabled ? (
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-button border border-gray-200 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">💳</span>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">Formas de pagamento:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                Revolut
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                                📱 MB Way
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                                💵 Dinheiro
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100" />

                        <div className="flex items-start gap-3">
                          <span className="text-xl">💵</span>
                          <p className="text-sm text-gray-600">
                            O pagamento será feito <strong className="text-text-primary">presencialmente</strong> no dia da consulta.
                          </p>
                        </div>

                        <p className="text-xs text-gray-400 italic text-center">
                          Pagamento online não está disponível no momento.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Signal option - only show when signal is enabled */}
                        {paymentSettings.signalEnabled && (
                          <button
                            onClick={() => setBookingData({
                              ...bookingData,
                              paymentType: 'signal',
                              paymentAmount: paymentSettings.signalAmount
                            })}
                            className={`w-full p-4 rounded-button border-2 transition-all text-left ${bookingData.paymentType === 'signal'
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1">
                                <div className="font-semibold text-text-primary">Sinal de {paymentSettings.signalAmount}€</div>
                                <div className="text-xs text-text-secondary mt-1">
                                  Reserve agora e pague o restante no dia.
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-lg font-bold text-primary">{paymentSettings.signalAmount}€</span>
                                  <span className="text-xs text-text-secondary">de {bookingData.price}€</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-text-secondary">Saldo:</div>
                                <div className="text-lg font-semibold">
                                  {bookingData.price ? (bookingData.price - paymentSettings.signalAmount).toFixed(2) : 0}€
                                </div>
                              </div>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={() => setBookingData({
                            ...bookingData,
                            paymentType: 'full',
                            paymentAmount: bookingData.price || 0
                          })}
                          className={`w-full p-4 rounded-button border-2 transition-all text-left ${bookingData.paymentType === 'full'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-text-primary">Pagamento total</div>
                              <div className="text-xs text-text-secondary mt-1">
                                Tudo pago agora, sem saldo no dia.
                              </div>
                              <div className="mt-2">
                                <span className="text-lg font-bold text-primary">{bookingData.price}€</span>
                                <span className="text-xs text-success ml-2">✅ Sem saldo pendente</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Pay on site option */}
                        <button
                          onClick={() => setBookingData({
                            ...bookingData,
                            paymentType: 'onsite',
                            paymentAmount: 0
                          })}
                          className={`w-full p-4 rounded-button border-2 transition-all text-left ${bookingData.paymentType === 'onsite'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-text-primary">Pagar presencialmente</div>
                              <div className="text-xs text-text-secondary mt-1">
                                Pague tudo no dia da consulta (sem pagamento online).
                              </div>
                              <div className="mt-2">
                                <span className="text-lg font-bold text-primary">{bookingData.price}€</span>
                                <span className="text-xs text-gray-400 ml-2">a pagar no dia</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={submitForm}
                    disabled={submitting}
                    className="btn-primary w-full text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {INFO_MESSAGES.PROCESSING}
                      </span>
                    ) : (
                      bookingData.paymentType === 'onsite' || !paymentSettings.mbwayEnabled
                        ? '✅ Confirmar agendamento'
                        : `✅ Confirmar e reservar - ${bookingData.paymentAmount}€`
                    )}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </Modal >
  );
};

export default BookingModal;
