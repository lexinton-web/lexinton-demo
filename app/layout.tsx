import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SocialFollowBar } from '@/components/ui/SocialFollowBar'
import MobileSticky from '@/components/MobileSticky'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { CliengoScript } from '@/components/CliengoScript'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lexinton Propiedades — Especialistas en operaciones inmobiliarias en Palermo',
  description:
    'Coordinamos venta, compra y tasación con una estrategia clara, tiempos sincronizados y acompañamiento experto. 20 años de trayectoria en CABA y zona norte.',
  keywords: [
    'inmobiliaria palermo',
    'operaciones simultáneas',
    'vender para comprar Buenos Aires',
    'tasación inmueble CABA',
    'Lexinton Propiedades',
  ].join(', '),
  authors: [{ name: 'Lexinton Propiedades' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Lexinton Propiedades — Especialistas en operaciones inmobiliarias',
    description:
      'Coordinamos venta, compra y tasación con estrategia clara y tiempos sincronizados. Palermo y zona norte.',
    url: 'https://lexinton.com.ar',
    siteName: 'Lexinton Propiedades',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <head>
        {/* DNS / TCP preconnect para recursos críticos externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://static.tokkobroker.com" />
        <link rel="dns-prefetch" href="https://static.tokkobroker.com" />
        <link rel="preconnect" href="https://s.cliengo.com" />
        <link rel="dns-prefetch" href="https://s.cliengo.com" />
      </head>
      <body className="font-sans antialiased bg-lx-cream text-lx-ink">
        <Navbar />
        {children}
        <SocialFollowBar />
        <Footer />
        <MobileSticky />
        <WhatsAppButton />
        <CliengoScript />
      </body>
    </html>
  )
}
