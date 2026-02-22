'use client';

import { useEffect, useState, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { Sidebar, MobileSidebar } from '@/components/admin';
import { Header } from '@/components/admin/Header';
import { DaySchedule } from '@/components/admin/DaySchedule';
import { AppointmentDialog } from '@/components/admin/AppointmentDialog';
import { LoginPage } from '@/components/admin/LoginPage';
import { Dashboard } from '@/components/admin/Dashboard';
import { ClientsPanel } from '@/components/admin/ClientsPanel';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { TestimonialsManagement } from '@/components/admin/TestimonialsManagement';
import ServicesPhotosPanel from '@/components/admin/ServicesPhotosPanel';
import { AuditLogPanel } from '@/components/admin/AuditLogPanel';
import { ServicesManagement } from '@/components/admin/ServicesManagement';
import { ProductsManagement } from '@/components/admin/ProductsManagement';
import type { Appointment } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeMenu, setActiveMenu] = useState('agendamentos');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDialogDate, setInitialDialogDate] = useState<string | undefined>();
  const [initialDialogTime, setInitialDialogTime] = useState<string | undefined>();

  // Verificar autenticação via JWT
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (res.ok) {
            return res.json().then(data => {
              setIsAuthenticated(true);
              setAuthToken(token);
              if (data.user?.email) setUserEmail(data.user.email);
            });
          } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_authenticated');
          }
        })
        .catch(() => {
          setIsAuthenticated(true);
          setAuthToken(token);
        });
    }
  }, []);

  const handleLogin = useCallback((token?: string, email?: string) => {
    if (token) {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_authenticated', 'true');
      setAuthToken(token);
    }
    if (email) setUserEmail(email);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setAuthToken('');
    setUserEmail('');
    setActiveMenu('agendamentos');
  };

  // Carregar agendamentos quando autenticar
  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await fetch('/api/agendamentos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const appointmentsData = (data.agendamentos || []).map((ag: any) => ({
          ...ag,
          status: ag.status || 'pending',
        }));
        setAppointments(appointmentsData);
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authToken]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateAppointment = async (appointmentId: string, newTime: string) => {
    const previousAppointments = [...appointments];
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, hora: newTime }
          : apt
      )
    );

    try {
      const response = await fetch(`/api/agendamentos/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ hora: newTime }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar horário');
      }

      toast.success(`Agendamento movido para ${newTime} ✓`);
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      setAppointments(previousAppointments);
      toast.error('Erro ao atualizar horário. Tente novamente.');
    }
  };

  const handleSwapAppointments = async (appointment1Id: string, appointment2Id: string) => {
    const apt1 = appointments.find(a => a.id === appointment1Id);
    const apt2 = appointments.find(a => a.id === appointment2Id);

    if (!apt1 || !apt2) return;

    const previousAppointments = [...appointments];

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
      const responses = await Promise.all([
        fetch(`/api/agendamentos/${appointment1Id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ hora: apt2.hora }),
        }),
        fetch(`/api/agendamentos/${appointment2Id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ hora: apt1.hora }),
        })
      ]);

      if (!responses.every(r => r.ok)) {
        throw new Error('Falha ao trocar horários');
      }

      toast.success(`Agendamentos trocados: ${apt1.hora} ↔️ ${apt2.hora}`);
    } catch (error) {
      console.error('Erro ao trocar horários:', error);
      setAppointments(previousAppointments);
      toast.error('Erro ao trocar horários. Tente novamente.');
    }
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      if (editingAppointment) {
        setAppointments(prev =>
          prev.map(apt => apt.id === appointment.id ? appointment : apt)
        );

        const response = await fetch(`/api/agendamentos/${appointment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(appointment),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar agendamento');
        }

        toast.success('Agendamento atualizado com sucesso');
      } else {
        const newAppointment: Appointment = {
          ...appointment,
          id: `temp-${Date.now()}`,
          status: 'pending' as const,
        };

        setAppointments(prev => [...prev, newAppointment]);

        try {
          const response = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(appointment),
          });

          if (response.ok) {
            const data = await response.json();
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
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      const statusMessages: Record<string, string> = {
        confirmed: 'Agendamento confirmado ✅',
        completed: 'Agendamento concluído ✓✓',
        cancelled: 'Agendamento cancelado ❌',
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

    return filtered.filter((apt: Appointment) => apt.data === dateStr);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard token={authToken} />;
      case 'clientes':
        return <ClientsPanel token={authToken} />;
      case 'gestao-servicos':
        return <ServicesManagement token={authToken} />;
      case 'servicos-fotos':
        return <ServicesPhotosPanel token={authToken} />;
      case 'gestao-produtos':
        return <ProductsManagement token={authToken} />;
      case 'configuracoes':
        return <SettingsPanel token={authToken} />;
      case 'testemunhos':
        return <TestimonialsManagement token={authToken} />;
      case 'registos':
        return <AuditLogPanel token={authToken} />;
      case 'agendamentos':
      default:
        return (
          <>
            <Header
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onNewAppointment={handleNewAppointment}
              onSearch={setSearchQuery}
              onRefresh={fetchAppointments}
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
          </>
        );
    }
  };

  const showHeader = activeMenu === 'agendamentos';

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          onLogout={handleLogout}
          onMenuChange={setActiveMenu}
          activeItem={activeMenu}
          userEmail={userEmail}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        onLogout={handleLogout}
        onMenuChange={setActiveMenu}
        activeItem={activeMenu}
        userEmail={userEmail}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader ? (
          renderContent()
        ) : (
          <main className="flex-1 overflow-auto bg-gray-50">
            {renderContent()}
          </main>
        )}
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
