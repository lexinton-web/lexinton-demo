/**
 * POST /api/leads
 *
 * Endpoint genérico para TODOS los formularios del sitio.
 *
 * 1. Envía el lead a Tokko CRM (comportamiento existente).
 *    El cliente ve los leads en su panel de Tokko bajo el tag correspondiente.
 *
 * 2. Captura el lead en Supabase (nuevo).
 *    Si Supabase falla, el formulario sigue funcionando igual (try/catch).
 *
 * Tags en Tokko:
 *   "Tasación" | "Quiero Vender" | "Inversores" | "Emprendimientos"
 *   "Contacto" | "Home" | "Consulta de propiedad"
 *
 * Body esperado:
 *   {
 *     nombre: string         (requerido)
 *     email: string          (requerido)
 *     telefono?: string
 *     mensaje?: string
 *     tipo?: string          → tag principal (ej: "Tasación")
 *     propiedad_id?: number  → ID de Tokko si es consulta sobre prop específica
 *     extra?: string         → info adicional (presupuesto, barrio, plazo, etc.)
 *   }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createLeadsClient, ORG_ID } from '@/lib/supabase-leads'

export const dynamic = 'force-dynamic'

const TOKKO_API_KEY = process.env.TOKKO_API_KEY

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('549')) return '+' + digits
  if (digits.startsWith('54')) return '+549' + digits.slice(2)
  if (digits.startsWith('0')) return '+549' + digits.slice(1)
  if (digits.length === 10) return '+549' + digits
  return '+549' + digits
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[API /leads] recibido:', JSON.stringify(body))
    const { nombre, email, telefono, mensaje, tipo, propiedad_id, extra,
            operation, page_url, form_type } = body

    // Validación básica
    if (!nombre || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Construir el mensaje completo
    const textParts = []
    if (mensaje) textParts.push(mensaje)
    if (extra) textParts.push(extra)
    if (tipo) textParts.push(`Origen: ${tipo}`)
    const text = textParts.join('\n') || tipo || 'Consulta desde la web'

    // Tags para identificar en el panel de Tokko
    const tags = tipo ? [tipo] : ['Contacto']

    // ── 1. Enviar a Tokko ────────────────────────────────────────────────────
    const tokkoBody: Record<string, unknown> = {
      name: String(nombre).trim().slice(0, 100),
      email: String(email).trim().slice(0, 200),
      phone: String(telefono ?? '').trim().slice(0, 50),
      text: text.slice(0, 1000),
      tags,
    }

    if (propiedad_id && !isNaN(Number(propiedad_id))) {
      tokkoBody.property = Number(propiedad_id)
    }

    const tokkoRes = await fetch(
      `https://www.tokkobroker.com/api/v1/webcontact/?key=${TOKKO_API_KEY}&format=json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokkoBody),
      }
    )

    if (!tokkoRes.ok) {
      console.error('[API /leads] Tokko error:', tokkoRes.status, await tokkoRes.text().catch(() => ''))
      return NextResponse.json(
        { error: 'No se pudo enviar. Intentá nuevamente.' },
        { status: 500 }
      )
    }

    // ── 2. Capturar en Supabase (non-blocking) ───────────────────────────────
    captureLeadInSupabase({
      nombre: String(nombre).trim(),
      email: String(email).trim().toLowerCase(),
      telefono: telefono ? String(telefono).trim() : undefined,
      mensaje: text,
      tipo: tipo ?? 'Contacto',
      propiedad_id: propiedad_id ? String(propiedad_id) : undefined,
      operation: operation ? String(operation) : undefined,
      page_url: page_url ? String(page_url) : undefined,
      form_type: form_type ? String(form_type) : undefined,
      raw_body: body,
    }).catch(err => {
      console.error('[API /leads] Supabase capture failed (non-blocking):', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /leads] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ── Supabase lead capture ─────────────────────────────────────────────────────

async function captureLeadInSupabase(data: {
  nombre: string
  email: string
  telefono?: string
  mensaje?: string
  tipo: string
  propiedad_id?: string
  operation?: string
  page_url?: string
  form_type?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw_body?: any
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createLeadsClient() as any
  const { nombre, email, telefono, mensaje, tipo, propiedad_id,
          operation, page_url, form_type, raw_body } = data
  // normalizePhone handles prefixed strings like "+54 1134567890" — strip non-digits first
  const phoneNormalized = telefono ? normalizePhone(telefono) : null

  // Dedup: mismo email + misma propiedad + últimos 30 minutos
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('org_id', ORG_ID)
    .eq('email', email)
    .single()

  if (existingContact?.id) {
    let supaPropertyId: string | null = null
    if (propiedad_id) {
      const { data: prop } = await supabase
        .from('properties')
        .select('id')
        .eq('org_id', ORG_ID)
        .eq('tokko_id', propiedad_id)
        .single()
      supaPropertyId = prop?.id ?? null
    }

    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    let dupQuery = supabase
      .from('leads')
      .select('id')
      .eq('contact_id', existingContact.id)
      .gte('received_at', cutoff)
    dupQuery = supaPropertyId
      ? dupQuery.eq('property_id', supaPropertyId)
      : dupQuery.is('property_id', null)

    const { data: dupLead } = await dupQuery.limit(1).maybeSingle()
    if (dupLead?.id) {
      console.log('[Supabase leads] Duplicate detected, skipping:', dupLead.id)
      return { duplicate: true }
    }
  }

  // Upsert contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      {
        org_id: ORG_ID,
        full_name: nombre.slice(0, 100),
        email,
        phone: telefono ? String(telefono).slice(0, 50) : null,
        phone_normalized: phoneNormalized,
      },
      { onConflict: 'org_id,email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (contactError) {
    throw new Error(`Contact upsert failed: ${contactError.message}`)
  }

  // Find property in Supabase by tokko_id
  let propertyId: string | null = null
  if (propiedad_id) {
    const { data: prop } = await supabase
      .from('properties')
      .select('id')
      .eq('org_id', ORG_ID)
      .eq('tokko_id', propiedad_id)
      .single()
    propertyId = prop?.id ?? null
  }

  // Insert lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      org_id: ORG_ID,
      contact_id: contact.id,
      property_id: propertyId,
      source: 'web_form',
      operation: operation ?? null,
      message: mensaje ? mensaje.slice(0, 2000) : null,
      subject: tipo,
      raw_email_uid: 'web_' + Date.now(),
      received_at: new Date().toISOString(),
      metadata: {
        form_type: form_type ?? tipo,
        page_url: page_url ?? null,
        tokko_property_id: propiedad_id ?? null,
        raw_form_data: raw_body ?? null,
      },
    })
    .select('id')
    .single()

  if (leadError) {
    throw new Error(`Lead insert failed: ${leadError.message}`)
  }

  // Insert lead_state NUEVO
  await supabase
    .from('lead_states')
    .insert({
      lead_id: lead.id,
      state: 'NUEVO',
      note: `Lead recibido vía formulario web — ${tipo}`,
    })

  console.log('[Supabase leads] Lead captured:', lead.id)
  return { success: true, lead_id: lead.id }
}
