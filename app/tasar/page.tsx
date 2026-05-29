/**
 * /tasar — Tasación de inmuebles en Buenos Aires
 */

import type { Metadata } from 'next'
import { ContactForm } from '@/components/properties/ContactForm'
import TasarHero from '@/components/tasar/TasarHero'
import ValorPropuesta from '@/components/tasar/ValorPropuesta'
import { ComoVendemos } from '@/components/tasar/ComoVendemos'
import { ProcessSteps } from '@/components/tasar/ProcessSteps'
import DifusionTotalSection from '@/components/tasar/DifusionTotalSection'
import { StatHighlight } from '@/components/tasar/StatHighlight'
import SEOBarrios from '@/components/tasar/SEOBarrios'

export const metadata: Metadata = {
  title: 'Tasación de Propiedades en Palermo y Zona Norte CABA | Lexinton',
  description:
    'Tasación profesional en Palermo, Belgrano, Núñez, Recoleta, Saavedra y Villa Urquiza. Corredores matriculados con 20 años en zona norte.',
  keywords:
    'tasación Palermo, tasar departamento Belgrano, tasación inmuebles zona norte CABA, precio m2 Palermo 2025, tasar propiedad Buenos Aires',
  alternates: { canonical: 'https://lexinton.com.ar/tasar' },
}

export default function TasarPage() {
  return (
    <main className="min-h-screen">

      {/* ── 1. HERO con parallax ─────────────────────── */}
      <TasarHero />

      {/* ── 2. CÓMO VENDEMOS TU PROPIEDAD ───────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <ComoVendemos />

      {/* ── 3. PROCESO EN PASOS ──────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <ProcessSteps />

      {/* ── 5. DIFUSIÓN TOTAL ────────────────────────── */}
      <DifusionTotalSection />

      {/* ── 6. FORMULARIO ────────────────────────────── */}
      <section className="py-24 bg-[#f5f5f5]">
        <div className="max-w-xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs text-[#C41230] uppercase tracking-[0.2em] mb-3">
              Tasación
            </p>
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Solicitá tu tasación
            </h2>
            <p className="text-gray-500">
              Completá el formulario y un corredor de tu zona te contactará en menos de 24hs hábiles.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <ContactForm
              customTitle="Querés tasar tu propiedad"
              customMessage="Hola Lexinton, me gustaría tasar mi propiedad."
              showPropertyType={true}
              showBarrio={true}
            />
          </div>
        </div>
      </section>

      {/* ── 7. STAT 83% ──────────────────────────────── */}
      <StatHighlight />

      {/* ── 8. SEO POR BARRIOS ───────────────────────── */}
      <SEOBarrios />

    </main>
  )
}
