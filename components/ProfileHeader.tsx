'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useModal } from '@/contexts/ModalContext';
import { LucideIcon } from 'lucide-react';

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon | null;
  color: string;
  useImage: boolean;
  imagePath?: string;
  onClick?: string;
}

const ProfileHeader = () => {
  const { openModal } = useModal();

  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/stepodologia/',
      icon: null, // Usaremos imagem ao invés de ícone
      color: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
      useImage: true,
      imagePath: '/instagram-gradient.svg',
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/351934504542',
      icon: null,
      color: '#25D366',
      useImage: true,
      imagePath: '/whatsapp.svg',
    },
    {
      name: 'Email',
      href: '#',
      icon: null,
      color: '#1E88E5',
      useImage: true,
      imagePath: '/email.svg',
      onClick: 'email',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-6 sm:py-8"
    >
      {/* Profile Photo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4 sm:mb-6"
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden shadow-card border-4 border-primary">
          <Image
            src="/perfil.jpg"
            alt="Stephanie Oliveira"
            fill
            className="object-cover"
            priority
          />
        </div>
      </motion.div>

      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Stephanie Oliveira
        </h1>
        <p className="text-base sm:text-lg text-text-secondary mb-4 sm:mb-6">Podóloga Certificada</p>

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.onClick ? '#' : social.href}
              onClick={(e) => {
                if (social.onClick) {
                  e.preventDefault();
                  openModal(social.onClick);
                }
              }}
              target={social.onClick ? undefined : "_blank"}
              rel={social.onClick ? undefined : "noopener noreferrer"}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-card-hover overflow-hidden"
              style={{ background: social.color }}
              title={social.name}
            >
              {social.useImage ? (
                <div className="relative w-8 h-8">
                  <Image
                    src={social.imagePath || '/instagram-gradient.svg'}
                    alt={social.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                social.icon && React.createElement(social.icon, { className: "w-6 h-6 text-white" })
              )}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileHeader;
