'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { TokkoProperty } from '@/lib/tokko/types'
import {
  getPropertyPriceLabel,
  formatExpenses,
  getSortedPhotos,
  getDisplayTags,
  TAG_LABELS,
  makePropertySlug,
  getOperationBadgeStyle,
  cleanDescription,
} from '@/lib/tokko/utils'
import { ContactModal } from './ContactModal'

interface Props {
  property: TokkoProperty
  index?: number
  basePath?: string
}

export function PropertyListCard({ property, index = 0, basePath = '/propiedades' }: Props) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [showContact, setShowContact] = useState(false)

  const photos = getSortedPhotos(property)
  const priceLabel = getPropertyPriceLabel(property)
  const expenses = formatExpenses(property.expenses)
  const slug = makePropertySlug(property.id, property.address)
  const href = `${basePath}/${slug}`

  const surface = property.total_surface || property.roofed_surface || property.surface || 0
  const rooms = property.room_amount
  const bedrooms = property.suite_amount
  const bathrooms = property.bathroom_amount
  const parking = (property.parking_lot_amount ?? 0) > 0 || (property.covered_parking_lot ?? 0) > 0

  const displayTags = getDisplayTags(property.tags ?? [], 3)
  const firstTag = displayTags[0]
  const tagLabel = firstTag ? (TAG_LABELS[firstTag.name] ?? firstTag.name) : null

  const operationType = property.operations?.[0]?.operation_type ?? ''
  const badgeStyle = getOperationBadgeStyle(operationType)
  const neighborhood = property.location?.name ?? ''

  const description = cleanDescription(property.description ?? '')

  const whatsappNumber = '5491131519928'
  const whatsappText = encodeURIComponent(
    `Hola, me interesa la propiedad en ${property.fake_address || property.address}. La vi en lexinton.com.ar`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`

  return (
    <>
      <article className="flex flex-col md:flex-row bg-white border border-gray-200
        rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">

        {/* === IMAGEN izquierda === */}
        <div className="relative w-full md:w-[320px] md:h-auto h-[220px]
          flex-shrink-0 overflow-hidden bg-gray-100 group/img">

          <Link href={href} className="block w-full h-full min-h-[220px] md:min-h-[240px]">
            {photos.length > 0 && photos[currentPhoto]?.image ? (
              <Image
                src={photos[currentPhoto].image}
                alt={property.fake_address || property.address || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                priority={index < 2}
                unoptimized
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  target.parentElement?.classList.add('bg-gray-100')
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm bg-gray-50">
                Sin foto
              </div>
            )}
          </Link>

          {/* Flechas de navegación */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentPhoto(p => (p - 1 + photos.length) % photos.length) }}
                className="absolute left-2 top-1/2 -translate-y-1/2
                  w-8 h-8 rounded-full bg-black/30 text-white
                  flex items-center justify-center text-lg
                  opacity-60 md:opacity-0 md:group-hover/img:opacity-80 hover:!opacity-100 transition-opacity"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentPhoto(p => (p + 1) % photos.length) }}
                className="absolute right-2 top-1/2 -translate-y-1/2
                  w-8 h-8 rounded-full bg-black/30 text-white
                  flex items-center justify-center text-lg
                  opacity-60 md:opacity-0 md:group-hover/img:opacity-80 hover:!opacity-100 transition-opacity"
              >
                ›
              </button>
            </>
          )}

          {/* Dots del carousel */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setCurrentPhoto(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentPhoto ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {operationType && (
              <span
                className="text-[9px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm backdrop-blur-sm w-fit"
                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
              >
                {badgeStyle.label}
              </span>
            )}
            {neighborhood && (
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-sm bg-black/50 text-white backdrop-blur-sm w-fit">
                {neighborhood}
              </span>
            )}
            {tagLabel && (
              <span className="text-[9px] font-medium text-gray-800 px-2.5 py-1 rounded-sm bg-white/90 backdrop-blur-sm w-fit shadow-sm">
                {tagLabel}
              </span>
            )}
          </div>
        </div>

        {/* === DATOS derecha === */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">

          <div>
            {/* Precio + corazón */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{priceLabel}</p>
                {expenses && (
                  <p className="text-sm text-gray-500 mt-0.5">{expenses}</p>
                )}
              </div>
              <button className="text-gray-300 hover:text-[#C41230] transition-colors p-1 shrink-0">
                <Icon icon="solar:heart-linear" className="w-6 h-6" />
              </button>
            </div>

            {/* Características en línea horizontal */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 mt-3 mb-3">
              {surface > 0 && <span>{Math.round(surface)} m² tot.</span>}
              {(rooms ?? 0) > 0 && <><span className="text-gray-300">·</span><span>{rooms} amb.</span></>}
              {(bedrooms ?? 0) > 0 && <><span className="text-gray-300">·</span><span>{bedrooms} dorm.</span></>}
              {(bathrooms ?? 0) > 0 && <><span className="text-gray-300">·</span><span>{bathrooms} baño{bathrooms !== 1 ? 's' : ''}</span></>}
              {parking && <><span className="text-gray-300">·</span><span>1 coch.</span></>}
            </div>

            {/* Dirección */}
            <Link href={href} className="hover:text-[#C41230] transition-colors">
              <p className="font-medium text-gray-900">
                {property.fake_address || property.address}
              </p>
              {property.location?.name && (
                <p className="text-sm text-gray-500">{property.location.name}</p>
              )}
            </Link>

            {/* Descripción truncada */}
            {description && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Barra inferior con logo + botones */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs font-semibold tracking-wider text-gray-900">LEXINTON</span>

            {/* Botones de contacto */}
            <div className="flex items-center gap-2">
              {/* Teléfono */}
              <a
                href="tel:+541147765003"
                className="w-10 h-10 border border-gray-300 rounded-lg
                  flex items-center justify-center text-gray-500
                  hover:border-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Llamar"
              >
                <Icon icon="solar:phone-bold" className="w-5 h-5" />
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 bg-[#25D366] text-white rounded-lg
                  flex items-center gap-2 text-sm font-medium
                  hover:bg-[#1ea952] transition-colors"
              >
                <Icon icon="logos:whatsapp-icon" className="w-4 h-4" />
                WhatsApp
              </a>

              {/* Contactar */}
              <button
                onClick={() => setShowContact(true)}
                className="h-10 px-4 bg-[#374151] text-white rounded-lg
                  flex items-center gap-2 text-sm font-medium
                  hover:bg-[#1f2937] transition-colors"
              >
                Contactar
                <Icon icon="solar:letter-bold" className="w-4 h-4" />
              </button>
            </div>
          </div>
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
