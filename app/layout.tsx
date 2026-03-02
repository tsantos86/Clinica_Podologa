import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import CookieBanner from "@/components/CookieBanner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.steoliveirapodologa.pt'),
  title: {
    default: "Stephanie Oliveira | Podóloga na Amora, Seixal - Saúde dos Pés",
    template: "%s | Stephanie Oliveira Podologia"
  },
  description: "Tratamento especializado de podologia na Amora, Seixal. Especialista em unhas encravadas, fungos, calosidades e pedicure medical. Agende já a sua consulta online com a Stephanie Oliveira!",
  keywords: [
    "podologia amora",
    "podóloga seixal",
    "podologista amora seixal",
    "tratamento pés amora",
    "unhas encravadas seixal",
    "fungos unhas tratamento",
    "pedicure medical amora",
    "stephanie oliveira podologia",
    "saúde dos pés portugal",
    "calosidades tratamento"
  ],
  authors: [{ name: "Stephanie Oliveira" }],
  creator: "Stephanie Oliveira",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://www.steoliveirapodologa.pt",
    title: "Stephanie Oliveira | Podologia Profissional na Amora, Seixal",
    description: "Cuide da saúde dos seus pés com quem entende. Agendamento online simples e rápido para consultas na Amora.",
    siteName: "Stephanie Oliveira Podologia",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stephanie Oliveira Podologia Amora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stephanie Oliveira | Podóloga em Amora",
    description: "Saúde dos pés com excelência. Agende online na Amora, Seixal!",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>

        <Toaster position="top-right" richColors />
        <CookieBanner />
      </body>
    </html>
  );
}
