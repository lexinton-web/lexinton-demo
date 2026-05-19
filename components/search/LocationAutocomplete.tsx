'use client'

/**
 * LocationAutocomplete
 *
 * Input con autocompletado de barrios (55 barrios de CABA).
 * Carga /api/locations de forma lazy (solo al primer foco).
 * Filtrado 100% client-side — sin llamadas extra por cada tecla.
 * Soporta navegación por teclado: ↑↓ Enter Escape.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface Location {
  id: number
  name: string
  weight: number
}

export interface LocationAutocompleteProps {
  /** ID de barrio seleccionado (string vacío = ninguno) */
  value: string
  /** Nombre para mostrar en el input */
  displayName: string
  onChange: (id: string, name: string) => void
  placeholder?: string
  /** 'dark' para hero sobre fondo oscuro; 'light' para panel claro */
  theme?: 'dark' | 'light'
  /** Clases extra para el wrapper */
  className?: string
}

export default function LocationAutocomplete({
  value,
  displayName,
  onChange,
  placeholder = 'Barrio o zona...',
  theme = 'light',
  className = '',
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(displayName)
  const [locations, setLocations] = useState<Location[]>([])
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const [loading, setLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync input when displayName changes externally (e.g. URL navigation)
  useEffect(() => {
    setQuery(displayName)
  }, [displayName])

  // ── Cargar locations la primera vez que el usuario hace foco ──────────────
  const ensureLocations = useCallback(async () => {
    if (locations.length > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/locations')
      const data: Location[] = await res.json()
      const sorted = [...data].sort((a, b) => b.weight - a.weight)
      setLocations(sorted)
    } catch {
      // Si falla, el input sigue funcionando como texto libre
    } finally {
      setLoading(false)
    }
  }, [locations.length])

  // ── Calcular sugerencias cuando cambia el query o locations ──────────────
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      setSuggestions(locations.slice(0, 8))
      return
    }
    const filtered = locations
      .filter((l) => l.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q)
        const bStarts = b.name.toLowerCase().startsWith(q)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return b.weight - a.weight
      })
      .slice(0, 8)
    setSuggestions(filtered)
  }, [query, locations])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFocus = async () => {
    await ensureLocations()
    // Si había un barrio seleccionado, borrar el input para nueva búsqueda
    if (value) setQuery('')
    setIsOpen(true)
    setHighlightedIdx(-1)
  }

  const handleSelect = (loc: Location) => {
    onChange(String(loc.id), loc.name)
    setQuery(loc.name)
    setIsOpen(false)
    setHighlightedIdx(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('', '')
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIdx((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (highlightedIdx >= 0) {
          e.preventDefault()
          handleSelect(suggestions[highlightedIdx])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery(value ? displayName : '')
        break
    }
  }

  // Cerrar al clickear fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
        if (value) setQuery(displayName)
        else if (!query.trim()) setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value, displayName, query])

  // ── Estilos según tema ─────────────────────────────────────────────────────
  const dark = theme === 'dark'

  const wrapperCls = dark
    ? 'border border-white/25 bg-white/10 text-white'
    : 'border border-lx-line bg-white text-lx-ink'

  const inputCls = dark
    ? 'placeholder:text-white/45 text-white'
    : 'placeholder:text-lx-stone/60 text-lx-ink'

  const iconCls = dark ? 'text-white/45' : 'text-lx-stone'

  const clearCls = dark
    ? 'text-white/45 hover:text-white'
    : 'text-lx-stone hover:text-lx-ink'

  const dropdownBg = dark
    ? 'bg-[#1c1c1c] border border-white/10'
    : 'bg-white border border-lx-line shadow-xl'

  const optionBase = dark
    ? 'text-white/80 hover:bg-white/8'
    : 'text-lx-ink hover:bg-lx-cream/70'

  const optionHighlighted = dark
    ? 'bg-white/12 text-white'
    : 'bg-lx-cream text-lx-ink'

  return (
    <div ref={containerRef} className={`relative flex-1 min-w-0 ${className}`}>
      {/* Input */}
      <div className={`flex items-center h-[42px] ${wrapperCls}`}>
        {/* Pin icon */}
        <svg
          className={`w-4 h-4 ml-3 shrink-0 ${iconCls}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Cargando barrios...' : placeholder}
          autoComplete="off"
          className={`flex-1 bg-transparent px-2.5 py-2 text-sm outline-none ${inputCls}`}
        />

        {/* Clear button */}
        {(query || value) && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className={`px-3 py-3 transition-colors duration-150 ${clearCls}`}
            aria-label="Limpiar barrio"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className={`absolute top-full left-0 right-0 z-[200] mt-1 rounded-2xl ${dropdownBg} overflow-hidden`}>
          {suggestions.map((loc, idx) => (
            <button
              key={loc.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(loc)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 flex items-center gap-2.5 ${
                idx === highlightedIdx ? optionHighlighted : optionBase
              }`}
            >
              <svg className={`w-3 h-3 shrink-0 opacity-60 ${dark ? 'text-white' : 'text-lx-stone'}`} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
