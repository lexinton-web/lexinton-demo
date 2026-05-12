'use client'
/**
 * LeadForm — Formulario de contacto genérico
 *
 * Se usa en todas las páginas institucionales:
 * home (CTA), tasación, quiero vender, inversores, emprendimientos, contacto.
 *
 * Envía a POST /api/leads con el "tipo" como tag de Tokko.
 * El cliente ve los leads en su panel de Tokko bajo el tag correspondiente.
 */

import { useState } from 'react'
import { PhoneInput } from '@/components/ui/PhoneInput'

export type LeadFormTipo =
  | 'Tasación'
  | 'Quiero Vender'
  | 'Inversores'
  | 'Emprendimientos'
  | 'Contacto'
  | 'Home'

interface LeadFormProps {
  tipo: LeadFormTipo
  /** Campos extra a mostrar según la página */
  showTipoSelector?: boolean   // selector ¿En qué te podemos ayudar?
  showPresupuesto?: boolean    // inversor: presupuesto USD
  showPlazo?: boolean          // quiero vender: plazo en mente
  showBarrio?: boolean         // quiero vender: barrio
  showTipoPropiedad?: boolean  // quiero vender / inversores
  messagePlaceholder?: string
  /** Colores del formulario: 'dark' (sobre fondo oscuro) | 'light' (sobre fondo claro) */
  theme?: 'dark' | 'light'
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function LeadForm({
  tipo,
  showTipoSelector,
  showPresupuesto,
  showPlazo,
  showBarrio,
  showTipoPropiedad,
  messagePlaceholder = 'Mensaje (opcional)',
  theme = 'light',
}: LeadFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [phonePrefix, setPhonePrefix] = useState('+54')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
    tipoConsulta: tipo,
    presupuesto: '',
    plazo: '',
    barrio: '',
    tipoPropiedad: '',
  })

  const dark = theme === 'dark'
  const input = dark
    ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/50 [&>option]:bg-gray-900 [&>option]:text-white'
    : 'bg-white border-lx-line text-lx-ink placeholder-lx-stone/60 focus:border-lx-stone'
  const label = dark
    ? 'text-white/40'
    : 'text-lx-stone'
  const btn = dark
    ? 'bg-white text-lx-ink hover:bg-lx-cream'
    : 'bg-lx-ink text-white hover:bg-gray-800'

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')

    const extraParts: string[] = []
    if (form.presupuesto) extraParts.push(`Presupuesto: ${form.presupuesto}`)
    if (form.plazo) extraParts.push(`Plazo: ${form.plazo}`)
    if (form.barrio) extraParts.push(`Barrio: ${form.barrio}`)
    if (form.tipoPropiedad) extraParts.push(`Tipo de propiedad: ${form.tipoPropiedad}`)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono ? `${phonePrefix} ${form.telefono}` : '',
          mensaje: form.mensaje,
          tipo: showTipoSelector ? form.tipoConsulta : tipo,
          extra: extraParts.join(' | ') || undefined,
          form_type: tipo.toLowerCase().replace(/\s+/g, '_'),
          page_url: typeof window !== 'undefined' ? window.location.href : null,
        }),
      })

      if (!res.ok) throw new Error()
      setState('success')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className={`text-center py-10 px-8 ${dark ? 'border border-white/10' : 'border border-lx-line bg-lx-parchment'}`}>
        <div className={`text-3xl mb-4 ${dark ? 'text-white' : 'text-lx-ink'}`}>✓</div>
        <p className={`font-serif text-xl mb-2 ${dark ? 'text-white' : 'text-lx-ink'}`}>
          ¡Recibimos tu consulta!
        </p>
        <p className={`text-sm ${dark ? 'text-white/50' : 'text-lx-stone'}`}>
          Te contactamos en menos de 24 horas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Selector de tipo — home y contacto general */}
      {showTipoSelector && (
        <div>
          <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
            ¿En qué te podemos ayudar?
          </label>
          <select
            name="tipoConsulta"
            value={form.tipoConsulta}
            onChange={handleChange}
            className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
          >
            <option value="Tasación">Quiero tasar mi propiedad</option>
            <option value="Quiero Vender">Quiero vender mi propiedad</option>
            <option value="Home">Consulta sobre una propiedad</option>
            <option value="Inversores">Información para inversores</option>
            <option value="Emprendimientos">Información sobre emprendimientos</option>
          </select>
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
          Nombre
        </label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          placeholder="Tu nombre completo"
          className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
        />
      </div>

      {/* Email */}
      <div>
        <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="tu@email.com"
          className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
          Teléfono
        </label>
        <PhoneInput
          prefix={phonePrefix}
          onPrefixChange={setPhonePrefix}
          value={form.telefono}
          onChange={v => setForm(prev => ({ ...prev, telefono: v }))}
          prefixClassName={`flex items-center gap-1.5 px-3 border min-w-[84px] ${
            dark
              ? 'border-white/20 bg-white/10'
              : 'border-lx-line bg-white'
          }`}
          inputClassName={`flex-1 border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
        />
      </div>

      {/* Presupuesto — inversores */}
      {showPresupuesto && (
        <div>
          <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
            Presupuesto disponible
          </label>
          <select
            name="presupuesto"
            value={form.presupuesto}
            onChange={handleChange}
            className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
          >
            <option value="">Seleccioná un rango</option>
            <option value="Hasta USD 100.000">Hasta USD 100.000</option>
            <option value="USD 100.000 – USD 200.000">USD 100.000 – USD 200.000</option>
            <option value="USD 200.000 – USD 400.000">USD 200.000 – USD 400.000</option>
            <option value="Más de USD 400.000">Más de USD 400.000</option>
          </select>
        </div>
      )}

      {/* Tipo de propiedad */}
      {showTipoPropiedad && (
        <div>
          <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
            Tipo de propiedad
          </label>
          <select
            name="tipoPropiedad"
            value={form.tipoPropiedad}
            onChange={handleChange}
            className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
          >
            <option value="">Seleccioná un tipo</option>
            <option value="Departamento">Departamento</option>
            <option value="Casa">Casa</option>
            <option value="PH">PH</option>
            <option value="Local comercial">Local comercial</option>
            <option value="Oficina">Oficina</option>
            <option value="Cochera">Cochera</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      )}

      {/* Barrio */}
      {showBarrio && (
        <div>
          <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
            Barrio
          </label>
          <input
            type="text"
            name="barrio"
            value={form.barrio}
            onChange={handleChange}
            placeholder="Ej: Palermo, Belgrano..."
            className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
          />
        </div>
      )}

      {/* Plazo */}
      {showPlazo && (
        <div>
          <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
            ¿En qué plazo pensás vender?
          </label>
          <select
            name="plazo"
            value={form.plazo}
            onChange={handleChange}
            className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors ${input}`}
          >
            <option value="">Seleccioná una opción</option>
            <option value="Lo antes posible">Lo antes posible</option>
            <option value="1 a 3 meses">1 a 3 meses</option>
            <option value="3 a 6 meses">3 a 6 meses</option>
            <option value="Sin apuro definido">Sin apuro definido</option>
          </select>
        </div>
      )}

      {/* Mensaje */}
      <div>
        <label className={`block text-[11px] font-bold tracking-[0.16em] uppercase mb-2 ${label}`}>
          Mensaje
        </label>
        <textarea
          name="mensaje"
          value={form.mensaje}
          onChange={handleChange}
          rows={4}
          placeholder={messagePlaceholder}
          className={`w-full border px-4 py-3 text-[16px] focus:outline-none transition-colors resize-none ${input}`}
        />
      </div>

      {state === 'error' && (
        <p className="text-red-400 text-sm">
          No se pudo enviar. Intentá nuevamente o contactanos por WhatsApp.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className={`w-full py-4 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 disabled:opacity-50 ${btn}`}
      >
        {state === 'loading' ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}
