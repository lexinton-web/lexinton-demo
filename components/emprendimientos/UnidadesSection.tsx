'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { makePropertySlug } from '@/lib/tokko/utils'
import type { TokkoProperty } from '@/lib/tokko/types'

type TokkoUnit = TokkoProperty

function getOpLabel(opType: string): string {
  const t = opType.toLowerCase()
  if (t.includes('sale')) return 'venta'
  if (t.includes('temporary')) return 'temporal'
  if (t.includes('rent')) return 'alquiler'
  return opType
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'USD') return `USD ${price.toLocaleString('es-AR')}`
  return `$ ${price.toLocaleString('es-AR')}`
}

function UnitCard({ unit }: { unit: TokkoUnit }) {
  const photo = unit.photos?.[0]?.image
  const title = unit.publication_title || unit.address || unit.fake_address || 'Sin título'
  const surface = unit.surface || unit.roofed_surface
  const totalSurface = unit.total_surface
  const bathrooms = unit.bathroom_amount
  const typeName = typeof unit.type === 'object' ? unit.type?.name : null

  // First price from first operation
  const firstOp = unit.operations?.[0]
  const firstPrice = firstOp?.prices?.[0]

  const href = `/propiedades/${makePropertySlug(unit.id, unit.fake_address || unit.address || '')}`

  return (
    <Link
      href={href}
      className="group border border-gray-200 rounded-xl overflow-hidden
        hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white"
    >
      {/* Foto */}
      <div className="relative h-32 bg-gray-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {typeName && (
          <p className="text-[10px] font-semibold text-[#C41230] uppercase tracking-wide mb-1">
            {typeName}
          </p>
        )}
        {firstPrice && (
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(firstPrice.price, firstPrice.currency)}
          </p>
        )}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-gray-500 mt-1">
          {surface && <span>{surface}m² cub.</span>}
          {totalSurface && totalSurface !== surface && <span>{totalSurface}m² tot.</span>}
          {bathrooms != null && bathrooms > 0 && (
            <span>{bathrooms} {bathrooms === 1 ? 'baño' : 'baños'}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

interface Props {
  units: TokkoUnit[]
}

export function UnidadesSection({ units }: Props) {
  // Only Apartments (filter out offices, warehouses, etc.)
  const apartments = units.filter(u => {
    const typeName = (typeof u.type === 'object' ? u.type?.name : '') ?? ''
    return !typeName || typeName === 'Apartment' || typeName === 'Condo'
  })

  const displayUnits = apartments.length > 0 ? apartments : units
  if (!displayUnits || displayUnits.length === 0) return null

  // Group by room_amount
  const byRooms: Record<string, TokkoUnit[]> = {}
  displayUnits.forEach(unit => {
    const r = unit.room_amount
    const key = r && r > 0 ? `${r} Amb.` : 'Sin especificar'
    if (!byRooms[key]) byRooms[key] = []
    byRooms[key].push(unit)
  })

  // Sort tabs: numeric first, then 'Sin especificar'
  const tabs = Object.keys(byRooms).sort((a, b) => {
    const na = parseInt(a), nb = parseInt(b)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    if (!isNaN(na)) return -1
    if (!isNaN(nb)) return 1
    return 0
  })

  const [activeTab, setActiveTab] = useState(tabs[0])
  const unitsInTab = byRooms[activeTab] ?? []

  // Separate by operation type
  const ventas = unitsInTab.filter(u =>
    u.operations?.some(op => op.operation_type?.toLowerCase().includes('sale'))
  )
  const alquileres = unitsInTab.filter(u =>
    u.operations?.some(op => {
      const t = op.operation_type?.toLowerCase()
      return t?.includes('rent') && !t?.includes('temporary')
    })
  )
  const temporales = unitsInTab.filter(u =>
    u.operations?.some(op => op.operation_type?.toLowerCase().includes('temporary'))
  )
  // Units that don't match any above
  const otros = unitsInTab.filter(u =>
    !ventas.includes(u) && !alquileres.includes(u) && !temporales.includes(u)
  )

  function Group({ label, items }: { label: string; items: TokkoUnit[] }) {
    if (items.length === 0) return null
    return (
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
          {label} / {items.length} {items.length === 1 ? 'unidad' : 'unidades'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(unit => <UnitCard key={unit.id} unit={unit} />)}
        </div>
      </div>
    )
  }

  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Unidades disponibles
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({displayUnits.length} en total)
        </span>
      </h2>

      {/* Tabs por ambientes */}
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTab === tab
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <Group label="En venta" items={ventas} />
      <Group label="En alquiler" items={alquileres} />
      <Group label="Alquiler temporal" items={temporales} />
      <Group label="Disponibles" items={otros} />
    </section>
  )
}
