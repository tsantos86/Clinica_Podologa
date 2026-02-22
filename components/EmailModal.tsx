'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useModal } from '@/contexts/ModalContext';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

const EmailModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'email';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [errors, setErrors] = useState({
    subject: '',
    message: '',
  });

  const validateForm = () => {
    const newErrors = {
      subject: '',
      message: '',
    };
    
    if (formData.subject.length < 5) {
      newErrors.subject = 'O assunto deve ter pelo menos 5 caracteres.';
    }
    
    if (formData.message.length < 20) {
      newErrors.message = 'A mensagem deve ter pelo menos 20 caracteres.';
    }
    
    setErrors(newErrors);
    return !newErrors.subject && !newErrors.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Mensagem enviada com sucesso!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        closeModal();
      } else {
        toast.error(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setErrors({
      subject: '',
      message: '',
    });
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Enviar Email" size="md">
      <div className="p-6">
        <p className="text-text-secondary mb-6 text-center">
          Preencha o formulário abaixo para entrar em contacto
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Seu Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Assunto *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                setErrors({ ...errors, subject: '' });
              }}
              className={`input-field ${errors.subject ? 'border-red-500' : ''}`}
              placeholder="Mínimo 5 caracteres"
              required
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Mensagem *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                setErrors({ ...errors, message: '' });
              }}
              className={`input-field min-h-[150px] ${errors.message ? 'border-red-500' : ''}`}
              placeholder="Mínimo 20 caracteres"
              required
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
            <p className="text-sm text-text-light mt-1">
              {formData.message.length}/20 caracteres
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar Mensagem
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EmailModal;
