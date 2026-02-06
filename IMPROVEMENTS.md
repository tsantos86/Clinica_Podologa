# 🦶 Stephanie Oliveira - Podologia Profissional

Plataforma moderna de agendamento online para serviços de podologia, com painel administrativo completo.

## ✨ Melhorias Recentes (Refatoração Humanizada)

### 🎯 Código Mais Limpo e Organizado

#### 1. **Constantes Centralizadas** (`lib/constants.ts`)
- Todas as strings, mensagens e configurações em um único lugar
- Mensagens humanizadas e amigáveis em português
- Fácil manutenção e tradução

#### 2. **Utilitários de Formatação** (`lib/formatters.ts`)
- Formatação consistente de datas, moeda, telefones
- Validações reutilizáveis
- Suporte completo ao português de Portugal

#### 3. **Camada de Serviço API** (`lib/api.ts`)
- Abstração de todas as chamadas HTTP
- Tratamento centralizado de erros
- Retry automático para requisições falhadas
- Tipos TypeScript para todas as respostas

#### 4. **Hooks Customizados** (`hooks/`)
- `useAuth` - Gerenciamento de autenticação
- `useAppointments` - CRUD de agendamentos com optimistic updates
- `useBookingSettings` - Controle de disponibilidade mensal
- `useWorkingDays` - Validação de dias úteis
- `useDebounce` - Debouncing de inputs
- `useIsMobile` - Detecção de dispositivos móveis

#### 5. **Error Boundary** (`components/ErrorBoundary.tsx`)
- Captura erros em toda a aplicação
- UI amigável em caso de falhas
- Logs detalhados em desenvolvimento
- Opções de recuperação para o usuário

### 💬 Mensagens Mais Humanas

**Antes:**
```
alert("Erro ao criar agendamento");
```

**Agora:**
```typescript
toast.success('Agendamento realizado com sucesso! Entraremos em contacto em breve.');
toast.error('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
toast.loading('🚀 A processar o seu agendamento...');
```

### ✅ Validações Amigáveis

- Mensagens claras e objetivas
- Ícones visuais (✅ ❌ ⚠️ 📞 ✉️)
- Feedback em tempo real
- Sugestões de correção

## 🏗️ Estrutura do Projeto

```
stepodologa-nextjs/
├── app/                      # Rotas Next.js
│   ├── admin/               # Painel administrativo
│   ├── api/                 # Endpoints da API
│   │   ├── agendamentos/   # CRUD de agendamentos
│   │   ├── settings/       # Configurações mensais
│   │   ├── email/          # Envio de emails
│   │   └── mbway/          # Pagamentos MB WAY
│   └── layout.tsx          # Layout com ErrorBoundary
│
├── components/              # Componentes React
│   ├── admin/              # Componentes do admin
│   │   ├── Header.tsx
│   │   ├── DaySchedule.tsx
│   │   ├── MonthlyScheduleDialog.tsx
│   │   └── ...
│   ├── BookingModal.tsx    # Modal de agendamento (refatorado)
│   ├── ErrorBoundary.tsx   # Tratamento de erros
│   └── ...
│
├── hooks/                   # Hooks customizados
│   ├── useCustomHooks.ts   # Todos os hooks
│   └── index.ts            # Exportações
│
├── lib/                     # Utilitários e configurações
│   ├── constants.ts        # ⭐ Constantes centralizadas
│   ├── formatters.ts       # ⭐ Funções de formatação
│   ├── api.ts              # ⭐ Serviços de API
│   └── services.ts         # Dados de serviços
│
├── contexts/                # Contextos React
│   └── ModalContext.tsx    # Gerenciamento de modais
│
└── types/                   # Tipos TypeScript
    └── index.ts            # Definições de tipos
```

## 🎨 Recursos Principais

### Para Clientes

- ✅ **Agendamento Online** - 3 passos simples e intuitivos
- ✅ **Escolha de Serviços** - 8+ tratamentos especializados
- ✅ **Seleção de Data/Hora** - Calendário interativo com horários disponíveis
- ✅ **Validações Inteligentes** - Bloqueia quintas e domingos automaticamente
- ✅ **Upload de Foto** - Envie foto do pé (opcional)
- ✅ **Pagamento MB WAY** - Integração para sinal ou pagamento total
- ✅ **Feedback em Tempo Real** - Toasts amigáveis e informativos

### Para Administração

- ✅ **Painel Moderno** - Interface limpa e profissional
- ✅ **Agenda Diária** - Timeline com slots de 30 minutos (08:30-19:00)
- ✅ **Drag & Drop** - Arraste agendamentos para reorganizar
- ✅ **Gestão Mensal** - Abra/feche meses inteiros com um clique
- ✅ **Busca e Filtros** - Encontre agendamentos rapidamente
- ✅ **Mobile First** - Totalmente responsivo para uso no celular
- ✅ **Confirmações** - Diálogos claros antes de ações críticas

## 🚀 Como Executar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Acessar
http://localhost:3000       # Página pública
http://localhost:3000/admin # Painel admin
```

### Credenciais de Admin

```
Email: admin@stepodologa.pt
Senha: admin123
```

### Build para Produção

```bash
# Criar build otimizado
npm run build

# Executar build
npm start
```

## 📦 Tecnologias

- **Framework**: Next.js 15.5 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Animações**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Notificações**: Sonner (toasts)
- **Ícones**: Lucide React
- **Validações**: Validações customizadas humanizadas

## 🎯 Boas Práticas Implementadas

### 1. **Separation of Concerns**
- Componentes focados em UI
- Hooks para lógica de negócio
- Serviços para comunicação com API
- Utilitários para funções auxiliares

### 2. **DRY (Don't Repeat Yourself)**
- Constantes centralizadas
- Formatadores reutilizáveis
- Hooks compartilhados

### 3. **Type Safety**
- TypeScript em 100% do código
- Tipos explícitos para todas as funções
- Interfaces bem definidas

### 4. **Error Handling**
- Error Boundary para erros de React
- Try/catch em todas as chamadas API
- Rollback em operações otimistas
- Mensagens amigáveis para usuários

### 5. **User Experience**
- Optimistic updates para feedback instantâneo
- Loading states em todas as operações
- Validações em tempo real
- Mensagens claras e objetivas

### 6. **Performance**
- Memoização com useMemo e useCallback
- Lazy loading de componentes
- Debouncing em buscas
- Optimistic updates

### 7. **Accessibility**
- Mensagens descritivas
- Navegação por teclado
- Cores contrastantes
- Feedback visual e textual

## 🌍 Internacionalização

Todo o projeto está em **Português de Portugal**:
- Datas formatadas (ex: "4 de fevereiro de 2026")
- Moeda em euros (€)
- Telefones portugueses (+351)
- Mensagens e validações em PT-PT

## 📝 Exemplos de Uso

### Usando os Hooks Customizados

```typescript
import { useAppointments, useAuth } from '@/hooks';

function AdminPanel() {
  const { isAuthenticated, login, logout } = useAuth();
  const { 
    appointments, 
    loading, 
    createAppointment,
    updateAppointment 
  } = useAppointments(true);

  // Criar agendamento
  await createAppointment({
    nome: 'Maria Silva',
    telefone: '912345678',
    // ...
  });

  // Atualizar horário (com optimistic update)
  await updateAppointment('id-123', { hora: '10:30' });
}
```

### Usando os Formatadores

```typescript
import { formatDateLong, formatCurrency, formatPhone } from '@/lib/formatters';

formatDateLong(new Date());           // "4 de fevereiro de 2026"
formatCurrency(30);                   // "€30,00"
formatPhone('912345678');             // "912 345 678"
```

### Usando os Serviços de API

```typescript
import { AppointmentService, SettingsService } from '@/lib/api';

// Buscar agendamentos
const data = await AppointmentService.getAll('2026-02-04');

// Atualizar configurações
await SettingsService.update('2026-02', true);
```

## 🔒 Segurança

- Validação de inputs no cliente e servidor
- Sanitização de dados
- Proteção contra injeção
- Credenciais em variáveis de ambiente (produção)

## 🐛 Debugging

### Logs Informativos

Todos os serviços incluem logs estruturados:

```typescript
console.log('✅ Agendamento criado:', appointment);
console.error('❌ Erro ao buscar horários:', error);
console.info('ℹ️ Modo demo ativado');
```

### Error Boundary

Em desenvolvimento, mostra detalhes técnicos:
- Stack trace completo
- Component stack
- Estado antes do erro

## 📈 Próximos Passos Sugeridos

- [ ] Persistência de dados (substituir in-memory por BD)
- [ ] Sistema de notificações (SMS/Email)
- [ ] Relatórios e estatísticas
- [ ] Exportação de dados (PDF/Excel)
- [ ] Multi-idioma (PT-PT, EN, etc.)
- [ ] Integração com calendário (Google Calendar, etc.)
- [ ] Histórico de alterações
- [ ] Sistema de avaliações

## 🤝 Contribuindo

Este projeto foi refatorado com foco em:
- Código limpo e manutenível
- Mensagens humanizadas
- Experiência do usuário
- Boas práticas de desenvolvimento

## 📄 Licença

Todos os direitos reservados © 2026 Stephanie Oliveira

---

**Desenvolvido com ❤️ e muito cuidado para proporcionar a melhor experiência**
