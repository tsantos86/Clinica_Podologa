'use client';

import { Service } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface ServiceCardProps {
  service: Service;
  photoUrl?: string;
  index?: number;
}

export default function ServiceCard({
  service,
  photoUrl,
  index = 0,
}: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePhotoError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div className="card overflow-hidden bg-background-light/60 border border-border/60 rounded-card flex flex-col h-full hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-background-light to-white">
          {photoUrl && !imageError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 animate-pulse bg-background-light/40" />
              )}
              <Image
                src={photoUrl}
                alt={service.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onLoad={handleImageLoad}
                onError={handlePhotoError}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-5xl">{service.icon}</div>
            </div>
          )}



          {/* Badge */}
          {service.badge && (
            <div className="absolute top-2 right-2">
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-primary/90 text-white">
                {service.badge === 'popular' ? '⭐ Popular' : '👑 Premium'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title and Description */}
          <div className="flex-1">
            <h4 className="font-bold text-base text-text-primary leading-tight mb-2 line-clamp-2">
              {service.name}
            </h4>
            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
              {service.description}
            </p>
          </div>

          {/* Info Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex flex-col">
              {service.duration && (
                <span className="text-xs text-text-light">⏱️ {service.duration}</span>
              )}
              {service.details && service.details.length > 0 && (
                <span className="text-xs text-text-light">📋 {service.details.length} passos</span>
              )}
            </div>
            <span className="text-lg font-bold text-primary">{service.price}€</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
