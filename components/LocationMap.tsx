'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Rua+Luz+Soriano+20+Centro+Comercial+Girassol+2845-120+Amora';

const LocationMap = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="mb-8"
        >
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-primary">Localização</h2>
            </div>

            {/* Map Card */}
            <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-card hover:shadow-card-hover transition-all duration-300 bg-background-light">
                {/* Embedded Google Map */}
                <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group cursor-pointer"
                >
                    <div className="relative w-full h-[200px] sm:h-[240px] overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3117.8!2d-9.1165!3d38.6281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19373d3a8e1e3d%3A0x0!2sRua+Luz+Soriano+20%2C+2845-120+Amora!5e0!3m2!1spt-PT!2spt!4v1"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="pointer-events-none"
                            title="Localização - Stephanie Oliveira Podologia"
                        />
                        {/* Overlay for click */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300" />

                        {/* Open in Maps button overlay */}
                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Abrir no Google Maps</span>
                        </div>
                    </div>
                </a>

                {/* Address Info */}
                <div className="p-4 sm:p-5">
                    <a
                        href={GOOGLE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors">
                                    Centro Comercial Girassol
                                </p>
                                <p className="text-text-light text-xs mt-1 leading-relaxed">
                                    Rua Luz Soriano, nº 20, Loja 16
                                </p>
                                <p className="text-text-light text-xs">
                                    2845-120 Amora
                                </p>
                            </div>
                            <svg
                                className="w-5 h-5 text-text-light flex-shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </a>

                    {/* Divider */}
                    <div className="border-t border-gray-100/80 my-3" />

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="tel:+351934504542"
                            className="flex items-center gap-2 text-xs text-text-light hover:text-primary transition-colors group"
                        >
                            <Phone className="w-3.5 h-3.5 group-hover:text-primary" />
                            <span>934 504 542</span>
                        </a>
                        <div className="flex items-center gap-2 text-xs text-text-light">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Seg-Sáb · 8:30-18:30</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default LocationMap;
