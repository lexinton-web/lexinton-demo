'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { HomeSearchBar } from '@/components/search/HomeSearchBar'

const ease = [0.22, 1, 0.36, 1] as const

export default function HeroSection() {
  return (
    <section className="relative h-[100svh] min-h-[680px] flex flex-col overflow-x-clip">

      {/* IMAGEN ESTÁTICA — LCP target, priority */}
      <div className="absolute inset-0">
        <Image
          src="/palermo1.jpg"
          alt="Palermo, Buenos Aires"
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Overlay — cliente pidió full color; mantener en 0 para revertir fácil */}
      <div className="absolute inset-0 bg-black/0" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/0 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-white text-center px-5 sm:px-10 pt-[68px]">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="flex items-center gap-4 mb-8"
        >
          <span className="block w-8 h-px bg-white/50" />
          <span className="text-[10.5px] font-semibold tracking-[0.28em] uppercase text-white/70" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
            Palermo · Buenos Aires
          </span>
          <span className="block w-8 h-px bg-white/50" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.5 }}
          className="font-serif text-[clamp(2.8rem,6.5vw,5.2rem)] font-normal leading-[1.08] tracking-[-0.01em] max-w-4xl text-balance mb-6"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
        >
          Vendé bien.{' '}
          <em className="italic">Comprá mejor.</em>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="text-[16px] sm:text-[18px] text-white/75 font-light leading-[1.7] max-w-xl mb-10 text-balance"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
        >
          Coordinamos venta, compra y tasación con una estrategia clara,
          tiempos sincronizados y acompañamiento experto.
        </motion.p>

        {/* Search widget — reemplaza los CTAs de texto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.9 }}
          className="w-full px-0"
        >
          <HomeSearchBar />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="relative z-10 flex justify-center pb-8"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] tracking-[0.24em] uppercase text-white/40 font-medium">Scroll</span>
          <div className="w-px h-8 bg-white/20 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-white/60"
              style={{ height: '40%' }}
              animate={{ y: ['0%', '150%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
