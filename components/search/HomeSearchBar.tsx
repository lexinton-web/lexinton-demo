'use client'

/**
 * HomeSearchBar — Buscador del hero con layout ZonaProp.
 *
 * Fila 1: tabs Alquilar | Comprar | Emprendimientos
 * Fila 2: [Tipo v] [Barrio dropdown] [BUSCAR]
 *
 * Redirige a /propiedades con los mismos searchParams que espera esa página.
 */

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const TABS = [
  { value: 'Sale',            label: 'Comprar',         op: 'Sale' },
  { value: 'Rent',            label: 'Alquilar',        op: 'Rent' },
  { value: 'Emprendimientos', label: 'Emprendimientos', op: null },
] as const

const TYPES = [
  { value: '',   label: 'Cualquier tipo' },
  { value: '2',  label: 'Departamento' },
  { value: '3',  label: 'Casa' },
  { value: '13', label: 'PH' },
  { value: '7',  label: 'Local Comercial' },
  { value: '5',  label: 'Oficina' },
  { value: '1',  label: 'Terreno' },
  { value: '10', label: 'Cochera' },
]

const PRIORITY_GROUPS = [
  { label: 'Palermo',  matches: ['Palermo', 'Palermo Soho', 'Palermo Hollywood', 'Palermo Chico'] },
  { label: 'Belgrano', matches: ['Belgrano', 'Belgrano C', 'Belgrano R', 'Belgrano Barrancas'] },
  { label: 'Nuñez',   matches: ['Nuñez'] },
  { label: 'Recoleta', matches: ['Recoleta'] },
]
const ALL_PRIORITY_NAMES = PRIORITY_GROUPS.flatMap((g) => g.matches)

interface LocItem { id: number; name: string }

// ── Inline Popover ────────────────────────────────────────────────────────────
function Popover({
  open, anchorRef, onClose, children,
}: {
  open: boolean
  anchorRef: React.RefObject<HTMLDivElement>
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onMouse = (e: MouseEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, anchorRef, onClose])

  if (!open) return null
  return (
    <div className="absolute left-0 top-[calc(100%+6px)] z-[60] w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function HomeSearchBar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['value']>('Sale')
  const [typeValue, setTypeValue] = useState('')

  // Barrio state
  const [barrioOpen, setBarrioOpen] = useState(false)
  const [barrioQ, setBarrioQ] = useState('')
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locations, setLocations] = useState<LocItem[]>([])
  const [locLoading, setLocLoading] = useState(false)
  const barrioRef = useRef<HTMLDivElement>(null)

  // Load locations once on open
  useEffect(() => {
    if (!barrioOpen || locations.length > 0) return
    setLocLoading(true)
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data: LocItem[]) => setLocations(data))
      .catch(() => {})
      .finally(() => setLocLoading(false))
  }, [barrioOpen, locations.length])

  const filteredLocs = barrioQ
    ? locations.filter((l) => l.name.toLowerCase().includes(barrioQ.toLowerCase()))
    : locations
  const restLocs = locations
    .filter((l) => !ALL_PRIORITY_NAMES.some((m) => m.toLowerCase() === l.name.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))

  function groupLocationIds(group: typeof PRIORITY_GROUPS[0]) {
    return locations
      .filter((l) => group.matches.some((m) => m.toLowerCase() === l.name.toLowerCase()))
      .map((l) => l.id)
  }
  function selectGroup(group: typeof PRIORITY_GROUPS[0]) {
    const ids = groupLocationIds(group)
    setLocationId(ids.join(','))
    setLocationName(group.label)
    setBarrioQ(''); setBarrioOpen(false)
  }

  const handleSearch = () => {
    if (activeTab === 'Emprendimientos') { router.push('/emprendimientos'); return }
    const p = new URLSearchParams()
    p.set('operation', activeTab)
    if (typeValue) p.set('type', typeValue)
    if (locationId) { p.set('location', locationId); p.set('location_name', locationName) }
    router.push(`/propiedades?${p.toString()}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-visible">

        {/* ── Fila 1: Tabs ──────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100 rounded-t-2xl overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={[
                'flex-1 py-4 text-sm font-medium transition-colors duration-150',
                activeTab === tab.value
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Fila 2: Tipo + Barrio + Botón ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">

          {/* Select de tipo */}
          <div className="relative sm:flex-shrink-0">
            <label htmlFor="home-property-type" className="sr-only">Tipo de propiedad</label>
            <select
              id="home-property-type"
              value={typeValue}
              onChange={(e) => setTypeValue(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl
                px-4 py-3 pr-8 text-sm text-gray-700 w-full sm:min-w-[150px]
                focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </div>

          {/* Barrio dropdown */}
          <div ref={barrioRef} className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setBarrioOpen((v) => !v)}
              className={[
                'w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm transition-colors',
                barrioOpen ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300',
                locationName ? 'text-gray-900' : 'text-gray-400',
              ].join(' ')}
            >
              <span className="truncate">{locationName || 'Barrio o zona...'}</span>
              <svg className={`w-3.5 h-3.5 ml-2 text-gray-400 shrink-0 transition-transform ${barrioOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>

            <Popover open={barrioOpen} anchorRef={barrioRef} onClose={() => setBarrioOpen(false)}>
              <div className="p-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-2 focus-within:border-[#C41230] transition-colors">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    autoFocus
                    placeholder="Buscar barrio..."
                    value={barrioQ}
                    onChange={(e) => setBarrioQ(e.target.value)}
                    className="flex-1 text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {locLoading && <p className="text-[12px] text-gray-400 text-center py-4">Cargando barrios...</p>}
                  {!locLoading && locationName && (
                    <button type="button"
                      onClick={() => { setLocationId(''); setLocationName(''); setBarrioQ(''); setBarrioOpen(false) }}
                      className="w-full text-left px-3 py-2 text-[12.5px] text-[#C41230] hover:bg-red-50 rounded-lg transition-colors mb-1"
                    >
                      × Limpiar selección
                    </button>
                  )}
                  {!locLoading && filteredLocs.length === 0 && barrioQ && (
                    <p className="text-[12px] text-gray-400 text-center py-4">Sin resultados</p>
                  )}
                  {!barrioQ && PRIORITY_GROUPS.map((group) => (
                    <button key={group.label} type="button"
                      onClick={() => selectGroup(group)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[12.5px] rounded-lg transition-colors ${
                        locationName === group.label
                          ? 'bg-red-50 text-[#C41230] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{group.label}</span>
                    </button>
                  ))}
                  {!barrioQ && PRIORITY_GROUPS.length > 0 && <div className="my-2 border-t border-gray-100" />}
                  {(barrioQ ? filteredLocs : restLocs).map((l) => (
                    <button key={l.id} type="button"
                      onClick={() => {
                        setLocationId(String(l.id))
                        setLocationName(l.name)
                        setBarrioQ(''); setBarrioOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-[12.5px] rounded-lg transition-colors ${
                        locationId === String(l.id)
                          ? 'bg-red-50 text-[#C41230] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </Popover>
          </div>

          {/* Botón Buscar */}
          <button
            type="button"
            onClick={handleSearch}
            className="w-full sm:flex-shrink-0 sm:w-auto bg-[#C41230] text-white
              px-5 py-3 rounded-xl text-sm font-semibold
              flex items-center justify-center gap-2
              hover:bg-[#a30f28] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </div>
  )
}
