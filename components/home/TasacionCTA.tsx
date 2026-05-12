'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { AnimatedCounter } from '@/components/tasar/AnimatedCounter'

const items = [
  'Publicaciones premium en Zonaprop, Argenprop y MercadoLibre',
  'Video profesional con campañas en Instagram, Facebook y YouTube',
  'Posicionamiento en Google para compradores que buscan tu zona',
]

const portales = [
  { name: 'Zonaprop', color: '#FF6600' },
  { name: 'Argenprop', color: '#00A651' },
  { name: 'MercadoLibre', color: '#f59e0b' },
  { name: 'Properati', color: '#93c5fd' },
]

export function TasacionCTA() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">

      {/* IZQUIERDA — fondo oscuro */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[#0f1923] px-10 py-20 md:px-16 md:py-24 flex flex-col gap-8 overflow-hidden"
      >
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/lifestyle-1.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="50vw"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-8">
<div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 uppercase tracking-[0.15em]">
            Vendé con éxito
          </p>
          <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] font-medium">
            Vendé con Lexinton
          </p>
        </div>

        <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
          La venta de tu propiedad<br />
          <em className="not-italic font-normal text-gray-300">empieza acá.</em>
        </h2>

        <p className="text-gray-400 leading-relaxed">
          Vender bien no es cuestión de suerte. Es estrategia, exposición
          y llegar al comprador correcto en el momento justo.
        </p>

        <motion.ul
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col gap-4"
        >
          {items.map((item) => (
            <motion.li
              key={item}
              variants={{
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              className="flex items-start gap-3 text-gray-300 text-sm"
            >
              <Icon
                icon="solar:check-circle-bold"
                className="w-5 h-5 text-[#4ade80] flex-shrink-0 mt-0.5"
              />
              {item}
            </motion.li>
          ))}
        </motion.ul>

        {/* Logos portales */}
        <div className="flex flex-wrap gap-4 mt-2">
          {portales.map(p => (
            <span
              key={p.name}
              className="text-xs font-bold tracking-wide"
              style={{ color: p.color }}
            >
              {p.name}
            </span>
          ))}
        </div>

        <p className="text-sm italic text-gray-500">
          El resultado: más personas viendo tu propiedad, en menos tiempo.
        </p>

        <Link
          href="/tasar"
          className="inline-flex items-center gap-2 border border-white/30
            text-white text-sm font-medium px-6 py-3 rounded-full w-fit
            hover:bg-white hover:text-[#0f1923] transition-colors duration-200"
        >
          Quiero vender
          <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
        </Link>
        </div>{/* end relative z-10 */}
      </motion.div>

      {/* DERECHA — fondo rojo */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[#111] px-10 py-20 md:px-16 md:py-24
          flex flex-col items-center justify-center gap-6 text-center overflow-hidden"
      >
        {/* Imagen full color */}
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/lifestyle-4.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
            quality={85}
          />
        </div>

        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex items-start leading-none">
          <span className="text-[100px] md:text-[140px] font-light text-white leading-none">
            <AnimatedCounter end={83} duration={3500} pauseDuration={5000} loop={true} />
          </span>
          <span className="text-5xl text-white/70 mt-6">%</span>
        </div>

        <p className="text-white/80 text-base leading-relaxed max-w-xs">
          de los propietarios que vendieron con Lexinton
          volvieron a elegirnos.
        </p>

        <Link
          href="/tasar"
          className="mt-2 inline-flex items-center gap-2
            bg-white text-[#C41230] font-semibold text-sm
            px-8 py-4 rounded-full
            hover:bg-gray-100 transition-colors duration-200"
        >
          Quiero vender
          <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
        </Link>
        </div>{/* end relative z-10 */}
      </motion.div>

    </section>
  )
}
