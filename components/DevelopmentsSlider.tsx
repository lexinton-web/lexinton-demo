'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { TokkoDevelopment } from '@/lib/tokko/types'
import { makeDevelopmentSlug } from '@/lib/tokko/utils'

interface Props {
  developments: TokkoDevelopment[]
}

export default function DevelopmentsSlider({ developments }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (!developments.length) return null

  return (
    <section className="py-16 sm:py-20 bg-lx-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-8">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lx-stone/60 mb-2">Emprendimientos</p>
        <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-normal text-lx-ink">
          Proyectos en desarrollo
        </h2>
      </div>

      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-5 sm:px-8 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {developments.map((dev) => (
          <DevelopmentCard key={dev.id} dev={dev} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-8">
        <Link
          href="/emprendimientos"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase text-lx-stone hover:text-lx-ink transition-colors border-b border-lx-stone/40 hover:border-lx-ink pb-0.5"
        >
          Ver todos los emprendimientos
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

function DevelopmentCard({ dev }: { dev: TokkoDevelopment }) {
  const photo = Array.isArray(dev.photos) && dev.photos.length > 0 ? dev.photos[0].image : null

  return (
    <Link
      href={`/emprendimientos/${makeDevelopmentSlug(dev)}`}
      className="snap-start shrink-0 w-[300px] sm:w-[360px] bg-white rounded-2xl overflow-hidden group border border-lx-line hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-[200px] bg-lx-parchment overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={dev.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] tracking-[0.2em] uppercase text-lx-stone/40">Sin foto</span>
          </div>
        )}
        {dev.type?.name && (
          <span className="absolute top-3 left-3 text-[9px] font-bold tracking-[0.18em] uppercase bg-white/90 backdrop-blur-sm text-lx-ink px-2.5 py-1 rounded-full">
            {dev.type.name}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-serif text-[1.1rem] font-normal text-lx-ink leading-tight mb-1 group-hover:text-[#C41230] transition-colors">
          {dev.publication_title || dev.name}
        </h3>
        {dev.address && (
          <p className="text-[12px] text-lx-stone mt-1">{dev.address}</p>
        )}
        {dev.location?.name && (
          <p className="text-[11px] text-lx-stone/60 mt-0.5">{dev.location.name}</p>
        )}
      </div>
    </Link>
  )
}
