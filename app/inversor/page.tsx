/**
 * /inversor — Inversión inmobiliaria en Palermo
 * Design system: SectionHeader, NumberedSteps, FeatureCard, StatsCounter
 */

import type { Metadata } from 'next'
import { ContactForm } from '@/components/properties/ContactForm'
import PageHero from '@/components/PageHero'
import SectionHeader from '@/components/ui/SectionHeader'
import NumberedSteps from '@/components/ui/NumberedSteps'
import FeatureCard from '@/components/ui/FeatureCard'
import StatsCounter from '@/components/ui/StatsCounter'

export const metadata: Metadata = {
  title: 'Inversión Inmobiliaria en Palermo | Lexinton Propiedades',
  description: 'Asesoramiento en inversión inmobiliaria en Palermo, Belgrano y zona norte. Rentabilidad, seguridad y 20 años de experiencia.',
  alternates: { canonical: 'https://lexinton.com.ar/inversor' },
}

const razones = [
  { title: 'Dolarización natural', description: 'Los inmuebles en CABA se transan en USD. Tu capital queda protegido de la devaluación en pesos.' },
  { title: 'Renta en alquiler', description: 'Rentabilidad promedio del 4–6% anual en dólares para zonas premium como Palermo y Belgrano.' },
  { title: 'Valorización sostenida', description: 'El m² en barrios consolidados crece históricamente por encima de la inflación en USD.' },
]

const tipos = [
  { title: 'Compra para alquilar', description: 'Renta mensual en pesos o USD. Estrategia de largo plazo con bajo riesgo.' },
  { title: 'Compra en pozo', description: 'Precio mínimo garantizado. Valorización del 20–40% durante la construcción.' },
  { title: 'Operación simultánea', description: 'Vendés lo que tenés y comprás algo mejor. Todo coordinado el mismo día.' },
  { title: 'Cocheras y locales', description: 'Alta renta y baja vacancia. Perfectos para inversores con menor capital.' },
]

const proceso = [
  { title: 'Consulta inicial', description: 'Entendemos tu presupuesto y objetivos de inversión.' },
  { title: 'Análisis de opciones', description: 'Seleccionamos las mejores oportunidades del mercado para tu perfil.' },
  { title: 'Visitas y evaluación', description: 'Te acompañamos a ver las propiedades y analizamos cada una.' },
  { title: 'Oferta y negociación', description: 'Manejamos la negociación para que comprés al mejor precio.' },
  { title: 'Escritura y entrega', description: 'Coordinamos escribanos y gestionamos todo el cierre.' },
]

const stats = [
  { end: 20, label: 'años en el mercado' },
  { end: 5000, prefix: '+', label: 'operaciones cerradas' },
  { end: 1, prefix: '#', label: 'en simultáneas Palermo' },
]

export default function InversorPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        label="Lexinton Propiedades · Inversores"
        title="Tu capital, protegido"
        titleEmphasis="en ladrillos"
        description="El mercado inmobiliario porteño es históricamente uno de los más estables de Argentina. Te ayudamos a invertir con criterio y rentabilidad real."
        withImage
      />

      {/* ── POR QUÉ INVERTIR HOY ─────────────────────── */}
      <section className="bg-white py-20 sm:py-24 border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeader label="El Mercado Hoy" title="¿Por qué invertir hoy?" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {razones.map((r) => (
              <FeatureCard key={r.title} title={r.title} description={r.description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TIPOS DE INVERSIÓN ───────────────────────── */}
      <section className="bg-lx-parchment py-20 sm:py-24 border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeader label="Estrategias" title="Tipos de inversión" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {tipos.map((t) => (
              <FeatureCard key={t.title} title={t.title} description={t.description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESO ──────────────────────────────────── */}
      <section className="bg-lx-cream py-20 sm:py-24 border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeader
            label="Cómo Trabajamos"
            title="El proceso con Lexinton"
            description="Cinco pasos claros para que tu inversión sea segura y rentable."
          />
          <NumberedSteps steps={proceso} columns={5} />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section className="bg-lx-parchment border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <StatsCounter stats={stats} />
        </div>
      </section>

      {/* ── FORMULARIO ───────────────────────────────── */}
      <section className="py-24 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] mb-3">
                Inversión · Inmobiliaria
              </p>
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Hablemos de<br />
                <em className="not-italic font-normal">tu inversión</em>
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Contanos con qué presupuesto contás y qué objetivos tenés.
                Te presentamos las mejores opciones del mercado actual.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <ContactForm
                customTitle="Consultar sobre inversiones"
                customMessage="Hola Lexinton, estoy interesado/a en invertir en propiedades. Me gustaría recibir información sobre las opciones disponibles."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
