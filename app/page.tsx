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
            <footer className="text-center text-text-light text-sm py-8 mt-12">
              <p>© {new Date().getFullYear()} Stephanie Oliveira - Podologia</p>
              <p className="mt-2">Todos os direitos reservados</p>
              <div className="mt-3">
                <a href="/privacidade" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
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
