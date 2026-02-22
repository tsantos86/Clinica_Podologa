'use client';

import { Menu, X, Calendar, LayoutDashboard, Users, Settings, LogOut, Image, MessageSquare, FileText } from 'lucide-react';
import { useState } from 'react';

interface MobileSidebarProps {
  onLogout: () => void;
  onMenuChange?: (menuId: string) => void;
  activeItem?: string;
  userEmail?: string;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'agendamentos', icon: Calendar, label: 'Agendamentos' },
  { id: 'clientes', icon: Users, label: 'Clientes' },
  { id: 'servicos-fotos', icon: Image, label: 'Serviços & Fotos' },
  { id: 'testemunhos', icon: MessageSquare, label: 'Testemunhos' },
  { id: 'registos', icon: FileText, label: 'Registos' },
  { id: 'configuracoes', icon: Settings, label: 'Configurações' },
];

export function MobileSidebar({ onLogout, onMenuChange, activeItem = 'agendamentos', userEmail }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayEmail = userEmail || 'admin';
  const initials = displayEmail.substring(0, 1).toUpperCase();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onMenuChange?.(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{displayEmail.split('@')[0]}</p>
                <p className="text-xs text-gray-500">{displayEmail}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
