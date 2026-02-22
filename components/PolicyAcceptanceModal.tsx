'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PolicyAcceptanceModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
    signalAmount?: number;
}

const POLICY_IMAGE_PATH = '/politica-agendamento.png';

const PolicyAcceptanceModal: React.FC<PolicyAcceptanceModalProps> = ({
    isOpen,
    onAccept,
    onDecline,
}) => {
    const [imageError, setImageError] = React.useState(false);

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
                        {/* Background */}
                        <div
                            className="relative"
                            style={{
                                background: 'linear-gradient(135deg, #fdf8f4 0%, #f9f0e8 30%, #fdf6f0 60%, #f5ebe3 100%)',
                            }}
                        >
                            {!imageError ? (
                                /* Show the policy image */
                                <div className="relative w-full">
                                    <Image
                                        src={POLICY_IMAGE_PATH}
                                        alt="Política de Agendamento"
                                        width={600}
                                        height={900}
                                        className="w-full h-auto rounded-t-2xl"
                                        onError={() => setImageError(true)}
                                        priority
                                    />
                                </div>
                            ) : (
                                /* Fallback: Show text-based policy */
                                <FallbackPolicy />
                            )}

                            {/* Action Buttons */}
                            <div className="p-6 space-y-3">
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
                                    ❌ Não aceito
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/** Fallback text-based policy when image fails to load */
function FallbackPolicy() {
    return (
        <div className="p-8">
            {/* Decorative elements */}
            <div className="absolute top-4 right-6 text-amber-400/40 text-2xl">✨</div>

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
                    <strong className="text-amber-900">sinal de 10€</strong>
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
            <div className="text-center mb-4">
                <p
                    className="text-xl text-amber-800/70 italic"
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    Stephanie Oliveira
                </p>
            </div>
        </div>
    );
}

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
