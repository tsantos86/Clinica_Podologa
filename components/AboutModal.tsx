'use client';

import Modal from './Modal';
import Image from 'next/image';
import { GraduationCap, Heart, MessageCircle, Instagram } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

const AboutModal = () => {
  const { activeModal, closeModal } = useModal();
  const isOpen = activeModal === 'about';

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Sobre Mim" size="md">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-card border-4 border-primary mb-4">
            <Image
              src="/perfil.jpg"
              alt="Stephanie Oliveira"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-2xl font-bold text-text-primary">Stephanie Oliveira</h3>
          <p className="text-primary font-semibold">Podóloga Certificada</p>
        </div>

        <div className="space-y-6">
          <p className="text-text-secondary leading-relaxed">
            Olá! Sou Stephanie Oliveira, podóloga certificada, com mais de 5 anos de experiência em cuidados especializados dos pés.
            Sou apaixonada pela minha profissão e acredito que a saúde dos pés é fundamental para o bem-estar, mobilidade e qualidade de vida. Ao longo da minha trajetória, venho me dedicando constantemente ao aperfeiçoamento técnico e humano, para oferecer sempre o melhor atendimento aos meus pacientes.
            Meu compromisso é proporcionar um serviço seguro, eficaz, confortável e personalizado, respeitando as necessidades individuais de cada pacinte.
          </p>

          <div className="card bg-gradient-to-br from-primary-light to-white">
            <div className="flex items-start gap-3 mb-3">
              <GraduationCap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-text-primary mb-2">Formação</h4>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• 🎓 Formação Profissional</li>
                  <li>• Diploma na área de Podologia</li>
                  <li>• Especialização em Tratamento de Micoses</li>
                  <li>• Formação contínua em novas técnicas e atualizações</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-pink-50 to-white">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-text-primary mb-2">A Minha Filosofia</h4>
                <p className="text-sm text-text-secondary">
                  Acredito que pés saudáveis são a base para uma vida mais ativa, feliz e equilibrada.
                  Por isso, ofereço um atendimento humanizado, cuidadoso e profissional, criando um ambiente acolhedor onde cada paciente se sinta seguro, respeitado e bem cuidado.
                  Cada atendimento é realizado com atenção aos detalhes, ética e dedicação, visando sempre a saúde, o conforto e a satisfação dos meus clientes.
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <h4 className="font-bold text-text-primary mb-3">Contacto</h4>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <a
                  href="https://wa.me/351934504542"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp: +351 934 504 542
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-primary" />
                <a
                  href="https://www.instagram.com/stepodologia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Instagram: @stepodologia
                </a>
              </div>
              <p>
                Agende o seu atendimento e cuide dos seus pes com quem entende e se importa
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
