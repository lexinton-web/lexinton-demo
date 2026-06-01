/**
 * Tokko Broker API — Utilidades y helpers
 *
 * Todas las funciones son puras (sin side effects) y pueden usarse
 * tanto en Server Components como en Client Components.
 */

import type { TokkoProperty, TokkoOperation, TokkoPhoto, TokkoTag, TokkoLocation, TokkoDevelopment } from './types'

// ─── Traducciones ────────────────────────────────────────────────────────────

/** Traducción de operation_type (API en inglés) → español para mostrar */
export const OPERATION_LABELS: Record<string, string> = {
  Sale: 'Venta',
  Rent: 'Alquiler',
  'Temporary Rent': 'Alquiler Temporal',
}

/** Traducción de property type name (API en inglés) → español */
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  Apartment: 'Departamento',
  Department: 'Departamento',
  House: 'Casa',
  Condo: 'PH',
  Office: 'Oficina',
  'Bussiness Premises': 'Local',
  'Business Premises': 'Local',
  Store: 'Local',
  Land: 'Terreno',
  Garage: 'Cochera',
  'Industrial Ship': 'Galpón',
  'Commercial Building': 'Edificio',
  Building: 'Edificio',
  'Office Building': 'Edificio de oficinas',
  'Residential Building': 'Edificio residencial',
  'Mixed Use': 'Uso mixto',
  Commercial: 'Comercial',
  Storage: 'Depósito',
  Warehouse: 'Depósito',
  'Storage room': 'Baulera',
  Hotel: 'Hotel',
  Farm: 'Granja',
  Ranch: 'Campo',
  Countryside: 'Country',
  'Weekend House': 'Quinta',
}

/** Traducción de property_condition → español */
export const CONDITION_LABELS: Record<string, string> = {
  Excellent: 'Excelente',
  'Very good': 'Muy bueno',
  Good: 'Bueno',
  Regular: 'Regular',
  Poor: 'Malo',
  '---': '',
}

/** Traducción de credit_eligible → etiqueta */
export const CREDIT_LABELS: Record<string, string> = {
  Eligible: 'Apto crédito',
  'Not eligible': 'No apto crédito',
  'Not specified': '',
}

// ─── Precios ─────────────────────────────────────────────────────────────────

/**
 * Formatea un precio para mostrar en pantalla.
 * Si price === 0, devuelve "Consultar".
 *
 * @example formatPrice(92000, 'USD') → "USD 92.000"
 * @example formatPrice(1500000, 'ARS') → "$ 1.500.000"
 * @example formatPrice(0, 'USD') → "Consultar"
 */
export function formatPrice(price: number | string | null | undefined, currency: string): string {
  const num = typeof price === 'string' ? parseFloat(price) : (price ?? 0)
  if (!num || isNaN(num) || num === 0) return 'Consultar'

  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)

  if (currency === 'USD') return `USD ${formatted}`
  if (currency === 'ARS') return `$ ${formatted}`
  if (currency === 'EUR') return `€ ${formatted}`
  return `${currency} ${formatted}`
}

/**
 * Formatea gastos de expensas.
 * @example formatExpenses(150000) → "$ 150.000/mes"
 */
export function formatExpenses(expenses: number | string | null | undefined): string {
  const num = typeof expenses === 'string' ? parseFloat(expenses) : (expenses ?? 0)
  if (!num || isNaN(num) || num === 0) return ''
  return `$ ${new Intl.NumberFormat('es-AR').format(num)}/mes`
}

// ─── Superficies ──────────────────────────────────────────────────────────────

/**
 * Formatea área en m².
 * @example formatArea(73.5) → "73,5 m²"
 * @example formatArea(73) → "73 m²"
 */
export function formatArea(area: number | string | null | undefined): string {
  const num = typeof area === 'string' ? parseFloat(area) : (area ?? 0)
  if (!num || isNaN(num)) return ''
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1)
  return `${formatted} m²`
}

// ─── Extracción de datos de propiedad ─────────────────────────────────────────

/**
 * Extrae la operación principal de una propiedad.
 * Prioriza Venta > Alquiler > Temporal.
 */
export function getPrimaryOperation(property: TokkoProperty): TokkoOperation | null {
  if (!property.operations || !Array.isArray(property.operations)) {
    // La API puede devolver un objeto en vez de array en algunos endpoints
    const op = property.operations as unknown as TokkoOperation
    if (op && op.operation_type) return op
    return null
  }
  if (property.operations.length === 0) return null

  const priority = ['Sale', 'Rent', 'Temporary Rent']
  const sorted = [...property.operations].sort(
    (a, b) => priority.indexOf(a.operation_type) - priority.indexOf(b.operation_type)
  )
  return sorted[0]
}

/**
 * Extrae el precio principal de una operación.
 * Prioriza USD > ARS > EUR.
 */
export function getPrimaryPrice(operation: TokkoOperation): { price: number; currency: string } | null {
  if (!operation.prices || operation.prices.length === 0) return null

  const priorityCurrency = ['USD', 'ARS', 'EUR']
  const sorted = [...operation.prices].sort(
    (a, b) => priorityCurrency.indexOf(a.currency) - priorityCurrency.indexOf(b.currency)
  )
  return { price: sorted[0].price, currency: sorted[0].currency }
}

/**
 * Obtiene el string de precio formateado listo para mostrar.
 * @example "USD 92.000" | "$ 1.500.000/mes" | "Consultar"
 */
export function getPropertyPriceLabel(property: TokkoProperty): string {
  const op = getPrimaryOperation(property)
  if (!op) return 'Consultar'
  const priceData = getPrimaryPrice(op)
  if (!priceData) return 'Consultar'

  const label = formatPrice(priceData.price, priceData.currency)

  // Agregar "/mes" para alquileres
  if (op.operation_type === 'Rent' && priceData.price > 0) return `${label}/mes`
  if (op.operation_type === 'Temporary Rent' && priceData.price > 0) return `${label}/mes`

  return label
}

/**
 * Obtiene la etiqueta de operación en español.
 * @example "Venta" | "Alquiler" | "Alquiler Temporal"
 */
export function getOperationLabel(property: TokkoProperty): string {
  const op = getPrimaryOperation(property)
  if (!op) return ''
  return OPERATION_LABELS[op.operation_type] ?? op.operation_type
}

// ─── Fotos ────────────────────────────────────────────────────────────────────

/**
 * Obtiene la foto de portada (is_front_cover: true) o la primera foto.
 * Retorna la URL de la imagen watermarked (apta para web).
 */
export function getCoverPhoto(property: TokkoProperty): string | null {
  if (!property.photos || property.photos.length === 0) {
    return null
  }

  const sorted = [...property.photos].sort((a, b) => a.order - b.order)
  const cover = sorted.find((p) => p.is_front_cover) ?? sorted[0]
  // Normalize to https — Tokko sometimes serves http:// URLs
  return cover.image.replace(/^http:\/\//i, 'https://')
}

/**
 * Obtiene todas las fotos ordenadas (portada primero, planos al final).
 */
export function getSortedPhotos(property: TokkoProperty): TokkoPhoto[] {
  if (!property.photos || property.photos.length === 0) return []

  return [...property.photos]
    .filter((p) => p.image && typeof p.image === 'string')
    .sort((a, b) => {
      // Planos siempre al final
      if (a.is_blueprint && !b.is_blueprint) return 1
      if (!a.is_blueprint && b.is_blueprint) return -1
      // Portada primero
      if (a.is_front_cover && !b.is_front_cover) return -1
      if (!a.is_front_cover && b.is_front_cover) return 1
      return a.order - b.order
    })
    .map((p) => ({ ...p, image: p.image.replace(/^http:\/\//i, 'https://') }))
}

// ─── Ubicación ────────────────────────────────────────────────────────────────

/**
 * Extrae el nombre del barrio desde el location object.
 * Ejemplo: "Belgrano", "Palermo"
 */
export function getNeighborhood(property: TokkoProperty): string {
  if (!property.location || typeof property.location === 'string') return ''
  return property.location.name ?? ''
}

/**
 * Extrae solo la ciudad/zona (sin el barrio específico).
 * Ejemplo: "Capital Federal", "Saavedra"
 */
export function getCity(property: TokkoProperty): string {
  if (!property.location || typeof property.location === 'string') return ''
  const parts = property.location.full_location?.split('|') ?? []
  return parts[1]?.trim() ?? 'Buenos Aires'
}

// ─── Amenities / Tags ─────────────────────────────────────────────────────────

/**
 * Mapeo de nombres de tags en inglés → etiquetas en español para mostrar
 */
export const TAG_LABELS: Record<string, string> = {
  // Servicios básicos
  Water: 'Agua',
  Sewage: 'Cloacas',
  Electricity: 'Luz eléctrica',
  Gas: 'Gas',
  'Natural Gas': 'Gas natural',
  Pavement: 'Pavimento',
  'Public lighting': 'Iluminación pública',
  'Public Lighting': 'Iluminación pública',
  // Ascensores
  Lift: 'Ascensor',
  Elevator: 'Ascensor',
  'Service Lift': 'Montacargas',
  'Cargo lift': 'Montacargas',
  // Espacios exteriores
  Balcony: 'Balcón',
  'Balcony terrace': 'Terraza balcón',
  Terrace: 'Terraza',
  Garden: 'Jardín',
  Backyard: 'Patio',
  Deck: 'Deck',
  Solarium: 'Solarium',
  Gallery: 'Galería',
  // Piscina / wellness
  Pool: 'Piscina',
  'Heated Pool': 'Piscina climatizada',
  Jacuzzi: 'Jacuzzi',
  Sauna: 'Sauna',
  'Scottish shower': 'Ducha escocesa',
  // Deporte / recreación
  Gym: 'Gimnasio',
  "Children's game room": 'Sala de juegos infantil',
  'Game room': 'Sala de juegos',
  'Mini-cinema': 'Microcine',
  // SUM / social
  SUM: 'SUM',
  'SUM/Salón': 'SUM',
  'Dining lounge': 'Salón comedor',
  'Diary dining': 'Comedor diario',
  Restaurant: 'Restaurante',
  Barbecue: 'Parrilla',
  'Barbecue area': 'Área de parrilla',
  'Communal BBQ Area': 'Parrilla común',
  // Cochera
  Garage: 'Cochera',
  'Fixed garage': 'Cochera fija',
  'Courtesy garage': 'Cochera de cortesía',
  'Optional parking': 'Cochera opcional',
  Parking: 'Estacionamiento',
  'Parking space': 'Lugar de estacionamiento',
  // Lavadero
  Laundry: 'Lavadero privado',
  'Public Laundry': 'Lavadero común',
  // Calefacción / agua
  Heating: 'Calefacción',
  'Central Heating': 'Calefacción central',
  'Air Heating': 'Calefacción por aire',
  'Individual heating': 'Calefacción individual',
  'Floor Heating': 'Piso radiante',
  'General radiant floor heating': 'Piso radiante general',
  'Central boiler': 'Caldera central',
  'Individual boiler': 'Caldera individual',
  Heater: 'Calefactor',
  'Central Water Heating': 'Calentador de agua central',
  'Individual hot water': 'Agua caliente individual',
  'Individual hot water tank': 'Termotanque individual',
  'Hot water by electricity': 'Agua caliente eléctrica',
  'Hot water by gas': 'Agua caliente a gas',
  // Aire acondicionado
  'Individual Air conditioner': 'Aire acondicionado individual',
  'central air conditioning': 'Aire acondicionado central',
  'Air Conditioning': 'Aire acondicionado',
  'Pre-installed Air-Conditioning': 'Pre-instalación de AC',
  // Seguridad
  '24 Hour Security': 'Seguridad 24 hs',
  'Night security': 'Seguridad nocturna',
  'Private Security Company': 'Seguridad privada',
  'Video Cameras': 'Cámaras de seguridad',
  'Access control': 'Control de acceso',
  'Reinforced door': 'Puerta blindada',
  Alarm: 'Alarma',
  'Safe Box': 'Caja fuerte',
  Security: 'Seguridad',
  Superintendent: 'Encargado',
  // Características edilicias
  Luminous: 'Luminoso',
  'Free perimeter building': 'Edificio de perímetro libre',
  'Semi-floor': 'Semipiso',
  'Independent Studio': 'Monoambiente independiente',
  'Private hallway': 'Pasillo privado',
  Hall: 'Hall',
  Toilette: 'Toilette',
  Kitchen: 'Cocina',
  Kitchenette: 'Kitchenette',
  Dresser: 'Vestidor',
  // Dependencias
  Dependency: 'Dependencia de servicio',
  'Service entrance': 'Entrada de servicio',
  'Service bathroom': 'Baño de servicio',
  'Storage room': 'Baulera',
  Storage: 'Depósito',
  // Terminaciones
  'Wood Flooring': 'Pisos de madera',
  Fireplace: 'Chimenea',
  Furniture: 'Amoblado',
  // Usos
  'Work able': 'Apto profesional',
  'Commercial able': 'Apto comercial',
  Office: 'Oficina',
  // Mascotas
  'Pets allowed': 'Acepta mascotas',
  'Pets Allowed': 'Acepta mascotas',
  // Misc
  Generator: 'Grupo electrogénero',
  'Accessibility With Reduced Mobility': 'Acceso para movilidad reducida',
  'Immediate deed': 'Escritura inmediata',
  'Brand new': 'A estrenar',
  // Emprendimientos
  'Aluminium Carpentry': 'Carpintería de aluminio',
  Amenities: 'Amenities',
  'Automatic garage door': 'Portón automático',
  Cable: 'Cable',
  'Double Glazing': 'Doble vidrio',
  'Double glazing windows': 'Ventanas de doble vidrio',
  'Gas Storage': 'Depósito de gas',
  'Good Rental Potential': 'Buen potencial de alquiler',
  'Industrial power': 'Energía trifásica',
  'Newly Built': 'Recién construído',
  Phone: 'Teléfono',
  'Trifasic energy': 'Energía trifásica',
}

/**
 * Filtra tags que valen la pena mostrar al usuario (excluye servicios básicos).
 * Devuelve máximo N tags.
 */
export function getDisplayTags(tags: TokkoTag[], max = 8): TokkoTag[] {
  // Excluir servicios básicos de infraestructura urbana (type: 1)
  const EXCLUDED_TAG_IDS = [1, 2, 5, 6, 7] // Water, Sewage, Electricity, Pavement, Gas
  return tags
    .filter((t) => !EXCLUDED_TAG_IDS.includes(t.id))
    .slice(0, max)
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

/**
 * Genera un slug para la URL de la propiedad.
 * Formato: {id}-{direccion-kebab}
 *
 * @example slugify(19554, "TAMBORINI JOSE P. 3700") → "19554-tamborini-jose-p-3700"
 */
export function makePropertySlug(id: number, address: string): string {
  const addressSlug = address
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')     // solo alfanumérico y guiones
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return `${id}-${addressSlug}`
}

/**
 * Extrae el ID numérico de un slug.
 * @example parseSlugId("19554-tamborini-jose") → 19554
 */
export function parseSlugId(slug: string): number {
  const id = parseInt(slug.split('-')[0], 10)
  if (isNaN(id)) throw new Error(`Slug inválido: ${slug}`)
  return id
}

// ─── Tipo ─────────────────────────────────────────────────────────────────────

/**
 * Traduce el nombre del tipo de propiedad al español.
 */
export function getPropertyTypeLabel(property: TokkoProperty): string {
  if (!property.type) return ''
  return PROPERTY_TYPE_LABELS[property.type.name] ?? property.type.name
}

// ─── Descripción ──────────────────────────────────────────────────────────────

/**
 * Limpia la descripción: remueve el "footer" repetitivo de la agencia
 * que aparece en TODAS las propiedades (WhatsApp, matrícula, etc.)
 */
export function cleanDescription(description: string): string {
  if (!description) return ''

  const FOOTER_MARKERS = [
    'Consulta por esta propiedad AHORA.',
    'Consulta por esta propiedad AHORA!',
    'VENDE y COMPRA con LEXINTON',
    'WhatsApp: 1131519928',
  ]

  let cleanText = description

  // Cortar todo lo que viene desde el primer marcador de footer
  for (const marker of FOOTER_MARKERS) {
    const idx = cleanText.indexOf(marker)
    if (idx > -1) {
      cleanText = cleanText.slice(0, idx).trim()
      break
    }
  }

  // Si no quedó texto real (la descripción empezaba directo con el footer),
  // devolver vacío — la UI ocultará la sección correctamente
  if (cleanText.length < 20) return ''

  return cleanText
}

/**
 * Devuelve colores y etiqueta para el badge de operación.
 * Sale → verde, Rent → azul, Temporary Rent → ámbar
 */
export function getOperationBadgeStyle(operationType: string): { bg: string; text: string; label: string } {
  const op = operationType ?? ''
  if (op === 'Sale') return { bg: '#16a34a', text: '#ffffff', label: 'Venta' }
  if (op === 'Temporary Rent') return { bg: '#d97706', text: '#ffffff', label: 'Temporal' }
  if (op === 'Rent') return { bg: '#2563eb', text: '#ffffff', label: 'Alquiler' }
  return { bg: '#6b7280', text: '#ffffff', label: op }
}

/**
 * Obtiene los primeros N caracteres de la descripción limpia.
 */
export function getDescriptionExcerpt(property: TokkoProperty, maxLength = 120): string {
  const clean = cleanDescription(property.description)
  if (clean.length <= maxLength) return clean
  return clean.slice(0, maxLength).trim() + '…'
}

// ─── Antigüedad ───────────────────────────────────────────────────────────────

/**
 * Formatea la antigüedad de manera legible.
 */
export function formatAge(age: number | null): string {
  if (age === null || age === undefined) return ''
  if (age === 0) return 'A estrenar'
  if (age === 1) return '1 año'
  return `${age} años`
}

// ─── Coordenadas ─────────────────────────────────────────────────────────────

/**
 * Extrae coordenadas válidas de una propiedad.
 * Tokko las devuelve como strings, pueden estar vacías o en formato incorrecto.
 */
export function getCoordinates(property: TokkoProperty): { lat: number; lng: number } | null {
  const lat = parseFloat(property.geo_lat ?? '')
  const lng = parseFloat(property.geo_long ?? '')
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null
  return { lat, lng }
}

// ─── Development → Property adapter ──────────────────────────────────────────

const CONSTRUCTION_STATUS_LABELS: Record<number, string> = {
  0: 'En pozo',
  1: 'En construcción',
  2: 'Terminado',
  3: 'Entrega inmediata',
}

/**
 * Adapta un TokkoDevelopment al formato TokkoProperty para poder reutilizar
 * los mismos componentes de detalle de propiedad en páginas de emprendimientos.
 */
export function developmentToProperty(dev: TokkoDevelopment): TokkoProperty {
  // Normalizar fotos — la API devuelve TokkoPhoto[] pero sin algunos campos opcionales
  const photos: TokkoPhoto[] = Array.isArray(dev.photos)
    ? dev.photos.map((p, i) => ({
        description: (p as TokkoPhoto & { description?: string }).description ?? null,
        image: p.image.replace(/^http:\/\//i, 'https://'),
        original: ((p as TokkoPhoto & { original?: string }).original ?? p.image).replace(/^http:\/\//i, 'https://'),
        thumb: ((p as TokkoPhoto & { thumb?: string }).thumb ?? p.image).replace(/^http:\/\//i, 'https://'),
        is_front_cover: i === 0,
        is_blueprint: false,
        order: i,
      }))
    : []

  const tags: TokkoTag[] = Array.isArray(dev.tags) ? dev.tags as TokkoTag[] : []
  const statusLabel = CONSTRUCTION_STATUS_LABELS[dev.construction_status]

  return {
    id: dev.id,
    reference_code: dev.reference_code ?? '',
    publication_title: dev.publication_title || dev.name,
    address: dev.address || dev.fake_address || dev.name,
    fake_address: dev.fake_address ?? '',
    real_address: '',
    address_complement: '',
    type: dev.type
      ? { id: dev.type.id, code: dev.type.code, name: dev.type.name }
      : { id: 0, code: 'DEV', name: 'Emprendimiento' },
    // construction_status encoded as property_condition so it shows in the stats bar
    property_condition: statusLabel ?? '',
    disposition: '',
    orientation: '',
    floor: '',
    floors_amount: 0,
    appartments_per_floor: 0,
    surface: null,
    roofed_surface: null,
    semiroofed_surface: null,
    unroofed_surface: null,
    total_surface: null,
    surface_measurement: 'M2',
    room_amount: null,
    suite_amount: null,
    bathroom_amount: null,
    toilet_amount: null,
    parking_lot_amount: null,
    covered_parking_lot: 0,
    uncovered_parking_lot: 0,
    expenses: 0,
    web_price: false,
    credit_eligible: 'Not specified',
    down_payment: 0,
    age: null,
    location: dev.location,
    geo_lat: dev.geo_lat,
    geo_long: dev.geo_long,
    gm_location_type: '',
    operations: [],
    photos,
    videos: [],
    files: [],
    tags,
    custom_tags: [],
    extra_attributes: [],
    description: dev.description ?? '',
    rich_description: '',
    description_only: '',
    footer: '',
    seo_description: '',
    seo_keywords: '',
    development: null,
    producer: null,
    created_at: '',
    deleted_at: dev.deleted_at,
    status: 2,
    is_starred_on_web: dev.is_starred_on_web,
    is_denounced: false,
    legally_checked: '',
    public_url: dev.web_url ?? '',
    situation: '',
    dining_room: 0,
    living_amount: 0,
    tv_rooms: 0,
    guests_amount: 0,
    has_temporary_rent: false,
    internal_data: '',
  } as unknown as TokkoProperty
}
