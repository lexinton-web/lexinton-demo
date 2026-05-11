/**
 * /propiedades — Listado completo con filtros y paginación.
 *
 * Arquitectura: un único fetch de Tokko en `PropertyContent`.
 * Los resultados se pasan a `PropertySearch` (totalCount) y al grid.
 * Eso evita doble fetch y permite mostrar el contador de resultados en la barra.
 *
 * URL params: operation, type, location, location_name,
 *             minRooms, minPrice, maxPrice, currency, orderBy, offset
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import PropertyCard, { PropertyCardSkeleton } from '@/components/PropertyCard'
import PropertySearch from '@/components/properties/PropertySearch'
import { PropertyListingClient } from '@/components/properties/PropertyListingClient'
import { getProperties } from '@/lib/tokko/queries'
import type { PropertyFilters } from '@/lib/tokko/types'

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const hasFilters = !!(
    searchParams.operation || searchParams.minRooms || searchParams.type ||
    searchParams.location || searchParams.minPrice || searchParams.maxPrice
  )
  const opLabel =
    searchParams.operation === 'Sale' ? 'en Venta' :
    searchParams.operation === 'Rent' ? 'en Alquiler' :
    'en Venta y Alquiler'

  return {
    title: `Propiedades ${opLabel} | Lexinton Propiedades`,
    description:
      'Encontrá tu próxima propiedad en Lexinton. Departamentos, casas, PHs y locales ' +
      'en Palermo, Belgrano, Villa Urquiza, Coghlan y toda Capital Federal.',
    alternates: { canonical: 'https://lexinton.com.ar/propiedades' },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: {
    operation?: string
    type?: string
    location?: string
    location_name?: string
    minRooms?: string
    maxRooms?: string
    minPrice?: string
    maxPrice?: string
    currency?: string
    offset?: string
    orderBy?: string
  }
}

const ITEMS_PER_PAGE = 24

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFilters(sp: PageProps['searchParams']): PropertyFilters {
  const filters: PropertyFilters = {
    limit: ITEMS_PER_PAGE,
    offset: sp.offset ? parseInt(sp.offset, 10) : 0,
  }
  const op = sp.operation
  if (op === 'Sale' || op === 'Rent' || op === 'Temporary rent') filters.operation = op as PropertyFilters['operation']
  if (sp.type) filters.propertyType = parseInt(sp.type, 10)
  if (sp.location) {
    if (sp.location.includes(',')) {
      filters.locationIds = sp.location.split(',').map((id) => parseInt(id, 10)).filter(Boolean)
    } else {
      filters.locationId = parseInt(sp.location, 10)
    }
  }
  if (sp.minRooms) filters.minRooms = parseInt(sp.minRooms, 10)
  if (sp.maxRooms) filters.maxRooms = parseInt(sp.maxRooms, 10)
  if (sp.minPrice) filters.minPrice = parseInt(sp.minPrice, 10)
  if (sp.maxPrice) filters.maxPrice = parseInt(sp.maxPrice, 10)
  const cur = sp.currency
  if (cur === 'USD' || cur === 'ARS') filters.currency = cur
  const ord = sp.orderBy
  if (ord === 'price_asc' || ord === 'price_desc' || ord === 'newest' || ord === 'oldest') {
    filters.orderBy = ord
  }
  return filters
}

function buildPageUrl(params: PageProps['searchParams'], offset: number): string {
  const p = new URLSearchParams()
  if (params.operation) p.set('operation', params.operation)
  if (params.type) p.set('type', params.type)
  if (params.location) p.set('location', params.location)
  if (params.location_name) p.set('location_name', params.location_name)
  if (params.minRooms) p.set('minRooms', params.minRooms)
  if (params.minPrice) p.set('minPrice', params.minPrice)
  if (params.maxPrice) p.set('maxPrice', params.maxPrice)
  if (params.currency) p.set('currency', params.currency)
  if (params.orderBy) p.set('orderBy', params.orderBy)
  if (offset > 0) p.set('offset', String(offset))
  return `/propiedades?${p.toString()}`
}

// ─── Server Components ───────────────────────────────────────────────────────

/**
 * Componente principal de datos: hace UN fetch y renderiza
 * la barra de búsqueda (con totalCount) + el grid de propiedades.
 */
async function PropertyContent({ searchParams }: PageProps) {
  const filters = buildFilters(searchParams)
  const { properties, total } = await getProperties(filters)

  const currentOffset = filters.offset ?? 0
  const hasMore = currentOffset + ITEMS_PER_PAGE < total
  const hasPrev = currentOffset > 0

  return (
    <>
      {/* Barra de búsqueda sticky — recibe total para mostrarlo inline */}
      <PropertySearch totalCount={total} />

      {/* Contenido del listado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">

        {/* Empty state */}
        {properties.length === 0 && (
          <div className="text-center py-20 sm:py-28">
            <p className="font-serif text-2xl text-lx-stone mb-2">
              Sin resultados para esos filtros.
            </p>
            <p className="text-sm text-lx-stone/60 mb-8">
              Probá cambiando la operación, el tipo o el barrio.
            </p>
            <a
              href="/propiedades"
              className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-lx-accent border-b border-lx-accent/40 hover:border-lx-accent transition-colors pb-0.5"
            >
              Ver todas las propiedades
            </a>
          </div>
        )}

        {/* Toggle de vistas + listado */}
        {properties.length > 0 && (
          <PropertyListingClient
            properties={properties}
            total={total}
            currentOffset={currentOffset}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}

        {/* Paginación — al final del listado */}
        {(hasPrev || hasMore) && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-10 sm:mt-14 pt-8 border-t border-lx-line">
            {hasPrev && (
              <a
                href={buildPageUrl(searchParams, Math.max(0, currentOffset - ITEMS_PER_PAGE))}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[10.5px] font-bold tracking-[0.14em] uppercase border border-lx-line text-lx-stone hover:text-lx-ink hover:border-lx-stone transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Anterior
              </a>
            )}

            <span className="text-[11px] text-lx-stone tabular-nums">
              Página {Math.floor(currentOffset / ITEMS_PER_PAGE) + 1} de {Math.ceil(total / ITEMS_PER_PAGE)}
            </span>

            {hasMore && (
              <a
                href={buildPageUrl(searchParams, currentOffset + ITEMS_PER_PAGE)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[10.5px] font-bold tracking-[0.14em] uppercase border border-lx-line text-lx-stone hover:text-lx-ink hover:border-lx-stone transition-colors"
              >
                Siguiente
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            )}
          </div>
        )}

      </div>
    </>
  )
}

/** Skeleton mostrado mientras se carga PropertyContent */
function PageSkeleton() {
  return (
    <>
      {/* Skeleton de la barra de búsqueda */}
      <div className="bg-lx-cream border-b border-lx-line sticky top-0 z-30 h-[52px] animate-pulse" />
      {/* Skeleton del grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="h-4 w-48 bg-lx-line rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PropiedadesPage({ searchParams }: PageProps) {
  const opTitle =
    searchParams.operation === 'Sale' ? 'Propiedades en Venta' :
    searchParams.operation === 'Rent' ? 'Propiedades en Alquiler' :
    'Todas las Propiedades'

  return (
    <main className="min-h-screen bg-lx-parchment">

      {/* Hero header — estático, siempre visible */}
      <div className="bg-[#f5f5f5] border-b border-gray-200 pt-[calc(68px+3.5rem)] pb-12 sm:pt-[calc(68px+4.5rem)] sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#C41230] mb-3">
            Lexinton Propiedades
          </p>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-normal text-gray-900 leading-[1.1] tracking-[-0.01em]">
            {opTitle}
          </h1>
        </div>
      </div>

      {/* Buscador + listado — un único Suspense para compartir datos */}
      <Suspense fallback={<PageSkeleton />}>
        <PropertyContent searchParams={searchParams} />
      </Suspense>

    </main>
  )
}
