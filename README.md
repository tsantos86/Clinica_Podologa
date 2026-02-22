# Stephanie Oliveira - Podologia Premium

Sistema de agendamento online para serviços de podologia, desenvolvido com Next.js, TypeScript, React, Tailwind CSS e Node.js.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com SSR e App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **Framer Motion** - Animações suaves
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar variáveis de ambiente no .env
```

## 🔧 Configuração

Edite o arquivo `.env` com suas credenciais:

```env
# IFTHENPAY Configuration
IFTHENPAY_USER=seu_usuario
IFTHENPAY_PASSWORD=sua_senha
IFTHENPAY_API_KEY=sua_chave_api
IFTHENPAY_MERCHANT_ID=seu_merchant_id

# App Configuration
NEXT_PUBLIC_PHONE_NUMBER=351918182737
NEXT_PUBLIC_EMAIL=stephanie@example.com
NEXT_PUBLIC_INSTAGRAM=stepodologia
```

## 🎨 Adicionar Imagem de Perfil

Coloque sua foto de perfil em:
```
public/perfil.jpg
```

## 🏃‍♂️ Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
stepodologa-nextjs/
├── app/
│   ├── api/              # API Routes (backend)
│   │   ├── agendamentos/ # Gerenciamento de agendamentos
│   │   └── mbway/        # Integração pagamento MBWay
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página inicial
├── components/           # Componentes React
│   ├── AboutModal.tsx
│   ├── BookingModal.tsx  # Modal de agendamento (multi-step)
│   ├── MenuLinks.tsx
│   ├── Modal.tsx         # Componente modal reutilizável
│   ├── PricingModal.tsx
│   ├── PrimaryActionButton.tsx
│   ├── ProfileHeader.tsx
│   ├── ScheduleModal.tsx
│   ├── ServicesModal.tsx
│   └── Testimonials.tsx
├── contexts/             # Contextos React
│   └── ModalContext.tsx
├── lib/                  # Bibliotecas e utilitários
│   └── services.ts       # Dados dos serviços
├── types/                # Tipos TypeScript
│   └── index.ts
├── public/               # Arquivos estáticos
│   └── perfil.jpg        # Foto de perfil
└── ...configs            # Arquivos de configuração
```

## ✨ Funcionalidades

### ✅ Implementadas

- [x] Layout responsivo estilo Linktree
- [x] Perfil com foto e redes sociais
- [x] Menu com links para seções
- [x] Modal de serviços com categorias
- [x] Modal de preçário completo
- [x] Modal de horários
- [x] Modal sobre profissional
- [x] Sistema de depoimentos interativo
- [x] Modal de agendamento multi-step:
  - Seleção de serviço
  - Escolha de data e horário
  - Formulário de dados pessoais
  - Opções de pagamento (sinal/total)
- [x] API routes para backend
- [x] Animações com Framer Motion
- [x] Design system com Tailwind

### 🔄 A Implementar

- [ ] Integração completa IFTHENPAY MBWay
- [ ] Banco de dados (Prisma + PostgreSQL/MongoDB)
- [ ] Painel administrativo
- [ ] Sistema de autenticação
- [ ] Notificações por email/SMS
- [ ] Upload de fotos
- [ ] Calendário interativo avançado
- [ ] Gestão de horários disponíveis
- [ ] Relatórios e estatísticas

## 🎨 Personalização

### Cores

Edite as cores em `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#c9a3ad',  // Sua cor principal
    dark: '#b48f99',
    light: '#e3c1cc',
  },
  // ...
}
```

### Serviços

Adicione/edite serviços em `lib/services.ts`:

```typescript
{
  id: 'novo-servico',
  name: 'Nome do Serviço',
  description: 'Descrição...',
  price: 30,
  icon: '🦶',
  category: 'Principais Serviços',
}
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Outras Plataformas

O projeto é compatível com:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway
- Render

## 📝 Migração do Projeto Antigo

Este projeto é uma migração completa do sistema anterior para tecnologias modernas:

**Antes:**
- HTML, CSS, JavaScript vanilla
- Express.js backend separado
- Flatpickr para calendário

**Depois:**
- Next.js com App Router
- TypeScript para type safety
- Tailwind CSS para estilos
- Framer Motion para animações
- API Routes integradas
- Componentes React reutilizáveis

## 🤝 Contribuir

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fork o projeto
2. Criar uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abrir um Pull Request

## 📄 Licença

Este projeto é privado e pertence a Stephanie Oliveira Podologia.

## 📧 Contato

- **Tel:** +351 934 504 542
- **Instagram:** @stepodologia
- **Email:** steoliveira@gmail.com

---

Desenvolvido com ❤️ para Stephanie Oliveira Podologia
