'use client';

import { Calendar, Users, Settings, LayoutDashboard, LogOut, Image, MessageSquare, Download, FileText, Scissors, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  onLogout?: () => void;
  onMenuChange?: (menuId: string) => void;
  activeItem?: string;
  userEmail?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'gestao-servicos', label: 'Serviços', icon: Scissors },
  { id: 'servicos-fotos', label: 'Fotos Serviços', icon: Image },
  { id: 'gestao-produtos', label: 'Produtos', icon: Package },
  { id: 'testemunhos', label: 'Testemunhos', icon: MessageSquare },
  { id: 'registos', label: 'Registos', icon: FileText },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar({ className, onLogout, onMenuChange, activeItem = 'agendamentos', userEmail }: SidebarProps) {
  const displayEmail = userEmail || 'admin';
  const initials = displayEmail.substring(0, 2).toUpperCase();
  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  return (
    <aside className={cn("w-64 bg-white border-r border-gray-200 flex flex-col h-screen", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">SP</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Stepodóloga</h1>
            <p className="text-xs text-gray-500">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange?.(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        {/* Export divider */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={handleExport}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm">Exportar CSV</span>
          </button>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayEmail.split('@')[0]}</p>
            <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
