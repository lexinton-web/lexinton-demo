/**
 * /emprendimientos — Proyectos inmobiliarios seleccionados por Lexinton
 */

import { pageMetadata } from '@/lib/seo'
import { Suspense } from 'react'
import Link from 'next/link'
import { getDevelopments } from '@/lib/tokko/queries'
import { developmentToProperty } from '@/lib/tokko/utils'
import { ContactForm } from '@/components/properties/ContactForm'
import PageHero from '@/components/PageHero'
import SectionHeader from '@/components/ui/SectionHeader'
import FeatureCard from '@/components/ui/FeatureCard'
import { EmprendimientosClient } from '@/components/emprendimientos/EmprendimientosClient'

export const metadata = pageMetadata({
  title: 'Emprendimientos Inmobiliarios en Palermo | Lexinton Propiedades',
  description: 'Invertí en los mejores emprendimientos inmobiliarios de Palermo y zona norte.',
  path: '/emprendimientos',
})

const diferenciadores = [
  { title: 'Menor precio de entrada', description: 'Comprar en pozo o en construcción siempre es más económico que a estrenar. Accedés al precio más bajo del ciclo del proyecto.', icon: '◈' },
  { title: 'Valorización durante la construcción', description: 'A medida que avanza la obra, el valor de la unidad sube. Es habitual ver incrementos del 20–40% entre pozo y escritura.', icon: '◈' },
  { title: 'Asesoramiento en cada etapa', description: 'Desde la selección del proyecto hasta la escritura final, te acompañamos con criterio y sin presiones.', icon: '◈' },
]

async function DevelopmentsList() {
  const allDevs = await getDevelopments()
  const devs = allDevs.filter((d) => {
    const name = (d.name ?? '').toLowerCase()
    const addr = (d.address ?? '').toLowerCase()
    return !name.includes('tasacion') && !addr.includes('whatsapp') && !addr.includes('online por')
  })

  if (!devs.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-lx-stone text-lg mb-6">Los emprendimientos disponibles se actualizan constantemente.</p>
        <p className="text-lx-stone/70 text-sm">Consultanos para conocer los proyectos actuales.</p>
      </div>
    )
  }

  const properties = devs.map(developmentToProperty)
  return <EmprendimientosClient properties={properties} />
}

function DevelopmentsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-lx-line overflow-hidden h-[200px] animate-pulse" />
      ))}
    </div>
  )
}

export default function EmprendimientosPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        label="Lexinton Propiedades · Emprendimientos"
        title="Emprendimientos con visión"
        titleEmphasis="de futuro"
        description="Accedé a proyectos seleccionados en las zonas de mayor valorización de Buenos Aires. Asesoramiento experto desde la preventa hasta la escritura."
        withImage
      />

      {/* ── DIFERENCIADORES ──────────────────────────── */}
      <section className="bg-lx-parchment py-20 sm:py-24 border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {diferenciadores.map((d) => (
              <FeatureCard key={d.title} title={d.title} description={d.description} icon={d.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LISTA DE EMPRENDIMIENTOS ──────────────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader label="Proyectos Activos" title="Proyectos disponibles" />
            <Link href="/emprendimientos" className="hidden sm:block text-[10.5px] font-bold tracking-[0.14em] uppercase text-lx-stone hover:text-lx-ink transition-colors mb-16">
              Ver todos los emprendimientos →
            </Link>
          </div>
          <Suspense fallback={<DevelopmentsSkeleton />}>
            <DevelopmentsList />
          </Suspense>
        </div>
      </section>

      {/* ── FORMULARIO ───────────────────────────────── */}
      <section className="py-24 bg-[#f5f5f5]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] mb-3">
              Contacto
            </p>
            <h2 className="text-4xl font-light text-gray-900">
              ¿Querés saber más sobre<br />
              <em className="not-italic">algún proyecto?</em>
            </h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-xl mx-auto">
            <ContactForm
              customTitle="Consultar sobre emprendimientos"
              customMessage="Hola Lexinton, me interesa recibir información sobre sus emprendimientos disponibles."
            />
          </div>
        </div>
      </section>
    </main>
  )
}
