'use client'
import { useState } from 'react'
import type { TokkoProperty } from '@/lib/tokko/types'
import PropertyCard from '@/components/PropertyCard'
import { PropertyList } from './PropertyList'
import { ViewToggle } from './ViewToggle'

interface Props {
  properties: TokkoProperty[]
  total: number
  currentOffset: number
  itemsPerPage: number
}

export function PropertyListingClient({ properties, total, currentOffset, itemsPerPage }: Props) {
  const [view, setView] = useState<'grid' | 'list'>('list')

  return (
    <>
      <ViewToggle
        view={view}
        onChange={setView}
        total={total}
        currentOffset={currentOffset}
        itemsPerPage={itemsPerPage}
      />

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {properties.map((property, i) => (
            <PropertyCard key={property.id} property={property} priority={i < 4} />
          ))}
        </div>
      ) : (
        <PropertyList properties={properties} />
      )}
    </>
  )
}
