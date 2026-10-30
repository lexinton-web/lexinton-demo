/**
 * /propiedades/[id] — Detalle de una propiedad
 *
 * ISR: revalidate = 300 (5 min). generateStaticParams pre-renderiza las primeras 100.
 * Secciones: gallery → header → stats → description → amenities → map → contact → similares
 */

import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPropertyById, getSimilarProperties, getAllPropertyRefs } from '@/lib/tokko/queries'
import {
  getCoverPhoto, getSortedPhotos, getOperationLabel, getPropertyPriceLabel,
  getNeighborhood, getPropertyTypeLabel, formatArea, formatExpenses,
  makePropertySlug, parseSlugIdSafe, cleanDescription, getDisplayTags,
  getCoordinates, TAG_LABELS, CONDITION_LABELS, formatAddressTitle,
} from '@/lib/tokko/utils'
import { pageMetadata } from '@/lib/seo'
import PropertyCard from '@/components/PropertyCard'
import PropertyContact from '@/components/properties/PropertyContact'
import { PropertyGallery } from '@/components/properties/PropertyGallery'
import PropertyDetailClient from '@/components/properties/PropertyDetailClient'

export const revalidate = 300

interface PageProps {
  params: { id: string }
}

/* ─────────────────────────── Static params ──────────────────────────── */

export async function generateStaticParams() {
  const refs = await getAllPropertyRefs()
  return refs.map((p) => ({ id: makePropertySlug(p.id, p.address) }))
}

/* ─────────────────────────── Metadata ───────────────────────────────── */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const numericId = parseSlugIdSafe(params.id)
  if (!numericId) return { title: 'Propiedad | Lexinton' }

  const property = await getPropertyById(numericId)
  if (!property) return { title: 'Propiedad no encontrada | Lexinton' }

  const coverPhoto = getCoverPhoto(property)
  const description = cleanDescription(property.description ?? '').slice(0, 155)
  const operationLabel = getOperationLabel(property)
  const priceLabel = getPropertyPriceLabel(property)
  const typeLabel = getPropertyTypeLabel(property) || 'Propiedad'
  const neighborhood = getNeighborhood(property)
  const address = formatAddressTitle(property.address)
  const rooms = property.room_amount ? ` ${property.room_amount} amb.` : ''

  // "Departamento 3 amb. en venta en Núñez · Nuñez 3100 · USD 179.500 | Lexinton"
  const summary = [
    `${typeLabel}${rooms}`,
    operationLabel && `en ${operationLabel.toLowerCase()}`,
    neighborhood && `en ${neighborhood}`,
  ].filter(Boolean).join(' ')
  const title = [summary, address, priceLabel].filter(Boolean).join(' · ') + ' | Lexinton'

  const metaDesc = description ||
    `${typeLabel}${property.room_amount ? ` de ${property.room_amount} ambientes` : ''} en ${operationLabel.toLowerCase()} en ${neighborhood}. ${priceLabel}.`.trim()

  return pageMetadata({
    title,
    socialTitle: `${summary} · ${address} — Lexinton Propiedades`,
    description: metaDesc,
    path: `/propiedades/${makePropertySlug(property.id, property.address)}`,
    robots: { index: true, follow: true },
    image: coverPhoto
      ? { url: coverPhoto, alt: `${typeLabel} en ${neighborhood} — ${address}` }
      : undefined,
  })
}

/* ─────────────────────────── Page ───────────────────────────────────── */

export default async function PropiedadDetallePage({ params }: PageProps) {
  const numericId = parseSlugIdSafe(params.id)
  if (!numericId) notFound()

  const property = await getPropertyById(numericId)
  if (!property) notFound()

  // Una sola URL por propiedad: /propiedades/20399 o /propiedades/20399-otra-cosa → slug canónico
  const canonicalSlug = makePropertySlug(property.id, property.address)
  if (params.id !== canonicalSlug) permanentRedirect(`/propiedades/${canonicalSlug}`)

  const photos = getSortedPhotos(property)
  const similarProperties = await getSimilarProperties(property, 3)
  const coordinates = getCoordinates(property)
  const description = cleanDescription(property.description ?? '')
  const tags = getDisplayTags(property.tags ?? [], 12)
  const operationLabel = getOperationLabel(property)
  const operationValue = property.operations?.[0]?.operation_type ?? ''
  const priceLabel = getPropertyPriceLabel(property)
  const neighborhood = getNeighborhood(property)
  const propertyType = getPropertyTypeLabel(property)
  const condition = CONDITION_LABELS[property.property_condition ?? ''] ?? property.property_condition

  const isRent = operationValue === 'Rent' || operationValue === 'Temporary Rent'

  /* Stats — 6 campos exactos */
  const stats: { label: string; value: string | number }[] = [
    { label: 'Sup. total',       value: property.total_surface   ? formatArea(property.total_surface)   : 0 },
    { label: 'Sup. cubierta',    value: property.roofed_surface  ? formatArea(property.roofed_surface)  : 0 },
    { label: 'Sup. descubierta', value: (property.semiroofed_surface ?? property.unroofed_surface) ? formatArea((property.semiroofed_surface ?? property.unroofed_surface)!) : 0 },
    { label: 'Ambientes',        value: property.room_amount   ?? 0 },
    { label: 'Dormitorios',      value: property.suite_amount  ?? 0 },
    { label: 'Baños',            value: property.bathroom_amount ?? 0 },
  ].filter(f => f.value !== 0 && f.value !== '' && f.value !== null)

  return (
    <main className="min-h-screen bg-white">

      {/* ── BREADCRUMB ─────────────────────────────────── */}
      <div className="bg-lx-parchment border-b border-lx-line pt-[68px]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 text-[10.5px] text-lx-stone">
          <Link href="/" className="hover:text-lx-ink transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/propiedades" className="hover:text-lx-ink transition-colors">Propiedades</Link>
          <span>/</span>
          <span className="text-lx-ink truncate max-w-[220px]">{property.address}</span>
        </div>
      </div>

      {/* ── GALLERY ────────────────────────────────────── */}
      {photos.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 sm:py-6">
            <PropertyGallery photos={photos} title={property.address} />
          </div>
        </section>
      )}

      {/* ── CONTENIDO ──────────────────────────────────── */}
      <PropertyDetailClient
        property={property}
        stats={stats}
        description={description}
        tags={tags}
        operationLabel={operationLabel}
        priceLabel={priceLabel}
        neighborhood={neighborhood}
        propertyType={propertyType}
        coordinates={coordinates}
        isRent={isRent}
        similarProperties={similarProperties}
      />

    </main>
  )
}
