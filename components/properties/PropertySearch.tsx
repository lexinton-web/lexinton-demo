'use client'

/**
 * PropertySearch — Barra de búsqueda estilo ZonaProp para /propiedades
 *
 * Layout desktop: pill-container único con filtros en fila
 *   [Barrio] | [Comprar/Alquilar] | [Tipo] | [Amb|Dorm] | [Precio] | [+ Filtros]
 * Layout mobile: pill compacto + drawer desde abajo
 * Panel lateral "Más filtros": superficie, ordenar, cocheras
 * Chips de filtros activos debajo de la barra
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  useCallback, useState, useTransition, useEffect, useRef, type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type DropKey = 'barrio' | 'operation' | 'type' | 'rooms' | 'price' | null

interface LocItem { id: number; name: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES = [
  { value: '2',  label: 'Departamento' },
  { value: '3',  label: 'Casa' },
  { value: '13', label: 'PH' },
  { value: '7',  label: 'Local Comercial' },
  { value: '5',  label: 'Oficina' },
  { value: '1',  label: 'Terreno' },
  { value: '10', label: 'Cochera' },
]

const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPES.map((t) => [t.value, t.label]))

const ROOM_OPTS = ['1', '2', '3', '4', '5+']

const ORDERS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(min: string, max: string, cur: string) {
  const f = (v: string) => {
    const n = parseInt(v, 10)
    if (isNaN(n)) return ''
    return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
      : n >= 1_000 ? `${Math.round(n / 1_000)}k` : String(n)
  }
  const a = f(min), b = f(max), c = cur || 'USD'
  if (a && b) return `${c} ${a}–${b}`
  if (a) return `${c} +${a}`
  if (b) return `${c} hasta ${b}`
  return ''
}

// ─── PillBtn ──────────────────────────────────────────────────────────────────

function PillBtn({
  label, active = false, open = false, onClick, noChevron = false,
}: {
  label: string; active?: boolean; open?: boolean; onClick: () => void; noChevron?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 select-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#C41230] focus-visible:ring-offset-1',
        active
          ? 'border border-[#C41230] text-[#C41230]'
          : 'border border-gray-200 text-gray-700 hover:border-gray-400',
      ].join(' ')}
    >
      {label}
      {!noChevron && (
        <svg
          className={`w-3.5 h-3.5 opacity-60 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      )}
    </button>
  )
}

// ─── Popover ──────────────────────────────────────────────────────────────────

function Popover({
  open, anchorRef, onClose, children, align = 'left', width = 'w-72',
}: {
  open: boolean
  anchorRef: React.RefObject<HTMLDivElement>
  onClose: () => void
  children: ReactNode
  align?: 'left' | 'right'
  width?: string
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as number[] } }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
          className={[
            'absolute top-[calc(100%+8px)] z-50',
            'bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden',
            align === 'right' ? 'right-0' : 'left-0',
            width,
          ].join(' ')}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── PopFooter ────────────────────────────────────────────────────────────────

function PopFooter({ onClear, onApply }: { onClear: () => void; onApply: () => void }) {
  return (
    <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
      <button
        type="button" onClick={onClear}
        className="flex-1 py-2 rounded-full border border-gray-200 text-[12px] font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-colors"
      >
        Limpiar
      </button>
      <button
        type="button" onClick={onApply}
        className="flex-1 py-2 rounded-full bg-[#C41230] text-white text-[12px] font-semibold hover:bg-[#a00f27] transition-colors"
      >
        Aplicar
      </button>
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.12 }}
      className="inline-flex items-center gap-1 h-7 pl-3 pr-1.5 text-[#C41230] text-[12px] font-medium rounded-full border border-[#C41230]/30 bg-red-50"
    >
      {label}
      <button
        type="button" onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center hover:bg-[#C41230]/15 rounded-full transition-colors"
        aria-label={`Quitar ${label}`}
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { totalCount?: number }

export default function PropertySearch({ totalCount }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [openDrop,  setOpenDrop]  = useState<DropKey>(null)
  const [moreOpen,  setMoreOpen]  = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const barrioRef = useRef<HTMLDivElement>(null!)
  const opRef     = useRef<HTMLDivElement>(null!)
  const typeRef   = useRef<HTMLDivElement>(null!)
  const roomsRef  = useRef<HTMLDivElement>(null!)
  const priceRef  = useRef<HTMLDivElement>(null!)

  // ── URL state ──────────────────────────────────────────────────────────────
  const cur = {
    operation:    sp.get('operation')     ?? '',
    type:         sp.get('type')          ?? '',
    location:     sp.get('location')      ?? '',
    locationName: sp.get('location_name') ?? '',
    minRooms:     sp.get('minRooms')      ?? '',
    minBeds:      sp.get('minBeds')       ?? '',
    minPrice:     sp.get('minPrice')      ?? '',
    maxPrice:     sp.get('maxPrice')      ?? '',
    currency:     sp.get('currency')      ?? 'USD',
    orderBy:      sp.get('orderBy')       ?? 'newest',
    minSurface:   sp.get('minSurface')    ?? '',
    maxSurface:   sp.get('maxSurface')    ?? '',
  }

  // Multi-barrio: parse comma-separated location IDs from URL
  const selectedIds: number[] = cur.location
    ? cur.location.split(',').map(Number).filter(Boolean)
    : []

  function locationNameById(id: number): string {
    return locations.find(l => l.id === id)?.name ?? String(id)
  }

  // Pre-load locations on mount if barrios are already in URL
  useEffect(() => {
    if (selectedIds.length > 0) loadLocations()
  }, [cur.location]) // eslint-disable-line react-hooks/exhaustive-deps

  // Draft states
  const [dMin,     setDMin]     = useState(cur.minPrice)
  const [dMax,     setDMax]     = useState(cur.maxPrice)
  const [dCur,     setDCur]     = useState(cur.currency)
  const [dType,    setDType]    = useState(cur.type)
  const [dMinSurf, setDMinSurf] = useState(cur.minSurface)
  const [dMaxSurf, setDMaxSurf] = useState(cur.maxSurface)

  // Barrio state
  const [barrioQ,   setBarrioQ]   = useState('')
  const [locations, setLocations] = useState<LocItem[]>([])
  const [locLoaded, setLocLoaded] = useState(false)
  const [locLoading, setLocLoading] = useState(false)

  useEffect(() => {
    setDMin(sp.get('minPrice') ?? '')
    setDMax(sp.get('maxPrice') ?? '')
    setDCur(sp.get('currency') ?? 'USD')
    setDType(sp.get('type') ?? '')
    setDMinSurf(sp.get('minSurface') ?? '')
    setDMaxSurf(sp.get('maxSurface') ?? '')
  }, [sp])

  useEffect(() => {
    document.body.style.overflow = (drawerOpen || moreOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, moreOpen])

  const push = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(updates)) v ? p.set(k, v) : p.delete(k)
    p.delete('offset')
    startTransition(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }))
  }, [router, pathname, sp])

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }))
    setOpenDrop(null); setMoreOpen(false); setDrawerOpen(false)
  }, [router, pathname])

  const loadLocations = useCallback(async () => {
    if (locLoaded) return
    setLocLoading(true)
    try {
      const res  = await fetch('/api/locations')
      const data = await res.json()
      setLocations(data.locations ?? data ?? [])
      setLocLoaded(true)
    } catch { /* ignore */ }
    finally { setLocLoading(false) }
  }, [locLoaded])

  const toggle = (key: DropKey) => {
    if (key === 'barrio') loadLocations()
    if (key === 'type')   setDType(cur.type)
    setOpenDrop((p) => p === key ? null : key)
  }

  const applyPrice = () => {
    push({ minPrice: dMin, maxPrice: dMax, currency: dCur })
    setOpenDrop(null)
  }

  const applyType = () => {
    push({ type: dType })
    setOpenDrop(null)
  }

  const applyMoreFilters = () => {
    push({ minSurface: dMinSurf, maxSurface: dMaxSurf })
    setMoreOpen(false)
  }

  const hasPrice = !!(cur.minPrice || cur.maxPrice)
  const hasRooms = !!(cur.minRooms)
  const priceLabel = fmtPrice(cur.minPrice, cur.maxPrice, cur.currency)
  const roomsLabel = cur.minRooms ? `${cur.minRooms}+ amb` : 'Ambientes'

  // Active chips
  type ChipDef = { key: string; label: string; clear: Record<string, string> }
  const chips: ChipDef[] = []
  if (cur.operation)    chips.push({ key: 'op',   label: cur.operation === 'Sale' ? 'Comprar' : cur.operation === 'Rent' ? 'Alquilar' : 'Temporal', clear: { operation: '' } })
  for (const id of selectedIds) {
    const name = locationNameById(id)
    if (name) {
      const remainingIds = selectedIds.filter(i => i !== id)
      chips.push({
        key: `loc-${id}`,
        label: name,
        clear: remainingIds.length > 0
          ? { location: remainingIds.join(','), location_name: remainingIds.map(i => locationNameById(i)).filter(Boolean).join(', ') }
          : { location: '', location_name: '' },
      })
    }
  }
  if (cur.type)         chips.push({ key: 'type', label: TYPE_LABEL[cur.type] ?? cur.type,                 clear: { type: '' } })
  if (cur.minRooms)     chips.push({ key: 'rmb',  label: `${cur.minRooms}+ amb`,                           clear: { minRooms: '' } })
  if (hasPrice)         chips.push({ key: 'prc',  label: priceLabel,                                        clear: { minPrice: '', maxPrice: '', currency: '' } })
  if (cur.minSurface || cur.maxSurface) {
    const s = cur.minSurface && cur.maxSurface
      ? `${cur.minSurface}–${cur.maxSurface}m²`
      : cur.minSurface ? `+${cur.minSurface}m²` : `hasta ${cur.maxSurface}m²`
    chips.push({ key: 'surf', label: s, clear: { minSurface: '', maxSurface: '' } })
  }

  // Grupos prioritarios de barrios — agrupan variantes bajo una sola etiqueta
  const PRIORITY_GROUPS = [
    { label: 'Palermo',  matches: ['Palermo', 'Palermo Soho', 'Palermo Hollywood', 'Palermo Chico', 'Palermo Botánico', 'Las Cañitas', 'Palermo Nuevo'] },
    { label: 'Belgrano', matches: ['Belgrano', 'Belgrano C', 'Belgrano R', 'Belgrano Barrancas', 'Barrancas de Belgrano'] },
    { label: 'Núñez',   matches: ['Núñez', 'Nuñez'] },
    { label: 'Recoleta', matches: ['Recoleta'] },
  ]
  // Todos los nombres que pertenecen a algún grupo prioritario
  const allPriorityNames = PRIORITY_GROUPS.flatMap((g) => g.matches)

  const filteredLocs = barrioQ
    ? locations.filter((l) => l.name.toLowerCase().includes(barrioQ.toLowerCase()))
    : locations

  // Barrios no-prioritarios en orden alfabético
  const restLocs = locations
    .filter((l) => !allPriorityNames.some((m) => m.toLowerCase() === l.name.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))

  // Helpers para grupos
  function groupLocationIds(group: typeof PRIORITY_GROUPS[0]) {
    return locations
      .filter((l) => group.matches.some((m) => m.toLowerCase() === l.name.toLowerCase()))
      .map((l) => l.id)
  }
  function groupCount(group: typeof PRIORITY_GROUPS[0]) {
    return groupLocationIds(group).length
  }
  // El location param es "active" para este grupo si la location_name coincide con el label
  function groupIsActive(group: typeof PRIORITY_GROUPS[0]) {
    const ids = groupLocationIds(group)
    return ids.length > 0 && ids.every(id => selectedIds.includes(id))
  }
  function selectGroup(group: typeof PRIORITY_GROUPS[0]) {
    const ids = groupLocationIds(group)
    const merged = Array.from(new Set([...selectedIds, ...ids]))
    const names = merged.map(id => locationNameById(id)).filter(Boolean)
    push({ location: merged.join(','), location_name: names.join(', ') })
    setBarrioQ(''); setOpenDrop(null)
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          STICKY BAR
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-[68px] z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2.5">

          {/* ── DESKTOP ─────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-full shadow-md px-2 py-1 gap-0.5">

            {/* Barrio */}
            <div ref={barrioRef} className="relative shrink-0">
              <PillBtn
                label={
                  selectedIds.length === 0
                    ? 'Barrio o zona'
                    : selectedIds.length === 1
                      ? locationNameById(selectedIds[0])
                      : `${selectedIds.length} barrios`
                }
                active={selectedIds.length > 0}
                open={openDrop === 'barrio'}
                onClick={() => toggle('barrio')}
              />
              <Popover open={openDrop === 'barrio'} anchorRef={barrioRef} onClose={() => setOpenDrop(null)} width="w-80">
                <div className="p-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-2 focus-within:border-[#C41230] transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      autoFocus
                      placeholder="Buscar barrio o zona..."
                      value={barrioQ}
                      onChange={(e) => setBarrioQ(e.target.value)}
                      className="flex-1 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {locLoading && <p className="text-[12px] text-gray-400 text-center py-4">Cargando barrios...</p>}
                    {!locLoading && selectedIds.length > 0 && (
                      <button type="button"
                        onClick={() => { push({ location: '', location_name: '' }); setBarrioQ(''); setOpenDrop(null) }}
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
                          groupIsActive(group)
                            ? 'bg-red-50 text-[#C41230] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{group.label}</span>
                        <span className="text-[11px] text-gray-400">{groupCount(group)}</span>
                      </button>
                    ))}
                    {!barrioQ && PRIORITY_GROUPS.length > 0 && <div className="my-2 border-t border-gray-100" />}
                    {(barrioQ ? filteredLocs : restLocs).map((l) => (
                      <button key={l.id} type="button"
                        onClick={() => {
                          const id = l.id
                          const newIds = selectedIds.includes(id)
                            ? selectedIds.filter(i => i !== id)
                            : [...selectedIds, id]
                          const names = newIds.map(i => locationNameById(i)).filter(Boolean)
                          push({ location: newIds.join(','), location_name: names.join(', ') })
                          setBarrioQ(''); setOpenDrop(null)
                        }}
                        className={`w-full text-left px-3 py-2 text-[12.5px] rounded-lg transition-colors ${
                          selectedIds.includes(l.id)
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

            <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

            {/* Comprar / Alquilar */}
            <div ref={opRef} className="relative shrink-0">
              <PillBtn
                label={cur.operation === 'Rent' ? 'Alquilar' : cur.operation === 'Temporary rent' ? 'Temporal' : 'Comprar'}
                active={!!cur.operation}
                open={openDrop === 'operation'}
                onClick={() => toggle('operation')}
              />
              <Popover open={openDrop === 'operation'} anchorRef={opRef} onClose={() => setOpenDrop(null)} width="w-52">
                <div className="py-2">
                  {[{ value: 'Sale', label: 'Comprar' }, { value: 'Rent', label: 'Alquilar' }, { value: 'Temporary rent', label: 'Temporal' }].map((o) => (
                    <button key={o.value} type="button"
                      onClick={() => { push({ operation: o.value }); setOpenDrop(null) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-colors ${
                        cur.operation === o.value ? 'text-[#C41230] bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        cur.operation === o.value ? 'border-[#C41230]' : 'border-gray-300'
                      }`}>
                        {cur.operation === o.value && <span className="w-2 h-2 rounded-full bg-[#C41230]" />}
                      </span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </Popover>
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

            {/* Tipo */}
            <div ref={typeRef} className="relative shrink-0">
              <PillBtn
                label={cur.type ? (TYPE_LABEL[cur.type] ?? 'Tipo') : 'Tipo'}
                active={!!cur.type}
                open={openDrop === 'type'}
                onClick={() => toggle('type')}
              />
              <Popover open={openDrop === 'type'} anchorRef={typeRef} onClose={() => setOpenDrop(null)} width="w-60">
                <div className="py-2 max-h-72 overflow-y-auto">
                  {TYPES.map((t) => (
                    <button key={t.value} type="button"
                      onClick={() => setDType((v) => v === t.value ? '' : t.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${
                        dType === t.value ? 'text-[#C41230] bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        dType === t.value ? 'border-[#C41230] bg-[#C41230]' : 'border-gray-300'
                      }`}>
                        {dType === t.value && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
                <PopFooter
                  onClear={() => { setDType(''); push({ type: '' }); setOpenDrop(null) }}
                  onApply={applyType}
                />
              </Popover>
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

            {/* Amb | Dorm */}
            <div ref={roomsRef} className="relative shrink-0">
              <PillBtn
                label={roomsLabel}
                active={hasRooms}
                open={openDrop === 'rooms'}
                onClick={() => toggle('rooms')}
              />
              <Popover open={openDrop === 'rooms'} anchorRef={roomsRef} onClose={() => setOpenDrop(null)} width="w-72">
                <div className="p-4">
                  <p className="text-[11px] font-semibold text-gray-500 mb-2.5">Ambientes</p>
                  <div className="flex gap-1.5">
                    {ROOM_OPTS.map((r) => (
                      <button key={r} type="button"
                        onClick={() => push({ minRooms: cur.minRooms === r ? '' : r })}
                        className={`flex-1 py-2 text-[12px] font-semibold border rounded-full transition-colors ${
                          cur.minRooms === r
                            ? 'bg-[#C41230] text-white border-[#C41230]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <PopFooter
                  onClear={() => { push({ minRooms: '' }); setOpenDrop(null) }}
                  onApply={() => setOpenDrop(null)}
                />
              </Popover>
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

            {/* Precio */}
            <div ref={priceRef} className="relative shrink-0">
              <PillBtn
                label={hasPrice ? priceLabel : 'Precio'}
                active={hasPrice}
                open={openDrop === 'price'}
                onClick={() => toggle('price')}
              />
              <Popover open={openDrop === 'price'} anchorRef={priceRef} onClose={() => setOpenDrop(null)} width="w-72">
                <div className="p-4">
                  <div className="flex gap-2 mb-4">
                    {['USD', 'ARS'].map((c) => (
                      <button key={c} type="button" onClick={() => setDCur(c)}
                        className={`flex-1 py-2 rounded-full text-[12px] font-semibold border transition-colors ${
                          dCur === c
                            ? 'bg-[#C41230] text-white border-[#C41230]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(dCur === 'USD'
                      ? [['', '100000', '< 100k'], ['100000', '200000', '100–200k'], ['200000', '350000', '200–350k'], ['350000', '', '350k+']]
                      : [['', '30000000', '< 30M'], ['30000000', '70000000', '30–70M'], ['70000000', '', '70M+']]
                    ).map(([min, max, label]) => (
                      <button key={label} type="button"
                        onClick={() => { setDMin(min); setDMax(max) }}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                          dMin === min && dMax === max
                            ? 'bg-[#C41230] text-white border-[#C41230]'
                            : 'border-gray-200 text-gray-600 hover:border-[#C41230] hover:text-[#C41230]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Desde</p>
                      <input type="number" placeholder="Sin mínimo" value={dMin}
                        onChange={(e) => setDMin(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C41230] placeholder:text-gray-300 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Hasta</p>
                      <input type="number" placeholder="Sin máximo" value={dMax}
                        onChange={(e) => setDMax(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C41230] placeholder:text-gray-300 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <PopFooter
                  onClear={() => {
                    setDMin(''); setDMax(''); setDCur('USD')
                    push({ minPrice: '', maxPrice: '', currency: '' })
                    setOpenDrop(null)
                  }}
                  onApply={applyPrice}
                />
              </Popover>
            </div>

            <div className="flex-1 min-w-0" />

            {/* + Filtros */}
            <button
              type="button" onClick={() => setMoreOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-400 transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              Más filtros
            </button>

            {/* Count */}
            {totalCount !== undefined && (
              <span className={`text-[12px] text-gray-500 shrink-0 ml-3 tabular-nums transition-opacity ${isPending ? 'opacity-30' : ''}`}>
                <b className="text-gray-900">{totalCount.toLocaleString('es-AR')}</b>{' '}
                {totalCount === 1 ? 'propiedad' : 'propiedades'}
              </span>
            )}
          </div>

          {/* ── MOBILE ──────────────────────────────────────────────────── */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-sm px-2 py-1">
              {[{ value: 'Sale', label: 'Comprar' }, { value: 'Rent', label: 'Alquilar' }, { value: 'Temporary rent', label: 'Temporal' }].map((o) => (
                <button key={o.value} type="button"
                  onClick={() => push({ operation: cur.operation === o.value ? '' : o.value })}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-colors ${
                    cur.operation === o.value
                      ? 'border-[#C41230] text-[#C41230]'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setDrawerOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-[11px] font-semibold shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              Filtros
              {chips.length > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-[#C41230] text-white text-[9px] font-bold rounded-full">
                  {chips.length}
                </span>
              )}
            </button>
            {totalCount !== undefined && (
              <span className={`shrink-0 text-[10px] text-gray-500 tabular-nums ${isPending ? 'opacity-30' : ''}`}>
                {isPending ? '…' : totalCount.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>

        {/* ── Active chips row ─────────────────────────────────────────── */}
        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-2.5 flex flex-wrap items-center gap-1.5">
                <AnimatePresence>
                  {chips.map((c) => (
                    <Chip key={c.key} label={c.label} onRemove={() => push(c.clear)} />
                  ))}
                </AnimatePresence>
                <button type="button" onClick={clearAll}
                  className="text-[11px] text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors ml-1"
                >
                  Limpiar todo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MÁS FILTROS — right slide panel
          ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setMoreOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0, transition: { type: 'spring', damping: 32, stiffness: 350 } }}
              exit={{ x: '100%', transition: { duration: 0.2 } }}
              className="fixed top-0 right-0 h-full z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-[13px] font-bold tracking-[0.10em] uppercase text-gray-900">Más filtros</h2>
                <button type="button" onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Superficie */}
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-3">Superficie (m²)</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 mb-1.5">Mínimo</p>
                      <input type="number" placeholder="Ej: 40" value={dMinSurf}
                        onChange={(e) => setDMinSurf(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C41230] transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 mb-1.5">Máximo</p>
                      <input type="number" placeholder="Ej: 200" value={dMaxSurf}
                        onChange={(e) => setDMaxSurf(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C41230] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Ordenar por */}
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-3">Ordenar por</p>
                  <div className="space-y-1">
                    {ORDERS.map((o) => (
                      <button key={o.value} type="button"
                        onClick={() => push({ orderBy: o.value })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-colors border ${
                          cur.orderBy === o.value
                            ? 'border-[#C41230] bg-red-50 text-[#C41230]'
                            : 'border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          cur.orderBy === o.value ? 'border-[#C41230]' : 'border-gray-300'
                        }`}>
                          {cur.orderBy === o.value && <span className="w-2 h-2 rounded-full bg-[#C41230]" />}
                        </span>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cocheras */}
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-3">Cocheras mínimas</p>
                  <div className="flex gap-2">
                    {['1', '2', '3+'].map((v) => (
                      <button key={v} type="button"
                        onClick={() => push({ parking: sp.get('parking') === v ? '' : v })}
                        className={`flex-1 py-2.5 rounded-full text-[12px] font-semibold border transition-colors ${
                          sp.get('parking') === v
                            ? 'bg-[#C41230] text-white border-[#C41230]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button type="button"
                  onClick={() => {
                    push({ minSurface: '', maxSurface: '', parking: '' })
                    setDMinSurf(''); setDMaxSurf('')
                    setMoreOpen(false)
                  }}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-[12px] font-semibold text-gray-500 hover:border-gray-400 transition-colors"
                >
                  Limpiar
                </button>
                <button type="button" onClick={applyMoreFilters}
                  className="flex-1 py-3 rounded-full bg-[#C41230] text-white text-[12px] font-semibold hover:bg-[#a00f27] transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE DRAWER — bottom sheet
          ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', damping: 32, stiffness: 380 } }}
              exit={{ y: '100%', transition: { duration: 0.22 } }}
              className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white flex flex-col max-h-[92svh] rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.15)]"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h2 className="text-[11px] font-bold tracking-[0.16em] uppercase text-gray-900">
                  Filtros
                  {chips.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-[#C41230] text-white text-[9px] font-bold rounded-full">
                      {chips.length}
                    </span>
                  )}
                </h2>
                <button type="button" onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                {/* Barrio */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-2">Barrio o zona</p>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#C41230] transition-colors mb-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input placeholder="Buscar barrio..." value={barrioQ}
                      onFocus={loadLocations}
                      onChange={(e) => setBarrioQ(e.target.value)}
                      className="flex-1 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                  {(locations.length > 0 || locLoading) && (
                    <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl">
                      {locLoading && <p className="text-[12px] text-gray-400 text-center py-3">Cargando...</p>}
                      {(barrioQ ? locations.filter((l) => l.name.toLowerCase().includes(barrioQ.toLowerCase())) : locations)
                        .slice(0, 20).map((l) => (
                          <button key={l.id} type="button"
                            onClick={() => {
                              const id = l.id
                              const newIds = selectedIds.includes(id)
                                ? selectedIds.filter(i => i !== id)
                                : [...selectedIds, id]
                              const names = newIds.map(i => locationNameById(i)).filter(Boolean)
                              push({ location: newIds.join(','), location_name: names.join(', ') })
                              setBarrioQ('')
                            }}
                            className={`w-full text-left px-3 py-2 text-[12.5px] border-b border-gray-50 last:border-0 transition-colors ${
                              selectedIds.includes(l.id) ? 'text-[#C41230] bg-red-50 font-medium' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {l.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-2">Tipo de propiedad</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map((t) => (
                      <button key={t.value} type="button"
                        onClick={() => push({ type: cur.type === t.value ? '' : t.value })}
                        className={`py-3 px-3 rounded-xl text-[12px] font-medium border text-left transition-colors ${
                          cur.type === t.value
                            ? 'border-[#C41230] text-[#C41230] bg-red-50'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ambientes */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-2">Ambientes</p>
                  <div className="flex gap-2">
                    {ROOM_OPTS.map((r) => (
                      <button key={r} type="button"
                        onClick={() => push({ minRooms: cur.minRooms === r ? '' : r })}
                        className={`flex-1 py-2.5 rounded-full text-[11px] font-semibold border transition-colors ${
                          cur.minRooms === r ? 'bg-[#C41230] text-white border-[#C41230]' : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precio */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-2">Precio</p>
                  <div className="flex gap-2 mb-3">
                    {['USD', 'ARS'].map((c) => (
                      <button key={c} type="button" onClick={() => setDCur(c)}
                        className={`flex-1 py-2.5 rounded-full text-[11px] font-semibold border transition-colors ${
                          dCur === c ? 'bg-[#C41230] text-white border-[#C41230]' : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Desde" value={dMin}
                      onChange={(e) => setDMin(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C41230] transition-colors"
                    />
                    <input type="number" placeholder="Hasta" value={dMax}
                      onChange={(e) => setDMax(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C41230] transition-colors"
                    />
                  </div>
                </div>

                {/* Ordenar */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-500 mb-2">Ordenar por</p>
                  <div className="space-y-1.5">
                    {ORDERS.map((o) => (
                      <button key={o.value} type="button" onClick={() => push({ orderBy: o.value })}
                        className={`w-full text-left py-3 px-4 rounded-xl text-[12.5px] border transition-colors ${
                          cur.orderBy === o.value
                            ? 'border-[#C41230] text-[#C41230] bg-red-50'
                            : 'border-gray-100 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                {chips.length > 0 && (
                  <button type="button" onClick={clearAll}
                    className="text-[11px] text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors whitespace-nowrap"
                  >
                    Limpiar todo
                  </button>
                )}
                <button type="button"
                  onClick={() => {
                    if (dMin !== cur.minPrice || dMax !== cur.maxPrice || dCur !== cur.currency) {
                      push({ minPrice: dMin, maxPrice: dMax, currency: dCur })
                    }
                    setDrawerOpen(false)
                  }}
                  className="flex-1 bg-[#C41230] text-white text-[11px] font-bold tracking-[0.12em] uppercase py-4 rounded-full hover:bg-[#a00f27] transition-colors"
                >
                  {totalCount !== undefined && !isPending
                    ? `Ver ${totalCount.toLocaleString('es-AR')} ${totalCount === 1 ? 'propiedad' : 'propiedades'}`
                    : 'Ver resultados'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
