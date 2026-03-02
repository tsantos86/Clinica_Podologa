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

- [ ] Integração completa IFTHENPAY MBWay (Em progresso)
- [x] Banco de dados (Supabase / PostgreSQL)
- [x] Painel administrativo premium
- [x] Sistema de autenticação (Middleware/Supabase)
- [x] Notificações por WhatsApp
- [x] Lembretes automáticos 24h (Vercel Cron)
- [x] Upload de fotos (Supabase Storage)
- [x] Gestão de horários e serviços

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

### Configuração do Domínio e WhatsApp (Meta)

Para que o WhatsApp funcione corretamente em produção, siga estes passos:

#### 1. Vercel (Configuração do Domínio)
1. No painel da **Vercel**, vá em *Settings* > *Domains*.
2. Adicione o seu domínio (ex: `stepodologia.com`).
3. Siga as instruções de DNS fornecidas pela Vercel.

#### 2. Vercel (Variáveis de Ambiente)
Adicione as seguintes chaves no painel da Vercel:
- `WHATSAPP_ACCESS_TOKEN`: Token de acesso permanente gerado no portal Meta.
- `WHATSAPP_PHONE_NUMBER_ID`: ID do número de telefone no portal Meta.
- `WHATSAPP_VERIFY_TOKEN`: Um segredo à sua escolha (ex: `podologa_secret_verify`).
- `WHATSAPP_TEMPLATE_CONFIRMATION`: Nome do template (ex: `agendamento_confirmado`).
- `WHATSAPP_TEMPLATE_REMINDER`: Nome do template (ex: `lembrete_consulta_24h`).
- `CRON_SECRET`: Chave secreta para proteger o endpoint de Cron.
- `NEXT_PUBLIC_BACKEND_URL`: URL do seu backend de pagamentos (se aplicável).

#### 3. Meta Developer Portal (WhatsApp Cloud API)
1. Crie uma App do tipo **Business** no [Meta Developers](https://developers.facebook.com/).
2. Adicione o produto **WhatsApp**.
3. Em *WhatsApp* > *Configuration*:
   - **Callback URL**: `https://seu-dominio.com/api/webhooks/whatsapp`
   - **Verify Token**: O mesmo definido no Vercel (`WHATSAPP_VERIFY_TOKEN`).
4. Clique em **Verify and Save**.
5. Em *Webhook fields*, subscreva o campo **messages**.
6. Em *API Setup*, configure o número de telefone e obtenha o `Phone Number ID`.

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
