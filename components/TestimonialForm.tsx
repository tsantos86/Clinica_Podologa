'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle, Loader2, X, MessageSquare } from 'lucide-react';

interface TestimonialFormProps {
    onClose?: () => void;
}

export default function TestimonialForm({ onClose }: TestimonialFormProps) {
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (name.trim().length < 2) {
            setError('Por favor, insira o seu nome (mínimo 2 caracteres).');
            return;
        }

        if (text.trim().length < 10) {
            setError('Por favor, escreva um depoimento mais detalhado (mínimo 10 caracteres).');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), text: text.trim(), rating }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erro ao enviar. Tente novamente.');
                return;
            }

            setSuccess(true);
        } catch {
            setError('Erro de conexão. Verifique a sua internet e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 text-center space-y-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900">Obrigado pelo seu testemunho! 💜</h3>
                <p className="text-gray-600 text-sm">
                    O seu depoimento será publicado após aprovação. Agradecemos a sua confiança!
                </p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-medium"
                    >
                        Fechar
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-white" />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Deixe o seu testemunho</h3>
                        <p className="text-purple-200 text-xs mt-0.5">A sua opinião é muito importante para nós</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors p-1"
                        aria-label="Fechar formulário"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Star Rating */}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Como avalia a sua experiência?
                    </label>
                    <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {rating === 5 && 'Excelente! ⭐'}
                        {rating === 4 && 'Muito bom!'}
                        {rating === 3 && 'Bom'}
                        {rating === 2 && 'Razoável'}
                        {rating === 1 && 'Fraco'}
                    </p>
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="testimonial-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        O seu nome
                    </label>
                    <input
                        id="testimonial-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Maria Silva"
                        maxLength={100}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>

                {/* Testimonial Text */}
                <div>
                    <label htmlFor="testimonial-text" className="block text-sm font-medium text-gray-700 mb-1.5">
                        O seu depoimento
                    </label>
                    <textarea
                        id="testimonial-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Conte-nos sobre a sua experiência com os nossos serviços..."
                        maxLength={1000}
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {text.length}/1000 caracteres
                    </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                        >
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            A enviar...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Enviar Testemunho
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                    O seu testemunho será publicado após aprovação. Não partilhamos os seus dados com terceiros.
                </p>
            </form>
        </motion.div>
    );
}
