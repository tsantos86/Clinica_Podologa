'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { services } from '@/lib/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CreditCard, Check, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BookingData } from '@/types';
import { useModal } from '@/contexts/ModalContext';
import { AVAILABLE_TIMES, SUCCESS_MESSAGES, ERROR_MESSAGES, INFO_MESSAGES, CLOSED_DAYS } from '@/lib/constants';
import { formatDateLong, formatDateShort, dateToString, isValidPhone, isValidEmail } from '@/lib/formatters';
import { AppointmentService, createFormData } from '@/lib/api';
import { useBookingSettings, useWorkingDays } from '@/hooks/useCustomHooks';

const BookingModal = () => {
  const { activeModal, closeModal: closeModalContext } = useModal();
  const isOpen = activeModal === 'booking';
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    paymentType: 'signal',
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
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

  // A lógica de verificar settings agora está no hook useBookingSettings

  const fetchAvailableSlots = useCallback(async (date: string) => {
    if (!isWorkingDay(date)) {
      setAvailableSlots([]);
      const message = getClosedDayMessage(date);
      if (message) toast.info(message);
      return;
    }

    setLoadingSlots(true);
    try {
      const data = await AppointmentService.getAll(date);
      const bookedTimes = data.agendamentos.map(a => a.hora);
      const available = AVAILABLE_TIMES.filter(time => !bookedTimes.includes(time));
      setAvailableSlots(available);
      
      if (available.length === 0) {
        toast.warning('Todos os horários estão ocupados. Escolha outra data.');
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.NETWORK);
      setAvailableSlots([...AVAILABLE_TIMES]);
    } finally {
      setLoadingSlots(false);
    }
  }, [isWorkingDay, getClosedDayMessage]);

  const selectService = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setBookingData({
        ...bookingData,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        paymentAmount: service.price >= 10 ? Math.ceil(service.price * 0.1) : service.price,
      });
      setCurrentStep(2);
    }
  }, [bookingData]);

  const handleDateChange = useCallback((date: string) => {
    setBookingData({ ...bookingData, date, time: '' });
    fetchAvailableSlots(date);
  }, [bookingData, fetchAvailableSlots]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações humanizadas
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
      const formData = createFormData({
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
      });
      
      if (selectedPhoto) {
        formData.append('foto', selectedPhoto);
      }

      await AppointmentService.createWithPhoto(formData);
      
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.APPOINTMENT_CREATED, {
        duration: 5000,
      });
      
      closeModal();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(ERROR_MESSAGES.GENERIC);
      console.error('Erro ao enviar agendamento:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    closeModalContext();
    setCurrentStep(1);
    setBookingData({ paymentType: 'signal' });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setAvailableSlots([]);
  };

  const steps = [
    { number: 1, title: 'Serviços de Podologia', icon: Calendar },
    { number: 2, title: 'Agendamento', icon: Clock },
    { number: 3, title: 'Pagamento', icon: CreditCard },
  ];

  const getCurrentService = () => services.find(s => s.id === bookingData.serviceId);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="lg">
      <div className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.number
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
                <span className={`text-xs mt-2 font-semibold ${
                  currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${
                  currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Mensagem quando agendamentos estão fechados */}
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
                  <h3 className="text-xl font-bold mb-4">Que serviço gostaria de agendar?</h3>
                  {services.slice(0, 8).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => selectService(service.id)}
                      className="w-full p-4 rounded-button border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                    >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <div className="font-semibold text-text-primary group-hover:text-primary">
                        {service.name}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {service.description}
                      </div>
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
              <h3 className="text-xl font-bold mb-6">Complete o Seu Agendamento</h3>
              
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
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {bookingData.price}€
                    </div>
                    <div className="text-xs text-text-secondary">valor total</div>
                  </div>
                </div>
              </div>
              
              {/* Data e Hora */}
              <div className="mb-6 p-4 bg-primary/5 rounded-button">
                <h4 className="font-semibold mb-3 text-primary">📅 Quando gostaria de vir?</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Escolha a Data *</label>
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
                </div>

                {bookingData.date && isWorkingDay(bookingData.date) && (
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Horário Disponível *
                      {loadingSlots && <span className="text-primary ml-2">Verificando...</span>}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setBookingData({ ...bookingData, time })}
                          className={`py-2.5 sm:py-3 text-sm sm:text-base rounded-button border-2 transition-all ${
                            bookingData.time === time
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && !loadingSlots && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-2">
                        <p className="text-yellow-700 text-sm font-medium">
                          ⚠️ Nenhum horário disponível
                        </p>
                        <p className="text-yellow-600 text-xs mt-1">
                          Todos os horários estão ocupados neste dia. Que tal escolher outra data?
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dados Pessoais */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-primary">👤 Os Seus Dados</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={bookingData.name || ''}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                      className="input-field"
                      placeholder="Como gostaria de ser chamado(a)?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Telefone/WhatsApp *</label>
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
                    <label className="block text-sm font-semibold mb-2">📸 Foto do Pé (opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="input-field"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Ajuda-nos a preparar melhor o seu atendimento
                    </p>
                    
                    {/* Preview da Foto */}
                    {photoPreview && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-button">
                        <p className="text-sm font-semibold text-success mb-2">✅ {selectedPhoto?.name}</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-auto rounded-lg max-h-[200px] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                        >
                          Remover foto
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Observações (opcional)</label>
                    <textarea
                      value={bookingData.notes || ''}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      className="input-field min-h-[80px]"
                      placeholder="Tem alguma preferência ou algo que gostaria que soubéssemos?"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!bookingData.date || !bookingData.time || !bookingData.name || !bookingData.phone || !isWorkingDay(bookingData.date || '')}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar para Pagamento ➡️
              </button>
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
              <h3 className="text-xl font-bold mb-4">Confirmar os Seus Dados</h3>

              {/* Booking Summary */}
              <div className="card bg-gradient-to-br from-primary-light to-white mb-6">
                <h4 className="font-bold mb-4 text-lg">📋 Resumo da Sua Consulta</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <span className="text-2xl">
                      {getCurrentService()?.icon}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{bookingData.serviceName}</p>
                      <p className="text-xs text-text-secondary">Serviço selecionado</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">📅 Data:</span>
                    <span className="font-semibold">{new Date(bookingData.date || '').toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">🕐 Horário:</span>
                    <span className="font-semibold">{bookingData.time}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-b">
                    <span className="text-text-secondary">Valor da Consulta:</span>
                    <span className="text-xl font-bold text-primary">{bookingData.price}€</span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-primary">💳 Escolha a Forma de Pagamento</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setBookingData({
                      ...bookingData,
                      paymentType: 'signal',
                      paymentAmount: bookingData.price ? Math.ceil(bookingData.price * 0.1) : 0
                    })}
                    className={`w-full p-4 rounded-button border-2 transition-all text-left ${
                      bookingData.paymentType === 'signal'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-text-primary">Pagar Sinal (10%)</div>
                        <div className="text-xs text-text-secondary mt-1">
                          Reserve agora e pague o restante no dia
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">{bookingData.paymentAmount}€</span>
                          <span className="text-xs text-text-secondary">de {bookingData.price}€</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text-secondary">Restante:</div>
                        <div className="text-lg font-semibold">
                          {bookingData.price ? (bookingData.price - (bookingData.paymentAmount || 0)).toFixed(2) : 0}€
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setBookingData({
                      ...bookingData,
                      paymentType: 'full',
                      paymentAmount: bookingData.price || 0
                    })}
                    className={`w-full p-4 rounded-button border-2 transition-all text-left ${
                      bookingData.paymentType === 'full'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-text-primary">Pagar Valor Total</div>
                        <div className="text-xs text-text-secondary mt-1">
                          Deixe tudo pago e venha apenas aproveitar
                        </div>
                        <div className="mt-2">
                          <span className="text-lg font-bold text-primary">{bookingData.price}€</span>
                          <span className="text-xs text-success ml-2">✅ Sem saldo em aberto</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
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
                  `✅ Confirmar Agendamento - ${bookingData.paymentAmount}€`
                )}
              </button>
            </motion.div>
          )}
          </>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default BookingModal;
