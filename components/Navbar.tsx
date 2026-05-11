'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LinkedInIcon, InstagramIcon, FacebookIcon, YouTubeIcon } from '@/components/icons/social'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/react'

const navLinks = [
  { label: 'Propiedades', href: '/propiedades', icon: 'solar:home-2-linear' },
  { label: 'Emprendimientos', href: '/emprendimientos', icon: 'solar:buildings-2-linear' },
  { label: 'Inversores', href: '/inversor', icon: 'solar:chart-square-linear' },
  { label: 'Quiero vender', href: '/quiero-vender', icon: 'solar:tag-price-bold' },
  { label: 'Contacto', href: '/contacto', icon: 'solar:phone-linear' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // On interior pages, always show solid navbar
  const dark = !isHome || scrolled || menuOpen

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
        dark ? 'bg-lx-cream border-b border-lx-line' : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src={dark ? '/logos/lexinton-logo-original.svg' : '/logos/lexinton-logo-blanco.svg'}
            alt="Lexinton Propiedades"
            width={187}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'text-[11.5px] font-semibold tracking-[0.15em] uppercase transition-colors duration-200',
                dark ? 'text-lx-stone hover:text-lx-ink' : 'text-white/95 hover:text-white',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/lexintonpropiedades/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={cn('transition-colors duration-200', dark ? 'text-gray-400 hover:text-gray-700' : 'text-white/60 hover:text-white')}>
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/lexintonpropiedades/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={cn('transition-colors duration-200', dark ? 'text-gray-400 hover:text-gray-700' : 'text-white/60 hover:text-white')}>
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/company/lexinton-propiedades/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={cn('transition-colors duration-200', dark ? 'text-gray-400 hover:text-gray-700' : 'text-white/60 hover:text-white')}>
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/@lexintonpropiedades" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={cn('transition-colors duration-200', dark ? 'text-gray-400 hover:text-gray-700' : 'text-white/60 hover:text-white')}>
              <YouTubeIcon className="w-4 h-4" />
            </a>
          </div>
          <a
            href="/tasar"
            className={cn(
              'text-[10.5px] font-bold tracking-[0.14em] uppercase px-5 py-2.5 border transition-all duration-200',
              dark
                ? 'border-lx-ink text-lx-ink hover:bg-lx-ink hover:text-lx-cream'
                : 'border-white text-white hover:bg-white hover:text-lx-ink',
            )}
          >
            Tasar inmueble
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            'lg:hidden p-3 -mr-2 transition-colors duration-200',
            dark ? 'text-lx-ink' : 'text-white',
          )}
          aria-label="Menú"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-lx-cream border-t border-lx-line">
          <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 border-b border-lx-line last:border-0 text-lx-stone hover:text-lx-ink transition-colors"
              >
                <Icon icon={link.icon} className="w-5 h-5 text-[#C41230] flex-shrink-0" />
                <span className="text-[12px] font-semibold tracking-[0.12em] uppercase">{link.label}</span>
              </Link>
            ))}
            <a
              href="/tasar"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] font-bold tracking-[0.14em] uppercase px-5 py-3 border border-lx-ink text-lx-ink"
            >
              <Icon icon="solar:home-angle-linear" className="w-4 h-4 text-[#C41230]" />
              Tasar inmueble
            </a>
            <div className="flex items-center justify-center gap-5 mt-4 pt-4 border-t border-lx-line">
              <a href="https://www.linkedin.com/company/lexinton-propiedades/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-lx-stone hover:text-lx-ink transition-colors">
                <LinkedInIcon className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/lexintonpropiedades/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-lx-stone hover:text-lx-ink transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/LexintonPropiedadesOficial" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-lx-stone hover:text-lx-ink transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@LexintonPropiedades" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-lx-stone hover:text-lx-ink transition-colors">
                <YouTubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

