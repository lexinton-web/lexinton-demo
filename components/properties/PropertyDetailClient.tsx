'use client'

/**
 * PropertyDetailClient — Detalle de propiedad/emprendimiento estilo ZonaProp
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import PropertyCard from '@/components/PropertyCard'
import { ContactForm } from '@/components/properties/ContactForm'
import type { TokkoProperty, TokkoTag } from '@/lib/tokko/types'
import ShareButton from '@/components/properties/ShareButton'
import { formatExpenses, TAG_LABELS, getOperationBadgeStyle } from '@/lib/tokko/utils'

const ease = [0.22, 1, 0.36, 1] as const

const STAT_ICONS: Record<string, string> = {
  'Sup. total':       'solar:maximize-square-2-linear',
  'Sup. cubierta':    'solar:home-2-linear',
  'Sup. descubierta': 'solar:sun-fog-linear',
  'Ambientes':        'solar:widget-2-linear',
  'Dormitorios':      'solar:bed-linear',
  'Baños':            'solar:bath-linear',
  'Toilettes':        'solar:bath-linear',
  'Cocheras':         'solar:garage-linear',
  'Antigüedad':       'solar:calendar-linear',
  'Piso':             'solar:buildings-2-linear',
  'Estado':           'solar:verified-check-linear',
  'Tipo':             'solar:tag-linear',
  'Barrio':           'solar:map-point-linear',
  'Estado de obra':   'solar:buildings-3-linear',
  'Unidades':         'solar:home-2-linear',
}

const REDES = [
  { icon: 'skill-icons:instagram', url: 'https://www.instagram.com/lexintonpropiedades/', label: 'Instagram' },
  { icon: 'logos:facebook',        url: 'https://www.facebook.com/LexintonPropiedadesOficial', label: 'Facebook' },
  { icon: 'devicon:linkedin',      url: 'https://www.linkedin.com/company/lexinton-propiedades/', label: 'LinkedIn' },
  { icon: 'logos:youtube-icon',    url: 'https://www.youtube.com/@LexintonPropiedades', label: 'YouTube' },
]

interface Props {
  property: TokkoProperty
  stats: { label: string; value: string | number }[]
  description: string
  tags: TokkoTag[]
  operationLabel: string
  priceLabel: string
  neighborhood: string
  propertyType: string
  coordinates: { lat: number; lng: number } | null
  isRent: boolean
  similarProperties: TokkoProperty[]
  constructionStatus?: string
  unitsSlot?: React.ReactNode
}

export default function PropertyDetailClient({
  property, stats, description, tags, operationLabel, priceLabel,
  neighborhood, propertyType, coordinates, isRent, similarProperties,
  constructionStatus, unitsSlot,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const COLLAPSE_AT = 300
  const shouldCollapse = description.length > COLLAPSE_AT
  const operationType = property.operations?.[0]?.operation_type ?? ''
  const badgeStyle = getOperationBadgeStyle(operationType)

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 xl:gap-14">

        {/* ── COLUMNA IZQUIERDA ─────────────────────────── */}
        <div className="min-w-0">

          {/* B1) Badges + Compartir */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
            {operationLabel && operationLabel !== 'Emprendimiento' && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
              >
                {badgeStyle.label}
              </span>
            )}
            {propertyType && (
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded">
                {propertyType}
              </span>
            )}
            {neighborhood && (
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded">
                {neighborhood}
              </span>
            )}
            {property.credit_eligible === 'Eligible' && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded">
                Apto Crédito
              </span>
            )}
            {constructionStatus && (
              <span className="bg-blue-600 text-white text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded">
                {constructionStatus}
              </span>
            )}
            <div className="ml-auto">
              <ShareButton property={property} priceLabel={priceLabel} />
            </div>
          </motion.div>

          {/* B2) Título + Precio */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mb-6"
          >
            {(() => {
              const displayAddress = property.fake_address || property.address
              const pubTitle = property.publication_title
              const hasSeparateTitle = pubTitle && pubTitle !== displayAddress
              return hasSeparateTitle ? (
                <>
                  <h1 className="text-2xl md:text-3xl font-light text-gray-900 leading-snug mb-1">
                    {pubTitle}
                  </h1>
                  <p className="text-base text-gray-500 mt-1">{displayAddress}</p>
                </>
              ) : (
                <h1 className="text-3xl font-light text-gray-900 leading-tight mb-1">
                  {displayAddress}
                </h1>
              )
            })()}
            {neighborhood && (
              <p className="text-base text-gray-500 mb-4">{neighborhood}</p>
            )}
            {priceLabel && (
              <div className="mt-4">
                <p className="text-3xl font-semibold text-gray-900">{priceLabel}</p>
                {property.expenses != null && property.expenses > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    + Expensas {formatExpenses(property.expenses)}
                  </p>
                )}
              </div>
            )}
          </motion.header>

          {/* B3) Características con íconos — fila horizontal */}
          {stats.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
              className="border-t border-b border-gray-100 py-5 my-6"
            >
              <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.05 }}
                    className="flex flex-col items-center gap-1 text-center min-w-[56px]"
                  >
                    <Icon
                      icon={STAT_ICONS[stat.label] ?? 'solar:star-linear'}
                      className="w-5 h-5 text-gray-400"
                    />
                    <span className="text-lg font-medium text-gray-900 leading-tight">{stat.value}</span>
                    <span className="text-xs text-gray-500 leading-tight">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* B3b) Slot para unidades de emprendimiento */}
          {unitsSlot}

          {/* B4) Descripción con expand/collapse */}
          {description && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
              className="mb-8 pb-8 border-b border-gray-100"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Descripción
              </h2>
              <div className={`text-[14px] text-gray-600 leading-relaxed ${!expanded && shouldCollapse ? 'line-clamp-4' : ''}`}>
                {description.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="mb-2 last:mb-0">{para}</p>
                ))}
              </div>
              {shouldCollapse && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-[#C41230] mt-2 hover:underline"
                >
                  {expanded ? 'Leer menos' : 'Leer descripción completa →'}
                </button>
              )}
            </motion.section>
          )}

          {/* B5) Comodidades / Amenities */}
          {tags.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
              className="mb-8 pb-8 border-b border-gray-100"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Conocé más de esta propiedad
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600"
                  >
                    <Icon icon="solar:star-linear" className="w-3.5 h-3.5 text-[#C41230]" />
                    {TAG_LABELS[tag.name] ?? tag.name}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

          {/* B6) Mapa */}
          {coordinates && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
              className="mb-8 pb-8 border-b border-gray-100"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Ubicación
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Icon icon="solar:map-point-linear" className="w-4 h-4 text-gray-400 shrink-0" />
                {property.fake_address || property.address}
                {neighborhood && `, ${neighborhood}`}
              </div>
              <div className="w-full aspect-[16/9] overflow-hidden border border-gray-100 rounded-xl">
                <iframe
                  title="Mapa de ubicación"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=16&output=embed&language=es`}
                  className="border-0"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                * La ubicación mostrada es aproximada para proteger la privacidad.
              </p>
            </motion.section>
          )}

          {/* B7) Redes sociales */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease }}
            className="mb-8"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Seguinos
            </h2>
            <div className="flex gap-3 mt-3">
              {REDES.map((r) => (
                <a
                  key={r.label}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={r.label}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:border-gray-400 transition-colors"
                >
                  <Icon icon={r.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.section>

          {/* B8) Referencia */}
          <p className="text-[11px] text-gray-400">
            Ref. {property.reference_code || `#${property.id}`}
          </p>
        </div>

        {/* ── COLUMNA DERECHA — STICKY ──────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <ContactForm property={property} />
          </div>
        </motion.aside>
      </div>

      {/* ── PROPIEDADES SIMILARES ───────────────────────── */}
      {similarProperties.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="mt-16 pt-12 border-t border-gray-100"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-gray-400 mb-2">
                También en {neighborhood}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-gray-900">
                Propiedades Similares
              </h2>
            </div>
            <Link
              href={`/propiedades${neighborhood ? `?location=${encodeURIComponent(neighborhood)}` : ''}`}
              className="hidden sm:block text-[10.5px] font-bold tracking-[0.14em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
            >
              Ver más →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
