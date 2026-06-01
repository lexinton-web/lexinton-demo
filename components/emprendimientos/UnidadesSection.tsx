'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { makePropertySlug } from '@/lib/tokko/utils'
import type { TokkoProperty } from '@/lib/tokko/types'
import { ContactModal } from '@/components/properties/ContactModal'

type TokkoUnit = TokkoProperty

/** Pick the best displayable price — skip ARS ≤ 1 placeholders, prefer USD */
function getBestPrice(unit: TokkoUnit): { price: number; currency: string } | null {
  const candidates: { price: number; currency: string }[] = []
  for (const op of unit.operations ?? []) {
    for (const p of op.prices ?? []) {
      const val = Number(p.price)
      if (val > 1) candidates.push({ price: val, currency: p.currency ?? 'USD' })
    }
  }
  if (candidates.length === 0) return null
  return candidates.find(c => c.currency === 'USD') ?? candidates[0]
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'USD') return `USD ${price.toLocaleString('es-AR')}`
  return `$ ${price.toLocaleString('es-AR')}`
}

function UnitCard({ unit }: { unit: TokkoUnit }) {
  const [showContact, setShowContact] = useState(false)
  const photo = unit.photos?.[0]?.image
  const typeName = typeof unit.type === 'object' ? unit.type?.name : null
  const bestPrice = getBestPrice(unit)
  const surface = unit.surface || unit.total_surface
  const bathrooms = unit.bathroom_amount
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const garages = (unit as any).garages as number | undefined
  const href = `/propiedades/${makePropertySlug(unit.id, unit.fake_address || unit.address || '')}`

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full">
        {/* Foto */}
        <Link href={href} className="flex-shrink-0">
          <div className="relative h-32 bg-gray-100 overflow-hidden">
            {photo ? (
              <Image
                src={photo}
                alt={unit.fake_address || unit.address || ''}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
                unoptimized
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
        </Link>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[10px] font-semibold text-[#C41230] uppercase tracking-wide mb-1">
            {typeName || 'Departamento'}
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {bestPrice ? formatPrice(bestPrice.price, bestPrice.currency) : 'Consultar precio'}
          </p>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-gray-500 mt-1">
            {surface != null && surface > 0 && <span>{surface}m² tot.</span>}
            {unit.roofed_surface != null && unit.roofed_surface > 0 && unit.roofed_surface !== surface && (
              <span>{unit.roofed_surface}m² cub.</span>
            )}
            {bathrooms != null && bathrooms > 0 && (
              <span>{bathrooms} {bathrooms === 1 ? 'baño' : 'baños'}</span>
            )}
            {garages != null && garages > 0 && <span>{garages} coch.</span>}
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowContact(true)}
            className="mt-3 w-full h-10 bg-[#374151] text-white rounded-lg
              flex items-center justify-center gap-2 text-sm font-medium
              hover:bg-[#1f2937] transition-colors"
          >
            Contactar
          </button>
        </div>
      </div>

      <ContactModal
        open={showContact}
        onClose={() => setShowContact(false)}
        property={unit}
      />
    </>
  )
}

interface Props {
  units: TokkoUnit[]
}

export function UnidadesSection({ units }: Props) {
  if (!units || units.length === 0) return null

  // Group by room_amount — full word "Ambiente/Ambientes"
  const byRooms: Record<string, TokkoUnit[]> = {}
  units.forEach(unit => {
    const r = unit.room_amount
    const key = r != null && r > 0
      ? `${r} ${r === 1 ? 'Ambiente' : 'Ambientes'}`
      : 'Sin especificar'
    if (!byRooms[key]) byRooms[key] = []
    byRooms[key].push(unit)
  })

  // Sort tabs numerically
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
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
          ({units.length} en total)
        </span>
      </h2>

      {/* Tabs — underline style ZonaProp */}
      {tabs.length > 1 && (
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
