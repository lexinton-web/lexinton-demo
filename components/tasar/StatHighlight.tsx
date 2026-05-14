'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { AnimatedCounter } from './AnimatedCounter'

export function StatHighlight() {
  return (
    <section className="py-28 bg-[#f5f5f3] relative overflow-hidden">
      {/* Imagen full color */}
      <div className="absolute inset-0">
        <Image
          src="/images/lifestyle/lifestyle-6.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
      </div>

      {/* Overlay para legibilidad del texto */}
      <div className="absolute inset-0 bg-white/55" />

      {/* Línea decorativa horizontal de fondo */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-[#C41230]/10" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Label pequeño arriba */}
          <p className="text-xs text-[#C41230] uppercase tracking-[0.25em] font-semibold mb-8">
            RESULTADO COMPROBADO
          </p>

          {/* Número enorme */}
          <div className="relative inline-block">
            <span className="text-[100px] md:text-[140px] font-light text-[#C41230] leading-none tracking-tighter drop-shadow-lg">
              <AnimatedCounter end={83} duration={3500} pauseDuration={5000} loop={true} />
              <span className="text-[100px] md:text-[140px]">%</span>
            </span>
          </div>

          {/* Texto debajo */}
          <p className="text-xl md:text-2xl font-medium text-gray-900 mt-4 leading-relaxed drop-shadow-sm">
            de los propietarios que tasaron con Lexinton
            <br />
            <span className="text-gray-700 drop-shadow-sm">eligieron publicar con nosotros.</span>
          </p>

          <p className="text-base italic text-gray-600 drop-shadow-sm mt-6">El resultado habla solo.</p>
        </motion.div>
      </div>
    </section>
  )
}

export default StatHighlight
