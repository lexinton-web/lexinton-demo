'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { TokkoDevelopment } from '@/lib/tokko/types'

interface Props { developments: TokkoDevelopment[] }

const CONSTRUCTION_STATUS: Record<number, string> = {
  0: 'En pozo',
  1: 'En construcción',
  2: 'Terminado',
  3: 'Entrega inmediata',
}

export function DevelopmentsCarousel({ developments }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const total = developments.length

  const goTo = useCallback((index: number, dir?: number) => {
    const newIndex = ((index % total) + total) % total
    setDirection(dir ?? (newIndex > current ? 1 : -1))
    setCurrent(newIndex)
  }, [current, total])

  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo])
  const next = useCallback(() => goTo(current + 1, 1), [current, goTo])

  // Autoplay
  useEffect(() => {
    if (isPaused || total <= 1) return
    const timer = setInterval(() => goTo(current + 1, 1), 5000)
    return () => clearInterval(timer)
  }, [current, isPaused, goTo, total])

  // Drag to swipe
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 80
    if (info.offset.x < -threshold) next()
    else if (info.offset.x > threshold) prev()
  }

  if (!developments.length) return null

  const getIndex = (offset: number) =>
    ((current + offset) % total + total) % total

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '60%' : '-60%',
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-60%' : '60%',
      opacity: 0,
      scale: 0.85,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    }),
  }

  return (
    <section
      className="relative bg-[#f5f5f5] py-20 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Blurred background from active slide */}
      <div className="absolute inset-0 opacity-10">
        {Array.isArray(developments[current].photos) &&
          (developments[current].photos as { image: string }[])[0] && (
          <Image
            src={(developments[current].photos as { image: string }[])[0].image}
            alt=""
            fill
            className="object-cover blur-2xl scale-110"
            unoptimized
          />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#C41230] text-xs uppercase tracking-[0.2em] mb-3">
              Emprendimientos
            </p>
            <h2 className="text-4xl font-light text-gray-900">
              Proyectos seleccionados
            </h2>
          </div>
          <Link
            href="/emprendimientos"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4 hidden md:block"
          >
            Ver todos →
          </Link>
        </div>

        {/* Stage — 3 slides visible */}
        <div className="relative flex items-center justify-center h-[480px] md:h-[520px]">

          {/* Slide anterior — partial left */}
          {total > 1 && (
            <motion.div
              className="absolute left-0 w-[28%] h-[85%] cursor-pointer hidden md:block"
              style={{ opacity: 0.45, scale: 0.88 }}
              whileHover={{ opacity: 0.65, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={prev}
            >
              <SlideCard dev={developments[getIndex(-1)]} />
            </motion.div>
          )}

          {/* Slide central — featured with AnimatePresence */}
          <div className="relative w-full md:w-[44%] h-full z-10 cursor-grab active:cursor-grabbing">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="absolute inset-0"
              >
                <Link href={`/emprendimientos/${developments[current].id}`}>
                  <SlideCard dev={developments[current]} featured />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide siguiente — partial right */}
          {total > 1 && (
            <motion.div
              className="absolute right-0 w-[28%] h-[85%] cursor-pointer hidden md:block"
              style={{ opacity: 0.45, scale: 0.88 }}
              whileHover={{ opacity: 0.65, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={next}
            >
              <SlideCard dev={developments[getIndex(1)]} />
            </motion.div>
          )}

          {/* Arrow left */}
          <button
            onClick={prev}
            className="absolute left-[30%] md:left-[31%] z-20 w-11 h-11 rounded-full bg-white border border-gray-300 text-gray-700 text-xl flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm"
            aria-label="Anterior"
          >
            ‹
          </button>

          {/* Arrow right */}
          <button
            onClick={next}
            className="absolute right-[30%] md:right-[31%] z-20 w-11 h-11 rounded-full bg-white border border-gray-300 text-gray-700 text-xl flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>

        {/* Dots — estilo cápsula/pill */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-2.5 rounded-full bg-gray-100 border border-gray-200">
            {developments.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a slide ${i + 1}`}
                className="relative flex items-center justify-center w-10 h-6"
              >
                <span className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-3 h-3 bg-gray-900' : 'w-2.5 h-2.5 bg-gray-300'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <p className="text-center text-gray-600 text-xs mt-4">
          {current + 1} / {total}
        </p>

      </div>
    </section>
  )
}

// ─── SlideCard ───────────────────────────────────────────────────────────────

function SlideCard({ dev, featured = false }: { dev: TokkoDevelopment; featured?: boolean }) {
  const photos = Array.isArray(dev.photos) ? dev.photos : []
  const photo = photos[0]?.image ?? null
  const addr = dev.address || dev.fake_address || ''
  const statusLabel = CONSTRUCTION_STATUS[dev.construction_status] ?? null

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900">
      {photo && (
        <Image
          src={photo}
          alt={dev.name}
          fill
          className="object-cover"
          sizes={featured ? '44vw' : '28vw'}
          priority={featured}
          unoptimized
        />
      )}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {/* Status badge */}
      {statusLabel && (
        <div className="absolute top-4 left-4">
          <span className="bg-[#C41230] text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide">
            {statusLabel}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {dev.location?.name && (
          <p className="text-gray-300 text-xs uppercase tracking-widest mb-1">
            {dev.location.name}
          </p>
        )}
        <h3 className={`text-white font-medium leading-snug ${featured ? 'text-2xl' : 'text-base line-clamp-2'}`}>
          {dev.publication_title || dev.name}
        </h3>
        {featured && addr && (
          <p className="text-gray-400 text-sm mt-1">{addr}</p>
        )}
        {featured && (
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-white border border-white/30 rounded-full px-5 py-2 hover:bg-white hover:text-gray-900 transition-all">
            Ver emprendimiento →
          </div>
        )}
      </div>
    </div>
  )
}

export default DevelopmentsCarousel

