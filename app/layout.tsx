import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SocialFollowBar } from '@/components/ui/SocialFollowBar'
import MobileSticky from '@/components/MobileSticky'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { CliengoScript } from '@/components/CliengoScript'
import { DEFAULT_OG_IMAGE, HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL } from '@/lib/site'

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
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  // Defaults para redes sin url: el canonical y og:url los define cada página
  // (ver lib/seo.ts), así ninguna hereda los del home.
  openGraph: {
    siteName: SITE_NAME,
    locale: 'es_AR',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE.url],
  },
  keywords: [
    'inmobiliaria palermo',
    'operaciones simultáneas',
    'vender para comprar Buenos Aires',
    'tasación inmueble CABA',
    'Lexinton Propiedades',
  ].join(', '),
  authors: [{ name: SITE_NAME }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
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
