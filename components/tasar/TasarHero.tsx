'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { EASE } from '@/lib/motion'

export default function TasarHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <section ref={sectionRef} className="bg-[#f5f5f5] pt-[calc(68px+4rem)] pb-20 sm:pt-[calc(68px+6rem)] sm:pb-28 relative overflow-hidden border-b border-gray-200">
      {/* Parallax background image */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110 pointer-events-none">
        <Image
          src="/hero-poster.jpg"
          fill
          alt=""
          className="object-cover opacity-15"
          priority
        />
      </motion.div>

      {/* Light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/40" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#C41230] mb-5"
        >
          Lexinton Propiedades · Tasaciones
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="font-serif text-[clamp(2.2rem,5vw,4rem)] font-normal text-gray-900 leading-[1.1] tracking-[-0.01em] mb-6 max-w-2xl"
        >
          La venta de tu propiedad
          <br />
          <em className="italic text-gray-500">comienza acá.</em>
        </motion.h1>
      </div>
    </section>
  )
}
