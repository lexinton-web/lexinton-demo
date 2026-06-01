'use client'
/**
 * PropertyGallery — Galería responsiva
 *
 * < lg  : carousel con foto única + flechas siempre visibles + contador
 * >= lg  : grid 2/3 main + 1/3 2×2 thumbs
 * Click  : lightbox con navegación completa
 */

import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import type { TokkoPhoto } from '@/lib/tokko/types'

interface Props {
  photos: TokkoPhoto[]
  title: string
}

export function PropertyGallery({ photos, title }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)

  if (!photos?.length) return null

  const openAt = (i: number) => { setIndex(i); setOpen(true) }
  const slides = photos.map((p) => ({ src: p.image, alt: title }))

  return (
    <>
      {/* ── CAROUSEL MOBILE/TABLET (< lg) ─────────────────────────── */}
      <div className="block lg:hidden relative">
        <div
          className="relative h-[300px] sm:h-[380px] overflow-hidden rounded-xl cursor-pointer"
          onClick={() => openAt(mobileIndex)}
        >
          <Image
            src={photos[mobileIndex].image}
            alt={`${title} - foto ${mobileIndex + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={mobileIndex === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMobileIndex(i => (i - 1 + photos.length) % photos.length)
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full bg-white shadow-lg
                flex items-center justify-center text-gray-800 z-10
                hover:bg-gray-50 transition-colors"
            >
              <Icon icon="solar:arrow-left-bold" className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMobileIndex(i => (i + 1) % photos.length)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full bg-white shadow-lg
                flex items-center justify-center text-gray-800 z-10
                hover:bg-gray-50 transition-colors"
            >
              <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Contador */}
        <div className="absolute bottom-3 right-3 z-10
          bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {mobileIndex + 1} / {photos.length}
        </div>

        {/* Ver todas */}
        <button
          onClick={() => openAt(0)}
          className="absolute bottom-3 left-3 z-10
            bg-white/90 text-gray-800 text-xs font-medium
            px-3 py-1.5 rounded-full shadow flex items-center gap-1.5"
        >
          <Icon icon="solar:camera-linear" className="w-3.5 h-3.5" />
          Ver {photos.length} fotos
        </button>
      </div>

      {/* ── GRID DESKTOP (>= lg) ───────────────────────────────────── */}
      <div className="hidden lg:grid grid-cols-[2fr_1fr] gap-2 h-[480px] rounded-xl overflow-hidden">
        {/* Foto principal */}
        <div
          className="relative overflow-hidden cursor-zoom-in group"
          onClick={() => openAt(0)}
        >
          <Image
            src={photos[0].image}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            priority
            sizes="60vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Grid 2×2 */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {[0, 1, 2, 3].map((gridPos) => {
            const photoIndex = gridPos + 1
            const photo = photos[photoIndex]
            if (!photo) return <div key={gridPos} className="bg-gray-100" />
            const isLast = gridPos === 3 && photos.length > 5
            return (
              <div
                key={gridPos}
                className="relative overflow-hidden cursor-zoom-in group"
                onClick={() => openAt(photoIndex)}
              >
                <Image
                  src={photo.image}
                  alt={`${title} - foto ${photoIndex + 1}`}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-400"
                  sizes="(max-width: 1280px) 25vw, 20vw"
                  priority
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                {isLast && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                      <Icon icon="solar:camera-bold" className="w-4 h-4" />
                      +{photos.length - 5} fotos
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── LIGHTBOX ──────────────────────────────────────────────── */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 2, doubleTapDelay: 300, scrollToZoom: false }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.92)' } }}
      />
    </>
  )
}

