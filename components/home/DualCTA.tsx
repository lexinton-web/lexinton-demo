'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import Image from 'next/image'

export function DualCTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] font-medium mb-3">
            Próximos pasos
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            ¿Cómo te<br />
            <em className="not-italic font-normal">podemos ayudar?</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1 — Comprar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl bg-[#111] h-[420px]"
          >
            {/* Imagen de fondo */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50
              group-hover:scale-105 transition-all duration-700">
              <Image
                src="/images/lifestyle/lifestyle-3.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t
              from-black/90 via-black/30 to-transparent" />

            {/* Contenido */}
            <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
              <Icon icon="solar:home-2-bold-duotone"
                className="w-12 h-12 text-white mb-6 opacity-80" />
              <h3 className="text-3xl font-light text-white mb-3">
                Estoy buscando<br />
                <em className="not-italic font-normal">una propiedad</em>
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Accedé a nuestro catálogo completo en Palermo, Belgrano y zona norte.
              </p>
              <Link href="/propiedades"
                className="inline-flex items-center gap-2 bg-white text-gray-900
                  px-6 py-3 rounded-full text-sm font-medium w-fit
                  hover:bg-[#C41230] hover:text-white transition-colors duration-300">
                Ver propiedades
                <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2 — Vender / Tasar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl bg-[#C41230] h-[420px]"
          >
            {/* Pattern decorativo */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />

            <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
              <Icon icon="solar:wallet-money-bold-duotone"
                className="w-12 h-12 text-white mb-6 opacity-90" />
              <h3 className="text-3xl font-light text-white mb-3">
                Quiero saber<br />
                <em className="not-italic font-normal">cuánto vale la mía</em>
              </h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Tasación con un corredor de tu barrio. Respuesta en menos de 24 horas.
              </p>
              <Link href="/tasar"
                className="inline-flex items-center gap-2 bg-white text-[#C41230]
                  px-6 py-3 rounded-full text-sm font-medium w-fit
                  hover:bg-gray-900 hover:text-white transition-colors duration-300">
                Tasar mi inmueble
                <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
