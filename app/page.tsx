'use client';

import ProfileHeader from "@/components/ProfileHeader";
import PrimaryActionButton from "@/components/PrimaryActionButton";
import MenuLinks from "@/components/MenuLinks";
import Testimonials from "@/components/Testimonials";
import BookingModal from "@/components/BookingModal";
import ServicesModal from "@/components/ServicesModal";
import PricingModal from "@/components/PricingModal";
import ScheduleModal from "@/components/ScheduleModal";
import AboutModal from "@/components/AboutModal";
import EmailModal from "@/components/EmailModal";
import { ModalProvider } from "@/contexts/ModalContext";

export default function Home() {
  return (
    <ModalProvider>
      <main className="min-h-screen bg-background">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Profile Section */}
            <ProfileHeader />

            {/* Primary CTA */}
            <PrimaryActionButton />

            {/* Menu Links */}
            <MenuLinks />

            {/* Testimonials */}
            <Testimonials />

            {/* Footer */}
            <footer className="text-center text-text-light text-xs sm:text-sm py-12 mt-12 border-t border-gray-100/50">
              <div className="flex flex-col items-center gap-6">
                <div className="space-y-2">
                  <p>© {new Date().getFullYear()} Stephanie Oliveira - Podologia e Esmaltaria</p>
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <span>Todos os direitos reservados</span>
                    <span className="text-gray-300">•</span>
                    <a href="/privacidade" className="hover:text-primary transition-colors underline underline-offset-4 decoration-gray-200">
                      Política de Privacidade
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-8 pb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Design & Development</span>
                  <a
                    href="https://www.instagram.com/tskdigital/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-500">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-xs font-black tracking-tighter text-gray-700 group-hover:text-primary transition-colors duration-300">
                        TSK DIGITAL
                      </span>
                      <span className="text-[9px] font-bold text-primary/60 tracking-wider">PREMIUM STUDIOS</span>
                    </div>
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Modals */}
        <BookingModal />
        <ServicesModal />
        <PricingModal />
        <ScheduleModal />
        <AboutModal />
        <EmailModal />
      </main>
    </ModalProvider>
  );
}
