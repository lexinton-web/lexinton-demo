/**
 * Tokko Broker API — Queries reutilizables
 *
 * Todas las funciones son server-side (importan tokkoFetch que usa la API key).
 * Usar solo desde Server Components, Route Handlers o getStaticProps/generateStaticParams.
 *
 * Endpoints utilizados:
 *   GET /property/            → listado (params: limit, offset, lang)
 *   GET /property/{id}/       → detalle individual
 *   GET /property_type/       → tipos de propiedad (cache largo)
 *   GET /location/            → barrios/zonas (cache largo)
 *   GET /development/         → emprendimientos
 *   POST /web_contact/        → envío de lead al CRM
 *
 * Nota sobre filtros de la API:
 *   La API de Tokko no filtra correctamente por operation_type en el listado.
 *   El filtro se hace post-fetch en el lado del servidor de Next.js.
 *   Para listas grandes, implementar paginación en el cliente.
 */

import { tokkoFetch, tokkoPost } from './client'
import type {
  TokkoProperty,
  TokkoPropertyListResponse,
  TokkoPropertyTypeListResponse,
  TokkoLocationListResponse,
  TokkoDevelopmentListResponse,
  TokkoDevelopment,
  PropertyFilters,
  TokkoLeadPayload,
} from './types'

// ─── Constantes ──────────────────────────────────────────────────────────────

/** ID del estado Capital Federal en la API de Tokko */
const CABA_STATE_ID = 146

/** Máximo de propiedades por request (límite de Tokko: ≤ 100 recomendado) */
const DEFAULT_LIMIT = 24

// ─── Propiedades ─────────────────────────────────────────────────────────────

/**
 * Obtiene el listado de propiedades con filtros aplicados server-side.
 *
 * La API de Tokko devuelve 171 propiedades.
 * Filtros de operación, tipo y precio se aplican post-fetch.
 */
export async function getProperties(
  filters: PropertyFilters = {},
  revalidate = 300
): Promise<{ properties: TokkoProperty[]; total: number }> {
  try {
  return await _getProperties(filters, revalidate)
  } catch (err) {
    console.error('[getProperties] Tokko fetch failed, returning empty:', err)
    return { properties: [], total: 0 }
  }
}

async function _getProperties(
  filters: PropertyFilters = {},
  revalidate = 300
): Promise<{ properties: TokkoProperty[]; total: number }> {
  const {
    operation,
    propertyType,
    locationId,
    locationIds,
    minRooms,
    maxRooms,
    minPrice,
    maxPrice,
    currency,
    limit = DEFAULT_LIMIT,
    offset = 0,
    orderBy = 'newest',
  } = filters

  // Params que la API acepta nativamente
  const apiParams: Record<string, string | number | boolean> = {}

  // Para múltiples ubicaciones, usar la primera para la API y filtrar las demás post-fetch
  const primaryLocationId = locationIds?.length ? locationIds[0] : locationId
  if (primaryLocationId) {
    apiParams['current_localization_id'] = primaryLocationId
    apiParams['current_localization_type'] = 'location'
  }

  // Traer TODAS las propiedades para filtrar server-side.
  // Tokko no filtra correctamente por operación, así que hacemos
  // Fetch en lotes de 35 para que cada respuesta quede bajo el límite de 2MB
  // del data cache de Next.js. Con limit=100, las respuestas son 3-4MB y
  // Next.js no las cachea → cada request golpea Tokko en frío.
  // 35 props × ~44KB/prop = ~1.54MB → bajo el límite de 2MB del data cache
  const BATCH = 35

  const r1 = await tokkoFetch<TokkoPropertyListResponse>(
    'property',
    { limit: BATCH, offset: 0, ...apiParams },
    revalidate
  )
  const totalInApi = r1.meta?.total_count ?? r1.objects.length
  let allObjects: TokkoProperty[] = [...r1.objects]

  // Fetch lotes adicionales en secuencia para no saturar la API de Tokko.
  // Con respuestas < 2MB, Next.js cachea cada lote → solo el primer request
  // en frío es lento; los siguientes 5 min se sirven desde cache.
  if (totalInApi > BATCH) {
    const remaining = Math.ceil((totalInApi - BATCH) / BATCH)
    for (let i = 1; i <= remaining; i++) {
      const batch = await tokkoFetch<TokkoPropertyListResponse>(
        'property',
        { limit: BATCH, offset: BATCH * i, ...apiParams },
        revalidate
      )
      allObjects = [...allObjects, ...(batch?.objects ?? [])]
    }
  }

  let filtered = allObjects

  // Filtro por ubicación (post-fetch)
  if (locationIds && locationIds.length > 0) {
    filtered = filtered.filter((p) => p.location?.id != null && locationIds.includes(p.location.id))
  } else if (locationId) {
    filtered = filtered.filter((p) => p.location?.id === locationId)
  }

  // Filtro por operación (Sale, Rent)
  if (operation) {
    filtered = filtered.filter((p) => {
      const ops = Array.isArray(p.operations) ? p.operations : [p.operations]
      return ops.some((op) => op && op.operation_type === operation)
    })
  }

  // Filtro por tipo de propiedad
  if (propertyType) {
    filtered = filtered.filter((p) => p.type?.id === propertyType)
  }

  // Filtro por ambientes
  if (minRooms !== undefined) {
    filtered = filtered.filter((p) => (p.room_amount ?? 0) >= minRooms)
  }
  if (maxRooms !== undefined) {
    filtered = filtered.filter((p) => (p.room_amount ?? 0) <= maxRooms)
  }

  // Filtro por precio
  if (minPrice !== undefined || maxPrice !== undefined) {
    filtered = filtered.filter((p) => {
      const ops = Array.isArray(p.operations) ? p.operations : [p.operations]
      return ops.some((op) => {
        if (!op) return false
        return op.prices?.some((pr) => {
          if (currency && pr.currency !== currency) return false
          if (minPrice && pr.price < minPrice) return false
          if (maxPrice && pr.price > maxPrice) return false
          return true
        })
      })
    })
  }

  const total = filtered.length

  // Ordenamiento post-fetch (la API no acepta order_by)
  if (orderBy === 'price_asc') {
    filtered.sort((a, b) => {
      const pa = a.operations?.[0]?.prices?.[0]?.price ?? 0
      const pb = b.operations?.[0]?.prices?.[0]?.price ?? 0
      return pa - pb
    })
  } else if (orderBy === 'price_desc') {
    filtered.sort((a, b) => {
      const pa = a.operations?.[0]?.prices?.[0]?.price ?? 0
      const pb = b.operations?.[0]?.prices?.[0]?.price ?? 0
      return pb - pa
    })
  } else if (orderBy === 'oldest') {
    filtered.sort((a, b) => a.id - b.id)
  } else {
    // newest (default): IDs desc — IDs más altos son más recientes en Tokko
    filtered.sort((a, b) => b.id - a.id)
  }

  // Paginación del resultado filtrado
  const paginated = filtered.slice(offset, offset + limit)

  return { properties: paginated, total }
} // end _getProperties

/**
 * Obtiene el detalle completo de una propiedad por ID.
 * lang=es es necesario para que Tokko devuelva la descripción real
 * en lugar de solo el footer de la agencia.
 */
export async function getPropertyById(id: number, revalidate = 300): Promise<TokkoProperty | null> {
  try {
    return await tokkoFetch<TokkoProperty>(`property/${id}`, { lang: 'es' }, revalidate)
  } catch {
    return null
  }
}

/**
 * Obtiene propiedades destacadas para la home.
 * Si no hay propiedades con is_starred_on_web, toma las más recientes.
 */
export async function getFeaturedProperties(limit = 6): Promise<TokkoProperty[]> {
  const response = await tokkoFetch<TokkoPropertyListResponse>(
    'property',
    { limit: 50 },
    600
  )

  // IDs más altos = más recientes en Tokko
  const sorted = [...response.objects].sort((a, b) => b.id - a.id)
  const starred = sorted.filter((p) => p.is_starred_on_web)

  if (starred.length >= limit) {
    return starred.slice(0, limit)
  }

  // Complementar con las más recientes si no hay suficientes destacadas
  const rest = sorted.filter((p) => !p.is_starred_on_web)
  return [...starred, ...rest].slice(0, limit)
}

/**
 * Obtiene propiedades similares a una dada.
 *
 * Lógica de filtrado inteligente:
 * 1. Misma operación (Sale/Rent) — obligatorio
 * 2. Mismo barrio/zona — preferido
 * 3. Precio ±30% — preferido
 * 4. Mismo tipo de propiedad — bonus
 *
 * Fallback: si no hay suficientes con zona+precio, relajar a solo operación+tipo.
 */
export async function getSimilarProperties(
  property: TokkoProperty,
  limit = 3
): Promise<TokkoProperty[]> {
  try {
    // Fetch en lotes de 35 (< 2MB c/u → cacheable por Next.js)
    const SIM_BATCH = 35
    const r1 = await tokkoFetch<TokkoPropertyListResponse>(
      'property',
      { limit: SIM_BATCH, offset: 0 },
      300
    )
    const totalInApi = r1.meta?.total_count ?? r1.objects.length
    let allProps = [...r1.objects]
    if (totalInApi > SIM_BATCH) {
      const remaining = Math.ceil((totalInApi - SIM_BATCH) / SIM_BATCH)
      for (let i = 1; i <= remaining; i++) {
        const batch = await tokkoFetch<TokkoPropertyListResponse>(
          'property',
          { limit: SIM_BATCH, offset: SIM_BATCH * i },
          300
        )
        allProps = [...allProps, ...(batch?.objects ?? [])]
      }
    }

    // Exclude the current property
    const candidates = allProps.filter((p) => p.id !== property.id)

    // Determine current property's operation and price
    const currentOps = Array.isArray(property.operations) ? property.operations : [property.operations]
    const currentOp = currentOps[0]
    const currentOpType = currentOp?.operation_type ?? ''
    const currentPrice = currentOp?.prices?.[0]?.price ?? 0
    const currentCurrency = currentOp?.prices?.[0]?.currency ?? 'USD'
    const locationId = property.location?.id
    const typeId = property.type?.id

    // Helper: get primary price of a property
    const getPrice = (p: TokkoProperty) => {
      const ops = Array.isArray(p.operations) ? p.operations : [p.operations]
      const matchingOp = ops.find((op) => op?.operation_type === currentOpType)
      const price = matchingOp?.prices?.find((pr) => pr.currency === currentCurrency)
      return price?.price ?? 0
    }

    // Helper: check same operation type
    const sameOp = (p: TokkoProperty) => {
      const ops = Array.isArray(p.operations) ? p.operations : [p.operations]
      return ops.some((op) => op?.operation_type === currentOpType)
    }

    // Filter 1: same operation (mandatory)
    const sameOperation = candidates.filter(sameOp)

    // Score each candidate
    const scored = sameOperation.map((p) => {
      let score = 0
      if (p.location?.id === locationId) score += 3   // same zone
      if (p.type?.id === typeId) score += 2            // same type
      if (currentPrice > 0) {
        const price = getPrice(p)
        if (price > 0) {
          const ratio = price / currentPrice
          if (ratio >= 0.7 && ratio <= 1.3) score += 2  // within ±30%
        }
      }
      return { property: p, score }
    })

    // Sort by score desc, then by ID desc (newest first)
    scored.sort((a, b) => b.score - a.score || b.property.id - a.property.id)

    return scored.slice(0, limit).map((s) => s.property)
  } catch {
    return []
  }
}

/**
 * Obtiene los IDs de propiedades para generateStaticParams.
 * Trae todas las propiedades para pre-renderizar las más visitadas.
 */
export async function getAllPropertyIds(): Promise<number[]> {
  const IDS_BATCH = 35
  const r1 = await tokkoFetch<TokkoPropertyListResponse>(
    'property',
    { limit: IDS_BATCH, offset: 0 },
    3600
  )
  const total = r1.meta?.total_count ?? r1.objects.length
  let ids = r1.objects.map((p) => p.id)
  if (total > IDS_BATCH) {
    const remaining = Math.ceil((total - IDS_BATCH) / IDS_BATCH)
    for (let i = 1; i <= remaining; i++) {
      const batch = await tokkoFetch<TokkoPropertyListResponse>(
        'property',
        { limit: IDS_BATCH, offset: IDS_BATCH * i },
        3600
      )
      ids = [...ids, ...(batch?.objects.map((p) => p.id) ?? [])]
    }
  }
  return ids
}

// ─── Tipos de propiedad ───────────────────────────────────────────────────────

/**
 * Obtiene todos los tipos de propiedad (cache de 1 hora — cambian raramente).
 */
export async function getPropertyTypes() {
  const response = await tokkoFetch<TokkoPropertyTypeListResponse>(
    'property_type',
    { limit: 50 },
    3600
  )
  return response.objects
}

// ─── Ubicaciones ─────────────────────────────────────────────────────────────

/**
 * Obtiene los barrios de Capital Federal filtrados por estado.
 * Cache largo (1 hora) porque cambian muy poco.
 */
export async function getLocations(stateId = CABA_STATE_ID) {
  const response = await tokkoFetch<TokkoLocationListResponse>(
    'location',
    {
      limit: 100,
      state: stateId,
    },
    3600
  )
  return response.objects
}

/**
 * Devuelve únicamente los barrios/zonas donde Lexinton tiene propiedades reales.
 * Se construye haciendo fetch de todas las propiedades y extrayendo los
 * location únicos — así el buscador solo muestra opciones que tienen resultados.
 * Cache de 10 minutos.
 */
export async function getPropertyLocations() {
  const LOC_BATCH = 35
  const r1 = await tokkoFetch<TokkoPropertyListResponse>(
    'property',
    { limit: LOC_BATCH, offset: 0 },
    600
  )
  const total = r1.meta?.total_count ?? r1.objects.length
  let allObjects = [...r1.objects]
  if (total > LOC_BATCH) {
    const remaining = Math.ceil((total - LOC_BATCH) / LOC_BATCH)
    for (let i = 1; i <= remaining; i++) {
      const batch = await tokkoFetch<TokkoPropertyListResponse>(
        'property',
        { limit: LOC_BATCH, offset: LOC_BATCH * i },
        600
      )
      allObjects = [...allObjects, ...(batch?.objects ?? [])]
    }
  }

  // Extract unique non-null locations
  const seen = new Set<number>()
  const locations = []
  for (const p of allObjects) {
    if (p.location && !seen.has(p.location.id)) {
      seen.add(p.location.id)
      locations.push(p.location)
    }
  }

  // Sort alphabetically by name
  locations.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return locations
}

// ─── Emprendimientos ──────────────────────────────────────────────────────────

/**
 * Obtiene los emprendimientos activos (5 en la cuenta de Lexinton).
 * Filtra por display_on_web y al menos una foto para evitar items vacíos.
 * Excluye entradas internas (e.g. dirección "TASACIONES") que son herramientas
 * del CRM, no emprendimientos reales.
 */
export async function getDevelopments() {
  const response = await tokkoFetch<TokkoDevelopmentListResponse>(
    'development',
    { limit: 20, lang: 'es' },
    600
  )
  return response.objects.filter((d) => {
    if (!d.display_on_web) return false
    const photos = Array.isArray(d.photos) ? d.photos : []
    if (photos.length === 0) return false
    const name = (d.name ?? '').trim()
    if (name.length < 3) return false
    // Excluir entradas internas del CRM (e.g. "TASACIONES")
    const addr = (d.address || d.fake_address || '').toLowerCase()
    if (addr.includes('tasacion')) return false
    if (name.toLowerCase().includes('tasacion')) return false
    if (name.toLowerCase().includes('qr')) return false
    return true
  })
}

/**
 * Obtiene el detalle completo de un emprendimiento por ID.
 */
export async function getDevelopmentById(id: number): Promise<TokkoDevelopment | null> {
  try {
    return await tokkoFetch<TokkoDevelopment>(`development/${id}`, { lang: 'es' }, 300)
  } catch {
    return null
  }
}

/**
 * Obtiene las unidades (propiedades) asociadas a un emprendimiento.
 * Endpoint correcto: /property/?development=DEV_ID
 * (el parámetro es "development", no "development_id")
 */
export async function getDevelopmentUnits(devId: number): Promise<TokkoProperty[]> {
  try {
    const res = await tokkoFetch<TokkoPropertyListResponse>(
      'property',
      { development: devId, lang: 'es', limit: 100 },
      300
    )
    return res?.objects ?? []
  } catch {
    return []
  }
}

// ─── Leads / Contacto ─────────────────────────────────────────────────────────

/**
 * Envía un lead al CRM de Tokko.
 * Aparece directamente en el panel de Tokko del cliente.
 *
 * POST /api/v1/web_contact/
 * Body: { property: ID, name, email, phone, text }
 */
export async function submitPropertyLead(data: TokkoLeadPayload): Promise<{ success: boolean }> {
  try {
    await tokkoPost('web_contact', {
      property: data.property_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      text: data.message,
      ...(data.development_id ? { development: data.development_id } : {}),
    })
    return { success: true }
  } catch (error) {
    console.error('[Tokko] Error enviando lead:', error)
    return { success: false }
  }
}
