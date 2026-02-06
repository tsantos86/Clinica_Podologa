'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Sidebar, MobileSidebar } from '@/components/admin';
import { Header } from '@/components/admin/Header';
import { DaySchedule } from '@/components/admin/DaySchedule';
import { AppointmentDialog } from '@/components/admin/AppointmentDialog';
import { LoginPage } from '@/components/admin/LoginPage';
import type { Appointment } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDialogDate, setInitialDialogDate] = useState<string | undefined>();
  const [initialDialogTime, setInitialDialogTime] = useState<string | undefined>();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // Verificar autenticação
  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  // Carregar agendamentos quando autenticar
  useEffect(() => {
    if (isAuthenticated) {
      // Tentar carregar do backend
      const loadData = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${BACKEND_URL}/api/agendamentos`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const data = await response.json();
            const appointmentsData = (data.agendamentos || []).map((ag: any) => ({
              ...ag,
              status: ag.status || 'pending',
            }));
            if (appointmentsData.length > 0) {
              setAppointments(appointmentsData);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log('Backend não disponível, usando dados de exemplo');
        }
        
        // Se não conseguiu do backend ou está vazio, usar dados de exemplo
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(today.getDate()).padStart(2, '0');
        
        console.log('Creating demo appointments for date:', todayStr);
        
        const exampleAppointments: Appointment[] = [
          {
            id: '1',
            nome: 'Maria Silva',
            telefone: '912345678',
            email: 'maria@example.com',
            servico: 'Pedicure Completa',
            data: todayStr,
            hora: '10:00',
            preco: 30,
            status: 'confirmed',
          },
          {
            id: '2',
            nome: 'João Santos',
            telefone: '913456789',
            email: 'joao@example.com',
            servico: 'Tratamento de Calosidades',
            data: todayStr,
            hora: '14:30',
            preco: 35,
            status: 'pending',
          },
          {
            id: '3',
            nome: 'Ana Costa',
            telefone: '914567890',
            email: 'ana@example.com',
            servico: 'Manicure',
            data: todayStr,
            hora: '11:30',
            preco: 25,
            status: 'confirmed',
          },
          {
            id: '4',
            nome: 'Pedro Oliveira',
            telefone: '915678901',
            email: 'pedro@example.com',
            servico: 'Tratamento de Unhas Encravadas',
            data: todayStr,
            hora: '15:30',
            preco: 40,
            status: 'pending',
          },
          {
            id: '5',
            nome: 'Carla Mendes',
            telefone: '916789012',
            email: 'carla@example.com',
            servico: 'Pedicure Completa',
            data: todayStr,
            hora: '09:30',
            preco: 30,
            status: 'confirmed',
          },
          {
            id: '6',
            nome: 'Ricardo Alves',
            telefone: '917890123',
            email: 'ricardo@example.com',
            servico: 'Manicure',
            data: todayStr,
            hora: '16:30',
            preco: 35,
            status: 'pending',
          },
          {
            id: '7',
            nome: 'Sofia Martins',
            telefone: '918901234',
            email: 'sofia@example.com',
            servico: 'Pedicure Completa',
            data: todayStr,
            hora: '08:30',
            preco: 30,
            status: 'confirmed',
          },
          {
            id: '8',
            nome: 'Bruno Costa',
            telefone: '919012345',
            email: 'bruno@example.com',
            servico: 'Manicure',
            data: todayStr,
            hora: '18:30',
            preco: 25,
            status: 'pending',
          },
        ];
        setAppointments(exampleAppointments);
        setLoading(false);
        toast.info('Modo demo: usando dados de exemplo');
      };
      
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleUpdateAppointment = async (appointmentId: string, newTime: string) => {
    // Atualizar localmente primeiro (optimistic update)
    const previousAppointments = [...appointments];
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, hora: newTime }
          : apt
      )
    );

    try {
      const response = await fetch(`${BACKEND_URL}/api/agendamentos/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hora: newTime }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar horário');
      }

      toast.success(`Agendamento movido para ${newTime} ✓`);
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      // Reverter em caso de erro
      setAppointments(previousAppointments);
      toast.error('Erro ao atualizar horário. Tente novamente.');
    }
  };

  const handleSwapAppointments = async (appointment1Id: string, appointment2Id: string) => {
    // Encontrar os dois agendamentos
    const apt1 = appointments.find(a => a.id === appointment1Id);
    const apt2 = appointments.find(a => a.id === appointment2Id);

    if (!apt1 || !apt2) return;

    const previousAppointments = [...appointments];

    // Trocar horários localmente primeiro (optimistic update)
    setAppointments(prev => 
      prev.map(apt => {
        if (apt.id === appointment1Id) {
          return { ...apt, hora: apt2.hora };
        }
        if (apt.id === appointment2Id) {
          return { ...apt, hora: apt1.hora };
        }
        return apt;
      })
    );

    try {
      // Enviar ambas as atualizações para o backend
      const responses = await Promise.all([
        fetch(`${BACKEND_URL}/api/agendamentos/${appointment1Id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hora: apt2.hora }),
        }),
        fetch(`${BACKEND_URL}/api/agendamentos/${appointment2Id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hora: apt1.hora }),
        })
      ]);

      if (!responses.every(r => r.ok)) {
        throw new Error('Falha ao trocar horários');
      }

      toast.success(`Agendamentos trocados: ${apt1.hora} ↔️ ${apt2.hora}`);
    } catch (error) {
      console.error('Erro ao trocar horários:', error);
      // Reverter em caso de erro
      setAppointments(previousAppointments);
      toast.error('Erro ao trocar horários. Tente novamente.');
    }
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      if (editingAppointment) {
        // Editar existente - atualizar localmente primeiro
        setAppointments(prev => 
          prev.map(apt => apt.id === appointment.id ? appointment : apt)
        );

        const response = await fetch(`${BACKEND_URL}/api/agendamentos/${appointment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointment),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar agendamento');
        }

        toast.success('Agendamento atualizado com sucesso');
      } else {
        // Criar novo - adicionar localmente primeiro
        const newAppointment: Appointment = {
          ...appointment,
          id: `temp-${Date.now()}`,
          status: 'pending' as const,
        };
        
        setAppointments(prev => [...prev, newAppointment]);

        try {
          const response = await fetch(`${BACKEND_URL}/api/agendamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
          });

          if (response.ok) {
            const data = await response.json();
            // Atualizar com ID real do backend
            setAppointments(prev => 
              prev.map(apt => apt.id === newAppointment.id ? { ...appointment, id: data.id } : apt)
            );
          }
        } catch (err) {
          console.log('Backend indisponível, mantendo ID temporário');
        }

        toast.success('Agendamento criado com sucesso');
      }

      setIsDialogOpen(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast.error('Erro ao salvar agendamento. Tente novamente.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) {
      return;
    }

    const previousAppointments = [...appointments];
    setAppointments(prev => prev.filter(apt => apt.id !== id));

    try {
      const response = await fetch(`${BACKEND_URL}/api/agendamentos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar agendamento');
      }

      toast.success('Agendamento cancelado');
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      setAppointments(previousAppointments);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const previousAppointments = [...appointments];
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: status as Appointment['status'] } : apt)
    );

    try {
      const response = await fetch(`${BACKEND_URL}/api/agendamentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      const statusMessages: Record<string, string> = {
        confirmed: 'Agendamento confirmado',
        completed: 'Agendamento concluído',
        cancelled: 'Agendamento cancelado',
      };

      toast.success(statusMessages[status] || 'Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setAppointments(previousAppointments);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setInitialDialogDate(undefined);
    setInitialDialogTime(undefined);
    setIsDialogOpen(true);
  };

  const handleNewAppointmentAtTime = (date: string, time: string) => {
    setEditingAppointment(null);
    setInitialDialogDate(date);
    setInitialDialogTime(time);
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setInitialDialogDate(undefined);
    setInitialDialogTime(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    setInitialDialogDate(undefined);
    setInitialDialogTime(undefined);
  };

  const filterAppointments = (appointments: Appointment[]) => {
    if (!searchQuery) return appointments;
    
    const query = searchQuery.toLowerCase();
    return appointments.filter((apt) =>
      apt.nome.toLowerCase().includes(query) ||
      apt.telefone.includes(query) ||
      apt.email.toLowerCase().includes(query) ||
      apt.servico.toLowerCase().includes(query)
    );
  };

  const getCurrentDayAppointments = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const filtered = filterAppointments(appointments);
    
    console.log('Debug - currentDate:', dateStr);
    console.log('Debug - total appointments:', appointments.length);
    console.log('Debug - filtered appointments:', filtered.length);
    console.log('Debug - appointments for today:', filtered.filter((apt: Appointment) => apt.data === dateStr).length);
    console.log('Debug - all appointment dates:', appointments.map(a => a.data));
    
    return filtered.filter((apt: Appointment) => apt.data === dateStr);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onNewAppointment={handleNewAppointment}
          onSearch={setSearchQuery}
        />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-3 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <DaySchedule
              date={currentDate}
              appointments={getCurrentDayAppointments()}
              onUpdateAppointment={handleUpdateAppointment}
              onSwapAppointments={handleSwapAppointments}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onStatusChange={handleStatusChange}
              onNewAppointmentAtTime={handleNewAppointmentAtTime}
            />
          )}
        </main>
      </div>

      {/* Dialog para criar/editar agendamento */}
      <AppointmentDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveAppointment}
        appointment={editingAppointment}
        initialDate={initialDialogDate}
        initialTime={initialDialogTime}
        allAppointments={appointments}
      />
    </div>
  );
}
