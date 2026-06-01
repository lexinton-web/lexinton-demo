'use client'

/**
 * PropertyCard — Tarjeta de propiedad para grids.
 *
 * Diseño premium:
 * - rounded-xl + shadow-sm → shadow-md en hover
 * - imagen con zoom suave
 * - overlay con CTA en hover
 * - badges top-left (operación + barrio)
 * - tipo bottom-right
 * - precio destacado con tipografía serif
 * - stats limpios con iconos
 */

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import type { TokkoProperty } from '@/lib/tokko/types'
import {
  getCoverPhoto,
  getOperationLabel,
  getPropertyPriceLabel,
  getNeighborhood,
  getPropertyTypeLabel,
  formatArea,
  formatExpenses,
  makePropertySlug,
  getOperationBadgeStyle,
} from '@/lib/tokko/utils'
import { ContactModal } from './properties/ContactModal'

interface PropertyCardProps {
  property: TokkoProperty
  featured?: boolean
  priority?: boolean
  basePath?: string
}

export default function PropertyCard({
  property,
  featured = false,
  priority = false,
  basePath = '/propiedades',
}: PropertyCardProps) {
  const slug = makePropertySlug(property.id, property.address)
  const href = `${basePath}/${slug}`
  const coverPhoto = getCoverPhoto(property)
  const operationLabel = getOperationLabel(property)
  const priceLabel = getPropertyPriceLabel(property)
  const neighborhood = getNeighborhood(property)
  const typeLabel = getPropertyTypeLabel(property)
  const expenses = formatExpenses(property.expenses)

  const isAlquiler = operationLabel.toLowerCase().includes('alquiler')
  const operationType = property.operations?.[0]?.operation_type ?? ''
  const badgeStyle = getOperationBadgeStyle(operationType)
  const surface = property.total_surface || property.roofed_surface || property.surface || 0
  const rooms = property.room_amount
  const bathrooms = property.bathroom_amount
  const parking = (property.parking_lot_amount ?? 0) > 0 || (property.covered_parking_lot ?? 0) > 0

  const [showContact, setShowContact] = useState(false)
  const whatsappNumber = '5491131519928'
  const whatsappText = encodeURIComponent(
    `Hola, me interesa la propiedad en ${property.fake_address || property.address}. La vi en lexinton.com.ar`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`

  return (
    <>
    <article className="group outline-none rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col border border-lx-line/60">
      <Link
        href={href}
        className="block focus-visible:ring-2 focus-visible:ring-lx-accent focus-visible:ring-offset-2 flex-1 flex flex-col"
      >
      <div className="flex flex-col flex-1">

        {/* ── Imagen ─────────────────────────────────────────────── */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-lx-parchment shrink-0">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={property.fake_address || property.address}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              priority={priority}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-lx-parchment">
              <svg className="w-10 h-10 text-lx-line" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}

          {/* Overlay en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span
              className="text-[9px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm backdrop-blur-sm"
              style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
            >
              {badgeStyle.label}
            </span>
            {neighborhood && (
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-sm bg-black/50 text-white backdrop-blur-sm w-fit">
                {neighborhood}
              </span>
            )}
          </div>

          {/* Tipo bottom-right */}
          {typeLabel && (
            <span className="absolute bottom-3 right-3 text-[9px] font-semibold tracking-[0.10em] uppercase px-2 py-0.5 rounded-sm bg-white/90 text-lx-ink backdrop-blur-sm">
              {typeLabel}
            </span>
          )}
        </div>

        {/* ── Contenido ──────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">

          {/* Dirección */}
          <h3 className="text-[13.5px] font-medium text-lx-ink leading-snug mb-3 line-clamp-2 group-hover:text-lx-accent transition-colors duration-200">
            {property.fake_address || property.address}
          </h3>

          {/* Precio */}
          <p className="font-serif text-[1.55rem] font-normal text-lx-ink tracking-tight leading-none mb-1">
            {priceLabel}
          </p>

          {expenses && (
            <p className="text-[10.5px] text-lx-stone mb-3">
              Expensas: {expenses}
            </p>
          )}

          {featured && property.description && (
            <p className="text-[12px] text-lx-stone leading-relaxed mb-3 line-clamp-2">
              {property.description
                .split('Consulta por esta propiedad')[0]
                .trim()
                .slice(0, 120)}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-auto pt-3.5 border-t border-lx-line/70 text-lx-stone text-[11px]">
            {typeof rooms === 'number' && rooms > 0 && (
              <StatItem icon={<RoomsIcon />} label={`${rooms} amb.`} />
            )}
            {typeof bathrooms === 'number' && bathrooms > 0 && (
              <StatItem icon={<BathIcon />} label={`${bathrooms} baño${bathrooms !== 1 ? 's' : ''}`} />
            )}
            {parking && (
              <StatItem icon={<GarageIcon />} label="Cochera" />
            )}
            {surface > 0 && (
              <span className="flex items-center gap-1 ml-auto text-lx-stone/80">
                <AreaIcon />
                {formatArea(surface)}
              </span>
            )}
          </div>
        </div>
      </div>
      </Link>
      {/* Botones de contacto */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-0">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-9 bg-[#25D366] text-white rounded-lg
            flex items-center justify-center gap-1.5 text-xs font-medium
            hover:bg-[#1ea952] transition-colors"
        >
          <Icon icon="logos:whatsapp-icon" className="w-3.5 h-3.5" />
          WhatsApp
        </a>
        <button
          onClick={() => setShowContact(true)}
          className="flex-1 h-9 bg-[#374151] text-white rounded-lg
            flex items-center justify-center gap-1.5 text-xs font-medium
            hover:bg-[#1f2937] transition-colors"
        >
          Contactar
          <Icon icon="solar:letter-bold" className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
    <ContactModal
      open={showContact}
      onClose={() => setShowContact(false)}
      property={property}
    />
    </>
  )
}

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PropertyCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm border border-lx-line/60 flex flex-col">
      <div className={cn('bg-gray-100', featured ? 'aspect-[3/2]' : 'aspect-[16/10]')} />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-7 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-3 pt-3.5 border-t border-gray-100">
          <div className="h-3 bg-gray-100 rounded w-12" />
          <div className="h-3 bg-gray-100 rounded w-12" />
          <div className="h-3 bg-gray-100 rounded w-14 ml-auto" />
        </div>
      </div>
    </div>
  )
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

function RoomsIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BathIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" x2="8" y1="5" y2="7" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <line x1="7" x2="7" y1="19" y2="21" />
      <line x1="17" x2="17" y1="19" y2="21" />
    </svg>
  )
}

function GarageIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8h-6V8z" />
      <line x1="4" x2="13" y1="16" y2="16" />
      <line x1="2" x2="2" y1="16" y2="21" />
      <line x1="15" x2="15" y1="16" y2="21" />
    </svg>
  )
}

function AreaIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3 3 21" />
      <path d="M21 12V3h-9" />
      <path d="M3 12v9h9" />
    </svg>
  )
}
