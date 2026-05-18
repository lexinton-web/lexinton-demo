/**
 * /emprendimientos/[id] - Detalle de un emprendimiento
 *
 * Reutiliza los mismos componentes que /propiedades/[id]:
 * PropertyGallery + PropertyDetailClient
 * Los datos se adaptan con developmentToProperty().
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getDevelopmentById, getDevelopments, getDevelopmentUnits } from '@/lib/tokko/queries'
import {
  developmentToProperty,
  getSortedPhotos, getPropertyTypeLabel,
  cleanDescription, getDisplayTags, getCoordinates,
  getNeighborhood, CONDITION_LABELS, parseSlugId, makePropertySlug,
} from '@/lib/tokko/utils'
import { PropertyGallery } from '@/components/properties/PropertyGallery'
import PropertyDetailClient from '@/components/properties/PropertyDetailClient'
import { UnidadesSection } from '@/components/emprendimientos/UnidadesSection'

export const revalidate = 300

const CONSTRUCTION_STATUS_LABELS: Record<number, string> = {
  0: 'En pozo',
  1: 'En construcción',
  2: 'Terminado',
  3: 'Entrega inmediata',
}

interface PageProps {
  params: { id: string }
}

/* Static params */
export async function generateStaticParams() {
  const devs = await getDevelopments()
  return devs.map((d) => ({ id: makePropertySlug(d.id, d.fake_address || d.address || d.name || '') }))
}

/* Metadata */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dev = await getDevelopmentById(parseSlugId(params.id))
  if (!dev) return { title: 'Emprendimiento | Lexinton' }
  const title = dev.publication_title || dev.name
  const description = cleanDescription(dev.description ?? '').slice(0, 155)
  const photos = Array.isArray(dev.photos) ? dev.photos : []
  const cover = photos[0]?.image ?? null
  return {
    title: `${title} . Emprendimiento | Lexinton`,
    description: description || `Emprendimiento ${title} en ${dev.location?.name ?? 'Buenos Aires'}.`,
    alternates: { canonical: `https://lexinton.com.ar/emprendimientos/${params.id}` },
    openGraph: {
      title: `${title} - Lexinton Propiedades`,
      description: description || '',
      images: cover ? [{ url: cover, alt: title }] : [],
      type: 'website',
    },
  }
}

/* Page */
export default async function EmprendimientoDetallePage({ params }: PageProps) {
  const dev = await getDevelopmentById(parseSlugId(params.id))
  if (!dev) notFound()

  // Fetch units in parallel
  const units = await getDevelopmentUnits(dev.id)

  const property = developmentToProperty(dev)
  const photos = getSortedPhotos(property)
  const coordinates = getCoordinates(property)
  const description = cleanDescription(property.description ?? '')
  const tags = getDisplayTags(property.tags ?? [], 12)
  const neighborhood = getNeighborhood(property)
  const propertyType = getPropertyTypeLabel(property) || 'Emprendimiento'
  const condition = CONDITION_LABELS[property.property_condition ?? ''] ?? property.property_condition

  const stats: { label: string; value: string | number }[] = []
  if (dev.type?.name) stats.push({ label: 'Tipo', value: propertyType })
  if (condition) stats.push({ label: 'Estado de obra', value: condition })
  if (dev.location?.name) stats.push({ label: 'Barrio', value: dev.location.name })

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-lx-parchment border-b border-lx-line pt-[68px]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 text-[10.5px] text-lx-stone">
          <Link href="/" className="hover:text-lx-ink transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/emprendimientos" className="hover:text-lx-ink transition-colors">Emprendimientos</Link>
          <span>/</span>
          <span className="text-lx-ink truncate max-w-[220px]">{dev.publication_title || dev.name}</span>
        </div>
      </div>

      {photos.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 sm:py-6">
            <PropertyGallery photos={photos} title={dev.publication_title || dev.name} />
          </div>
        </section>
      )}

      <PropertyDetailClient
        property={property}
        stats={stats}
        description={description}
        tags={tags}
        operationLabel="Emprendimiento"
        priceLabel=""
        neighborhood={neighborhood}
        propertyType={propertyType}
        coordinates={coordinates}
        isRent={false}
        similarProperties={[]}
        constructionStatus={CONSTRUCTION_STATUS_LABELS[dev.construction_status] ?? ''}
        unitsSlot={units.length > 0 ? (
          <UnidadesSection units={units} />
        ) : undefined}
      />
    </main>
  )
}
