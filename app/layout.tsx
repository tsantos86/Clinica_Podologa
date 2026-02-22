import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://stepodologia.com'),
  title: {
    default: "Stephanie Oliveira | Podologia Profissional",
    template: "%s | Stephanie Oliveira Podologia"
  },
  description: "Serviços profissionais de podologia em Portugal. Especialista em saúde dos pés e pedicure medical. Agende já o seu horário online!",
  keywords: ["podologia", "podóloga em portugal", "saúde dos pés", "tratamento de fungos", "unhas encravadas", "pedicure medical", "stephanie oliveira"],
  authors: [{ name: "Stephanie Oliveira" }],
  creator: "Stephanie Oliveira",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://stepodologia.com",
    title: "Stephanie Oliveira | Podologia Profissional",
    description: "Cuide da saúde dos seus pés com quem entende. Agendamento online simples e rápido.",
    siteName: "Stephanie Oliveira Podologia",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stephanie Oliveira Podologia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stephanie Oliveira | Podologia Profissional",
    description: "Saúde dos pés com excelência. Agende online!",
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
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
        <CookieBanner />
      </body>
    </html>
  );
}
