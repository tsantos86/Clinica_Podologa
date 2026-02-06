# 🔧 Troubleshooting - Painel Admin

## Problemas Comuns e Soluções

### ❌ Cards não aparecem

**Causa:** Backend não está rodando ou não retorna dados

**Solução implementada:**
- ✅ Agora carrega dados de exemplo automaticamente
- ✅ Funciona sem backend (salvamento local)
- ✅ Toast informa quando dados de exemplo são carregados

**Para testar:**
1. Faça login no painel
2. Aguarde 1-2 segundos
3. Verá 2 agendamentos de exemplo
4. Crie novos agendamentos normalmente

---

### ❌ Novo agendamento não faz nada

**Causa:** Backend não disponível para POST

**Solução implementada:**
- ✅ Agendamento é criado localmente primeiro
- ✅ Toast de sucesso aparece imediatamente
- ✅ Tenta salvar no backend em background
- ✅ Se backend falhar, continua funcionando localmente

**Como funciona agora:**
1. Clique em "Novo Agendamento"
2. Preencha o formulário
3. Clique em "Criar Agendamento"
4. ✅ Aparece toast verde de sucesso
5. ✅ Card aparece no board imediatamente

---

### ❌ Drag & Drop não salva

**Causa:** Backend PATCH não implementado

**Comportamento atual:**
- ✅ Move visualmente no board
- ✅ Mostra toast de sucesso
- ⚠️ Não persiste ao recarregar página (dados locais)

**Solução futura:**
Implementar endpoint PATCH no backend Express

---

### ❌ Ao recarregar, perde dados

**Causa:** Dados salvos apenas no state React

**Soluções:**

**Opção 1 - localStorage (temporário):**
```javascript
// Salvar ao criar/editar
localStorage.setItem('appointments', JSON.stringify(appointments));

// Carregar ao iniciar
const saved = localStorage.getItem('appointments');
if (saved) setAppointments(JSON.parse(saved));
```

**Opção 2 - Backend funcionando:**
- Certifique-se que o backend Express está rodando
- URL: `http://localhost:3001`
- Endpoints necessários: GET, POST, PUT, PATCH, DELETE

---

### ✅ Backend Express - Como Iniciar

**Se você tem o backend:**

```bash
cd caminho/do/backend
npm install
npm start
```

**Endpoints necessários:**

```javascript
GET    /api/agendamentos          // Listar todos
POST   /api/agendamentos          // Criar novo
GET    /api/agendamentos/:id      // Ver um
PUT    /api/agendamentos/:id      // Atualizar completo
PATCH  /api/agendamentos/:id      // Atualizar parcial (data, status)
DELETE /api/agendamentos/:id      // Deletar
```

**Configuração:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

### 🔍 Debug Mode

**Ver requisições no console:**

Abra DevTools (F12) → Console

Você verá:
- ✅ Requisições HTTP
- ✅ Respostas da API
- ✅ Erros de conexão
- ✅ "Backend não disponível, salvando apenas localmente"

---

### 📊 Verificar se Backend está funcionando

**Teste manual:**

1. Abra navegador em: `http://localhost:3001/api/agendamentos`
2. Deve retornar JSON com agendamentos

**Se retornar erro 404:**
- Backend não está rodando
- URL incorreta no .env

**Se retornar CORS error:**
- Backend precisa permitir origem Next.js
```javascript
// No backend Express
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

---

### 🎯 Modo Atual: Standalone

O painel admin agora funciona **standalone** (sem backend):

✅ **Funciona:**
- Login/Logout
- Criar agendamentos
- Editar agendamentos
- Deletar agendamentos
- Drag & drop visual
- Busca e filtros
- Mudança de status
- Notificações toast

⚠️ **Limitações:**
- Dados resetam ao recarregar página
- Não sincroniza entre abas/dispositivos
- Não envia emails/SMS

---

### 💡 Próximos Passos Recomendados

**Para produção real:**

1. **Implementar localStorage** (curto prazo)
   - Persistência temporária
   - Fácil de implementar

2. **Backend completo** (médio prazo)
   - Banco de dados real
   - Autenticação segura
   - APIs RESTful

3. **Notificações** (longo prazo)
   - Email ao criar agendamento
   - SMS lembretes
   - WhatsApp integração

---

### 🆘 Precisa de Ajuda?

**Verifique:**
1. Console do navegador (F12)
2. Terminal do Next.js (erros de compilação)
3. Terminal do backend (se estiver rodando)

**Logs úteis:**
```javascript
// No app/admin/page.tsx
console.log('Appointments:', appointments);
console.log('Loading:', loading);
console.log('Error:', error);
```

**Reset completo:**
```bash
# Limpar cache Next.js
rm -rf .next
npm run dev

# Limpar localStorage
# No console do navegador (F12):
localStorage.clear()
```
