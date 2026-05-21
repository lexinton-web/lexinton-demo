/**
 * /quiero-vender — Propietarios que quieren vender su inmueble
 * Design system: SectionHeader, NumberedSteps, FeatureCard
 */

import type { Metadata } from 'next'
import { ContactForm } from '@/components/properties/ContactForm'
import PageHero from '@/components/PageHero'
import SectionHeader from '@/components/ui/SectionHeader'
import NumberedSteps from '@/components/ui/NumberedSteps'
import FeatureCard from '@/components/ui/FeatureCard'

export const metadata: Metadata = {
  title: 'Quiero Vender mi Propiedad | Lexinton Propiedades',
  description: 'Vendé tu propiedad en Palermo, Belgrano o zona norte con el equipo de Lexinton.',
  alternates: { canonical: 'https://lexinton.com.ar/quiero-vender' },
}

const pasos = [
  { title: 'Tasación', description: 'Analizamos el valor real de mercado de tu propiedad con comparables reales, no fórmulas genéricas.' },
  { title: 'Difusión premium', description: 'Publicamos en los principales portales, redes sociales y nuestra base de compradores activos.' },
  { title: 'Consultas y visitas', description: 'Gestionamos todos los contactos y visitas. Vos solo recibís compradores serios y calificados.' },
  { title: 'Cierre y escritura', description: 'Negociamos en tu nombre y coordinamos escribanos, abogados y todo el proceso de cierre.' },
]

const ventajas = [
  { title: 'Más de 20 años en el mercado', description: 'Experiencia real en Palermo, Belgrano y zona norte.' },
  { title: 'Base de compradores activos', description: 'Miles de interesados en nuestra cartera antes de la publicación.' },
  { title: 'Fotografía profesional incluida', description: 'Fotos de alta calidad que maximizan las consultas online.' },
  { title: 'Especialistas en simultáneas', description: 'Si necesitás vender y comprar a la vez, somos los indicados.' },
]

export default function QuieroVenderPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        label="Lexinton Propiedades · Vendedores"
        title="Vendé con quienes"
        titleEmphasis="conocen tu barrio"
        description="Más de 20 años cerrando operaciones en Palermo, Belgrano y zona norte. Te acompañamos desde la tasación hasta la escritura."
        withImage
      />

      {/* ── PROCESO ──────────────────────────────────── */}
      <section className="bg-lx-cream py-20 sm:py-24 border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeader
            label="El Proceso"
            title="¿Cómo trabajamos?"
            description="Cuatro etapas claras, sin sorpresas."
          />
          <NumberedSteps steps={pasos} columns={4} />
        </div>
      </section>

      {/* ── VENTAJAS ─────────────────────────────────── */}
      <section className="bg-lx-parchment py-20 sm:py-24 border-b border-lx-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SectionHeader label="Por Qué Lexinton" title="Ventajas de vender con nosotros" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ventajas.map((v) => (
              <FeatureCard key={v.title} title={v.title} description={v.description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULARIO ───────────────────────────────── */}
      <section className="bg-lx-cream py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-xl mx-auto">
            <SectionHeader
              label="Quiero Vender"
              title="Comenzá el proceso"
              description="Completá el formulario y te contactamos para coordinar la tasación sin compromiso."
              center
            />
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <ContactForm
                customTitle="Quiero vender mi propiedad"
                customMessage="Hola Lexinton, quiero vender mi propiedad."
                showPropertyType={true}
                showBarrio={true}
                showPlazoVenta={true}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
