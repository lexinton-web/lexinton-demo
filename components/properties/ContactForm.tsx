'use client'
/**
 * ContactForm — Formulario de contacto reutilizable.
 * Usado en ContactModal (popup) y en la sidebar de /propiedades/[id] y /emprendimientos/[id].
 */
import { useState } from 'react'
import { Icon } from '@iconify/react'
import type { TokkoProperty } from '@/lib/tokko/types'
import { PhoneInput } from '@/components/ui/PhoneInput'

interface Props {
  property?: TokkoProperty
  customTitle?: string
  customMessage?: string
  showPropertyType?: boolean
  showBarrio?: boolean
  showPlazoVenta?: boolean
  showAyuda?: boolean
  onSuccess?: () => void
}

export function ContactForm({ property, customTitle, customMessage, showPropertyType, showBarrio, showPlazoVenta, showAyuda, onSuccess }: Props) {
  const address = property ? (property.fake_address || property.address || 'esta propiedad') : null
  const initialMessage = customMessage ||
    (address
      ? `¡Hola! Quiero que se comuniquen conmigo por esta propiedad en ${address} que vi en Lexinton Propiedades.`
      : 'Hola Lexinton, me gustaría recibir más información sobre sus servicios.')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: initialMessage,
  })
  const [phonePrefix, setPhonePrefix] = useState('+54')
  const [tipoPropiedad, setTipoPropiedad] = useState('')
  const [barrio, setBarrio] = useState('')
  const [plazoVenta, setPlazoVenta] = useState('')
  const [ayuda, setAyuda] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) return
    setSending(true)
    const mensajeFinal = [
      form.mensaje,
      tipoPropiedad ? `Tipo de propiedad: ${tipoPropiedad}` : '',
      barrio ? `Barrio: ${barrio}` : '',
      plazoVenta ? `Plazo de venta: ${plazoVenta}` : '',
      ayuda ? `Consulta sobre: ${ayuda}` : '',
    ].filter(Boolean).join('\n')
    const tipoFinal = ayuda || (property ? 'Consulta de propiedad' : tipoPropiedad || 'Consulta general')
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono ? `${phonePrefix} ${form.telefono}` : '',
          mensaje: mensajeFinal,
          tipo: tipoFinal,
          propiedad_id: property?.id ?? null,
          form_type: property ? 'consulta_propiedad' : 'contacto',
          operation: property?.operations?.[0]?.operation_type ?? null,
          page_url: typeof window !== 'undefined' ? window.location.href : null,
        }),
      })
      setSent(true)
      onSuccess?.()
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  if (sent) {
    return (
      <div className="text-center py-8 px-6">
        <Icon icon="solar:check-circle-bold" className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">¡Consulta enviada!</p>
        <p className="text-sm text-gray-500">Te vamos a contactar en menos de 2 horas hábiles.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">
          {customTitle || 'Contactate con Lexinton Propiedades'}
        </h3>
        {property && (
          <p className="text-sm text-gray-500 mt-1">
            por la propiedad en {property.location?.name || 'Buenos Aires'}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg
                text-base focus:border-gray-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg
                text-base focus:border-gray-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
          <PhoneInput
            prefix={phonePrefix}
            onPrefixChange={setPhonePrefix}
            value={form.telefono}
            onChange={v => setForm(f => ({ ...f, telefono: v }))}
            prefixClassName="flex items-center gap-1.5 px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 min-w-[84px]"
            inputClassName="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:border-gray-400 focus:outline-none transition-colors"
          />
        </div>

        {showBarrio && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Barrio</label>
            <input
              type="text"
              value={barrio}
              onChange={e => setBarrio(e.target.value)}
              placeholder="Ej: Palermo, Belgrano..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        )}

        {showPropertyType && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipo de propiedad</label>
            <select
              value={tipoPropiedad}
              onChange={e => setTipoPropiedad(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                text-sm text-gray-700 focus:border-gray-400 focus:outline-none bg-white"
            >
              <option value="">Selección un tipo</option>
              <option value="Departamento">Departamento</option>
              <option value="Casa">Casa</option>
              <option value="PH">PH</option>
              <option value="Local comercial">Local comercial</option>
              <option value="Oficina">Oficina</option>
              <option value="Terreno">Terreno</option>
              <option value="Cochera">Cochera</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        )}

        {showPlazoVenta && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">¿En qué plazo pensás vender?</label>
            <select
              value={plazoVenta}
              onChange={e => setPlazoVenta(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                text-sm text-gray-700 focus:border-gray-400 focus:outline-none bg-white"
            >
              <option value="">Seleccioná una opción</option>
              <option value="Lo antes posible">Lo antes posible</option>
              <option value="1 a 3 meses">1 a 3 meses</option>
              <option value="3 a 6 meses">3 a 6 meses</option>
              <option value="Sin apuro definido">Sin apuro definido</option>
            </select>
          </div>
        )}

        {showAyuda && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">¿En qué te podemos ayudar? *</label>
            <select
              value={ayuda}
              onChange={e => setAyuda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                text-sm text-gray-700 focus:border-gray-400 focus:outline-none bg-white"
            >
              <option value="">Seleccioná una opción</option>
              <option value="Tasación">Quiero tasar mi propiedad</option>
              <option value="Quiero Vender">Quiero vender mi propiedad</option>
              <option value="Consulta de propiedad">Consulta sobre una propiedad</option>
              <option value="Inversores">Información para inversores</option>
              <option value="Emprendimientos">Información sobre emprendimientos</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Mensaje</label>
          <textarea
            rows={3}
            value={form.mensaje}
            onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg
              text-base focus:border-gray-400 focus:outline-none transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={sending || !form.nombre || !form.email}
          className="w-full h-12 bg-[#EF6C00] text-white rounded-xl
            text-sm font-medium flex items-center justify-center gap-2
            hover:bg-[#E65100] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Enviando...' : (
            <>
              Contactar
              <Icon icon="solar:letter-bold" className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
