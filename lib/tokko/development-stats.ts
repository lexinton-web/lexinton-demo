/**
 * development-stats.ts — Calculate display stats for an emprendimiento
 * from its Tokko development object + fetched units array.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DevelopmentStats {
  constructionStatus: string | null
  deliveryDate: string | null
  totalUnits: number
  minPrice: number | null
  maxPrice: number | null
  priceCurrency: string
  priceOpType: string
  minTotalSurface: number | null
  maxTotalSurface: number | null
  minRoofedSurface: number | null
  maxRoofedSurface: number | null
  minRooms: number | null
  maxRooms: number | null
  minBathrooms: number | null
  maxBathrooms: number | null
  hasGarages: boolean
  hasToilettes: boolean
}

// Tokko returns construction_status as integer: 1=En pozo, 2=En construcción, 3=Terminado, 4=Entrega inmediata
const STATUS_LABELS: Record<string, string> = {
  '1': 'En pozo',
  '2': 'En construcción',
  '3': 'Terminado',
  '4': 'Entrega inmediata',
  // string variants (just in case)
  'in_project': 'En proyecto',
  'under_construction': 'En construcción',
  'finished': 'Terminado',
  'pre_sale': 'Preventa',
}

export function calcDevelopmentStats(
  development: any,
  units: any[]
): DevelopmentStats {
  const statusRaw = development.construction_status
  const constructionStatus = statusRaw != null ? (STATUS_LABELS[String(statusRaw)] ?? null) : null

  // Delivery date — check multiple fields
  const deliveryRaw =
    development.delivery_date ||
    development.estimated_delivery ||
    development.construction_end_date ||
    development.delivery_year ||
    null

  let deliveryDate: string | null = null
  if (deliveryRaw) {
    const str = String(deliveryRaw)
    if (/^\d{4}$/.test(str)) {
      deliveryDate = str
    } else if (str.includes('-')) {
      const date = new Date(str)
      if (!isNaN(date.getTime())) {
        const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
        deliveryDate = `${months[date.getMonth()]} ${date.getFullYear()}`
      }
    }
  }

  const validUnits = (units || []).filter(u => u && typeof u === 'object')
  const totalUnits = validUnits.length

  // Surfaces — room_amount and bathroom_amount are the correct fields
  const totals = validUnits.map(u => u.surface || u.total_surface).filter(Boolean).map(Number)
  const roofed = validUnits.map(u => u.roofed_surface).filter(Boolean).map(Number)
  const rooms  = validUnits.map(u => u.room_amount).filter(v => v != null && v > 0).map(Number)
  const baths  = validUnits.map(u => u.bathroom_amount).filter(v => v != null && v > 0).map(Number)

  // Prices — skip placeholders (≤ 1)
  const allPrices: { price: number; currency: string; opType: string }[] = []
  validUnits.forEach(u => {
    ;(u.operations || []).forEach((op: any) => {
      ;(op.prices || []).forEach((p: any) => {
        const val = Number(p.price)
        if (val > 1) {
          allPrices.push({ price: val, currency: p.currency || 'USD', opType: op.operation_type || '' })
        }
      })
    })
  })

  const ventaPrices = allPrices.filter(p =>
    p.opType.toLowerCase().includes('sale') || p.opType.toLowerCase().includes('venta')
  )
  const rentPrices = allPrices.filter(p =>
    p.opType.toLowerCase().includes('rent') || p.opType.toLowerCase().includes('alquiler')
  )
  const pricesToUse = ventaPrices.length > 0 ? ventaPrices : rentPrices
  const priceOpType = ventaPrices.length > 0 ? 'Venta' : 'Alquiler'

  return {
    constructionStatus,
    deliveryDate,
    totalUnits,
    minPrice: pricesToUse.length > 0 ? Math.min(...pricesToUse.map(p => p.price)) : null,
    maxPrice: pricesToUse.length > 0 ? Math.max(...pricesToUse.map(p => p.price)) : null,
    priceCurrency: pricesToUse[0]?.currency || 'USD',
    priceOpType,
    minTotalSurface: totals.length > 0 ? Math.min(...totals) : null,
    maxTotalSurface: totals.length > 0 ? Math.max(...totals) : null,
    minRoofedSurface: roofed.length > 0 ? Math.min(...roofed) : null,
    maxRoofedSurface: roofed.length > 0 ? Math.max(...roofed) : null,
    minRooms: rooms.length > 0 ? Math.min(...rooms) : null,
    maxRooms: rooms.length > 0 ? Math.max(...rooms) : null,
    minBathrooms: baths.length > 0 ? Math.min(...baths) : null,
    maxBathrooms: baths.length > 0 ? Math.max(...baths) : null,
    hasGarages: validUnits.some(u => u.garages != null && Number(u.garages) > 0),
    hasToilettes: validUnits.some(u => u.toilettes != null && Number(u.toilettes) > 0),
  }
}

export function formatRange(
  min: number | null,
  max: number | null,
  suffix = ''
): string | null {
  if (min === null) return null
  if (max === null || min === max) return `${min}${suffix}`
  return `${min} a ${max}${suffix}`
}

export function formatStatPrice(price: number, currency: string): string {
  if (currency === 'USD') return `USD ${price.toLocaleString('es-AR')}`
  return `$ ${price.toLocaleString('es-AR')}`
}
