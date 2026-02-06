import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Stephanie Oliveira | Podologia Profissional",
  description: "Serviços profissionais de podologia com mais de 10 anos de experiência. Agende sua consulta online! Tratamentos especializados para a saúde dos seus pés.",
  keywords: ["podologia", "podóloga", "cuidados com os pés", "tratamento de unhas", "pedicure medical", "stephanie oliveira", "podologia portugal"],
  authors: [{ name: "Stephanie Oliveira" }],
  creator: "Stephanie Oliveira",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://stepodologia.com",
    title: "Stephanie Oliveira | Podologia Profissional",
    description: "Serviços profissionais de podologia com mais de 10 anos de experiência.",
    siteName: "Stephanie Oliveira Podologia",
    images: [
      {
        url: "/perfil.jpg",
        width: 800,
        height: 800,
        alt: "Stephanie Oliveira - Podóloga",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stephanie Oliveira | Podologia Profissional",
    description: "Serviços profissionais de podologia. Agende sua consulta online!",
    images: ["/perfil.jpg"],
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
      </body>
    </html>
  );
}
