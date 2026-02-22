'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PolicyAcceptanceModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
    signalAmount?: number;
}

const PolicyAcceptanceModal: React.FC<PolicyAcceptanceModalProps> = ({
    isOpen,
    onAccept,
    onDecline,
    signalAmount = 10,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onDecline}
                    />

                    {/* Modal Card */}
                    <motion.div
                        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Background with elegant design */}
                        <div
                            className="relative p-8"
                            style={{
                                background: 'linear-gradient(135deg, #fdf8f4 0%, #f9f0e8 30%, #fdf6f0 60%, #f5ebe3 100%)',
                            }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-700/30">
                                    <path d="M10,50 Q25,10 50,50 Q75,90 90,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                    <path d="M20,40 Q35,10 50,40 Q65,70 80,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                </svg>
                            </div>
                            <div className="absolute top-4 right-6 text-amber-400/40 text-2xl">✨</div>
                            <div className="absolute bottom-20 right-4 w-24 h-24 opacity-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-700/30">
                                    <path d="M10,50 Q25,10 50,50 Q75,90 90,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                </svg>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-6 relative">
                                <p className="text-amber-500/60 text-sm mb-1">✨</p>
                                <h2
                                    className="text-lg text-amber-900/70 font-light tracking-wide"
                                    style={{ fontFamily: 'serif' }}
                                >
                                    Política de
                                </h2>
                                <h1
                                    className="text-3xl text-amber-900/80 font-semibold -mt-1"
                                    style={{ fontFamily: 'Georgia, serif' }}
                                >
                                    Agendamento
                                </h1>
                                <p className="text-amber-500/60 text-sm mt-1">✨</p>
                            </div>

                            {/* Greeting */}
                            <p
                                className="text-center text-amber-900/70 mb-5 text-lg"
                                style={{ fontFamily: 'Georgia, serif' }}
                            >
                                🌸 Prezados pacientes,
                            </p>

                            {/* Policy Items */}
                            <div className="space-y-4 mb-6">
                                <PolicyItem>
                                    No ato da marcação será solicitado um{' '}
                                    <strong className="text-amber-900">sinal de {signalAmount}€</strong>
                                </PolicyItem>

                                <PolicyItem>
                                    Agende apenas se tiver certeza de que{' '}
                                    <strong className="text-amber-900">poderá comparecer</strong>
                                </PolicyItem>

                                <PolicyItem>
                                    Tolerância máxima de atraso:{' '}
                                    <strong className="text-amber-900">10 minutos</strong>
                                </PolicyItem>

                                <PolicyItem>
                                    Cancelamentos devem ser avisados com{' '}
                                    <strong className="text-amber-900">24h de antecedência</strong>
                                </PolicyItem>

                                <PolicyItem>
                                    Em caso de <strong className="text-amber-900">não comparecimento</strong>,
                                    o sinal não será devolvido
                                </PolicyItem>
                            </div>

                            {/* Thank you message */}
                            <div className="text-center mb-6">
                                <p
                                    className="text-amber-800/60 italic text-sm leading-relaxed"
                                    style={{ fontFamily: 'Georgia, serif' }}
                                >
                                    Agradeço a compreensão e o respeito
                                    <br />
                                    pelo meu trabalho 🤍
                                </p>
                            </div>

                            {/* Signature */}
                            <div className="text-center mb-8">
                                <p
                                    className="text-xl text-amber-800/70 italic"
                                    style={{ fontFamily: 'Georgia, serif' }}
                                >
                                    Stephanie Oliveira
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={onAccept}
                                    className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                    style={{
                                        background: 'linear-gradient(135deg, #b8860b 0%, #d4a843 50%, #c9952e 100%)',
                                    }}
                                >
                                    ✅ Li e aceito a política de agendamento
                                </button>
                                <button
                                    onClick={onDecline}
                                    className="w-full py-3 rounded-xl text-amber-800/60 font-medium text-sm transition-all hover:bg-amber-100/50"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/** Bullet point item */
function PolicyItem({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-700/40 flex-shrink-0" />
            <p
                className="text-amber-900/65 text-[15px] leading-relaxed"
                style={{ fontFamily: 'Georgia, serif' }}
            >
                {children}
            </p>
        </div>
    );
}

export default PolicyAcceptanceModal;
