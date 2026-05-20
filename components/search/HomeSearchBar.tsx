'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LocationAutocomplete from '@/components/search/LocationAutocomplete'

const TABS = [
  { value: 'Sale',            label: 'Comprar' },
  { value: 'Rent',            label: 'Alquilar' },
  { value: 'Emprendimientos', label: 'Emprendimientos' },
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

export function HomeSearchBar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['value']>('Sale')
  const [typeValue, setTypeValue] = useState('')
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')

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
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">

        {/* Tabs */}
        <div className="flex border-b border-gray-100 rounded-t-2xl overflow-hidden">
          {TABS.map(tab => (
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

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">

          {/* Tipo */}
          <div className="relative sm:flex-shrink-0">
            <label htmlFor="home-property-type" className="sr-only">Tipo de propiedad</label>
            <select
              id="home-property-type"
              value={typeValue}
              onChange={e => setTypeValue(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl
                px-4 py-3 pr-8 text-sm text-gray-700 w-full sm:min-w-[150px]
                focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </div>

          {/* Barrio — LocationAutocomplete con IDs reales de Tokko */}
          <LocationAutocomplete
            value={locationId}
            displayName={locationName}
            onChange={(id, name) => { setLocationId(id); setLocationName(name) }}
            placeholder="Barrio o zona..."
            theme="light"
            className="flex-1 rounded-xl border border-gray-200"
          />

          {/* Buscar */}
          <button
            type="button"
            onClick={handleSearch}
            className="w-full sm:flex-shrink-0 sm:w-auto bg-[#C41230] text-white
              px-5 py-3 rounded-xl text-sm font-semibold
              flex items-center justify-center gap-2
              hover:bg-[#a30f28] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </div>
  )
}
