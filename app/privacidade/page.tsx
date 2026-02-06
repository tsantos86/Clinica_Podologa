import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Stephanie Oliveira Podologia",
  description: "Política de Privacidade e proteção de dados pessoais",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-custom max-w-4xl">
        <Link 
          href="/" 
          className="inline-block mb-6 text-primary hover:underline"
        >
          ← Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold text-text-primary mb-6">
          Política de Privacidade
        </h1>

        <div className="bg-white rounded-card shadow-card p-8 space-y-6 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              1. Informações que Recolhemos
            </h2>
            <p>
              Ao utilizar o nosso serviço de agendamento online, recolhemos as seguintes informações:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Nome completo</li>
              <li>Endereço de email</li>
              <li>Número de telefone</li>
              <li>Informações sobre o serviço agendado</li>
              <li>Data e hora da consulta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              2. Como Utilizamos as Suas Informações
            </h2>
            <p>
              As suas informações pessoais são utilizadas exclusivamente para:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Processar e confirmar agendamentos</li>
              <li>Entrar em contacto sobre a sua consulta</li>
              <li>Enviar lembretes de consulta</li>
              <li>Melhorar os nossos serviços</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              3. Proteção de Dados
            </h2>
            <p>
              Comprometemo-nos a proteger as suas informações pessoais. Implementamos medidas de segurança 
              técnicas e organizacionais adequadas para proteger os seus dados contra acesso não autorizado, 
              alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              4. Partilha de Informações
            </h2>
            <p>
              Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros para fins 
              de marketing. As suas informações podem ser partilhadas apenas quando:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Necessário para processar pagamentos (via MB WAY)</li>
              <li>Exigido por lei</li>
              <li>Com o seu consentimento explícito</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              5. Os Seus Direitos (RGPD)
            </h2>
            <p>
              De acordo com o Regulamento Geral de Proteção de Dados (RGPD), tem os seguintes direitos:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Direito de acesso:</strong> Pode solicitar cópias dos seus dados pessoais</li>
              <li><strong>Direito de retificação:</strong> Pode solicitar a correção de informações incorretas</li>
              <li><strong>Direito ao apagamento:</strong> Pode solicitar a eliminação dos seus dados</li>
              <li><strong>Direito à portabilidade:</strong> Pode solicitar a transferência dos seus dados</li>
              <li><strong>Direito de oposição:</strong> Pode opor-se ao processamento dos seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              6. Cookies
            </h2>
            <p>
              Este website utiliza cookies essenciais para o seu funcionamento. Não utilizamos cookies 
              de rastreamento ou publicidade sem o seu consentimento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              7. Retenção de Dados
            </h2>
            <p>
              Mantemos as suas informações pessoais apenas pelo tempo necessário para cumprir os 
              propósitos descritos nesta política, a menos que um período de retenção mais longo 
              seja exigido ou permitido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              8. Contacto
            </h2>
            <p>
              Para exercer os seus direitos ou para questões sobre esta Política de Privacidade, 
              entre em contacto connosco:
            </p>
            <ul className="mt-2 space-y-1">
              <li><strong>Email:</strong> stepodologa@gmail.com</li>
              <li><strong>Telefone:</strong> +351 934 504 542</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">
              9. Alterações a Esta Política
            </h2>
            <p>
              Reservamo-nos o direito de atualizar esta Política de Privacidade periodicamente. 
              Recomendamos que reveja esta página regularmente para se manter informado sobre 
              como protegemos as suas informações.
            </p>
            <p className="mt-2">
              <strong>Última atualização:</strong> 1 de fevereiro de 2026
            </p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="btn-primary inline-block"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
