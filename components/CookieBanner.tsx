'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'stepodologa-cookie-consent';

type ConsentStatus = 'accepted' | 'rejected' | null;

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so the banner doesn't flash on load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status || 'rejected');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  🍪 Este site utiliza cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento do site e para melhorar a sua experiência.
                  Ao continuar a navegar, concorda com a nossa{' '}
                  <Link href="/privacidade" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
                    Política de Privacidade
                  </Link>.
                </p>

                {/* Details toggle */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">Cookies Essenciais</p>
                            <p className="text-green-700 mt-0.5">
                              Necessários para o funcionamento do site (sessão, autenticação, preferências).
                              Não podem ser desativados.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Cookie className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Cookies de Análise</p>
                            <p className="text-gray-600 mt-0.5">
                              Atualmente não utilizamos cookies de rastreamento ou análise de terceiros.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close button */}
              <button
                onClick={() => handleConsent('rejected')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Fechar aviso de cookies"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2 order-3 sm:order-1 py-1"
              >
                {showDetails ? 'Menos detalhes' : 'Mais detalhes'}
              </button>
              <div className="flex-1 hidden sm:block order-2" />
              <button
                onClick={() => handleConsent('rejected')}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors order-2 sm:order-3"
              >
                Apenas essenciais
              </button>
              <button
                onClick={() => handleConsent('accepted')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg order-1 sm:order-4"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
