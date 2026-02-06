'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function TestagemPage() {
  const [resultados, setResultados] = useState<Array<{
    nome: string;
    status: 'sucesso' | 'erro' | 'pendente';
    mensagem: string;
  }>>([]);
  const [testando, setTestando] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const testar = async () => {
    setTestando(true);
    setResultados([]);

    const testes = [
      {
        nome: 'Conexão com Backend',
        teste: async () => {
          const res = await fetch(`${BACKEND_URL}/api/health`);
          return res.ok;
        },
      },
      {
        nome: 'Listar Agendamentos',
        teste: async () => {
          const res = await fetch(`${BACKEND_URL}/api/agendamentos`);
          return res.ok;
        },
      },
      {
        nome: 'API Route Agendamentos (proxy)',
        teste: async () => {
          const res = await fetch('http://localhost:3000/api/agendamentos');
          return res.ok;
        },
      },
      {
        nome: 'API Route Email (proxy)',
        teste: async () => {
          const res = await fetch('http://localhost:3000/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Teste',
              email: 'teste@test.com',
              subject: 'Teste',
              message: 'Mensagem de teste',
            }),
          });
          return res.status === 400 || res.ok; // 400 é esperado sem campos corretos
        },
      },
    ];

    for (const teste of testes) {
      try {
        const resultado = await Promise.race([
          teste.teste(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]);

        setResultados((prev) => [
          ...prev,
          {
            nome: teste.nome,
            status: resultado ? 'sucesso' : 'erro',
            mensagem: resultado ? '✅ Funcionando' : '❌ Falha',
          },
        ]);
      } catch (err) {
        setResultados((prev) => [
          ...prev,
          {
            nome: teste.nome,
            status: 'erro',
            mensagem: `❌ ${(err as Error).message}`,
          },
        ]);
      }
    }

    setTestando(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            🧪 Testes de Integração
          </h1>
          <p className="text-text-secondary">Verifique se tudo está funcionando</p>
        </div>

        {/* Botão de Teste */}
        <div className="mb-8">
          <button
            onClick={testar}
            disabled={testando}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {testando ? 'Testando...' : 'Executar Testes'}
          </button>
        </div>

        {/* Resultados */}
        {resultados.length > 0 && (
          <div className="space-y-4 mb-12">
            {resultados.map((resultado, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  resultado.status === 'sucesso'
                    ? 'bg-green-50 border-green-500'
                    : resultado.status === 'erro'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {resultado.status === 'sucesso' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {resultado.status === 'erro' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  {resultado.status === 'pendente' && (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">
                      {resultado.nome}
                    </h3>
                    <p className="text-sm text-text-secondary">{resultado.mensagem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instruções */}
        <div className="bg-white rounded-lg shadow-card p-6 space-y-6">
          <h2 className="text-2xl font-bold text-text-primary">📝 Instruções de Teste</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-primary mb-3">
                1️⃣ Testar Agendamento
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary ml-2">
                <li>Volte à página inicial</li>
                <li>Clique em &quot;Marcar a Minha Consulta&quot;</li>
                <li>Selecione um serviço</li>
                <li>Escolha uma data e hora</li>
                <li>Preencha seus dados</li>
                <li>Complete o agendamento</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-3">
                2️⃣ Visualizar Agendamentos
              </h3>
              <p className="text-text-secondary mb-2">
                Acesse o painel admin:
              </p>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Ir para Admin
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-3">
                3️⃣ Enviar Email de Contato
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary ml-2">
                <li>Clique no botão &quot;Enviar Email de Contato&quot;</li>
                <li>Preencha o formulário</li>
                <li>Verifique o console do backend para confirmar</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-3">
                ⚠️ Problemas Conhecidos
              </h3>
              <ul className="list-disc list-inside space-y-2 text-text-secondary ml-2">
                <li>Email está em modo teste (sem SMTP configurado)</li>
                <li>Pagamento MBWay é simulado</li>
                <li>Dados se perdem ao reiniciar o backend</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-3">
                ✅ Próximos Passos
              </h3>
              <ul className="list-disc list-inside space-y-2 text-text-secondary ml-2">
                <li>Configurar SMTP para envio real de emails</li>
                <li>Integrar com MBWay para pagamentos</li>
                <li>Sincronizar com Google Calendar</li>
                <li>Adicionar autenticação admin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <Link
            href="/"
            className="bg-background-light hover:bg-background-dark text-text-primary font-semibold py-2 px-4 rounded-lg border border-primary/40 transition-colors"
          >
            ← Voltar ao Site
          </Link>
          <Link
            href="/admin"
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            → Ir para Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
