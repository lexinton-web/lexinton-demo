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
            className="object-cover opacity-100"
            sizes="50vw"
          />
        </div>

        {/* Overlay oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-[#0f1923]/60" />

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
        className="relative overflow-hidden
          px-8 py-10 md:px-12 md:py-12
          flex flex-col justify-start"
      >
        {/* Imagen full color — protagonista */}
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/lifestyle-4.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="50vw"
            quality={85}
          />
        </div>

        {/* Overlay sutil solo arriba para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

        {/* Contenido — justify-between para botón abajo */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-start leading-none">
              <span className="text-[64px] md:text-[80px] font-light text-white leading-none">
                <AnimatedCounter end={83} duration={3500} pauseDuration={5000} loop={true} />
              </span>
              <span className="text-3xl text-white/70 mt-2">%</span>
            </div>

            <p className="text-sm text-white/85 leading-snug mt-2 max-w-[200px]">
              de los propietarios que vendieron con Lexinton
              volvieron a elegirnos.
            </p>
          </div>

          <Link
            href="/tasar"
            className="inline-flex items-center gap-2 w-fit
              border border-white/30 text-white
              px-6 py-3 rounded-full text-sm font-medium
              hover:bg-white hover:text-[#0f1923] transition-colors duration-200"
          >
            Quiero vender
            <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

    </section>
  )
}
