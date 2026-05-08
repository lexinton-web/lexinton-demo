/**
 * POST /api/contact
 *
 * Recibe el formulario de contacto del sitio y crea un lead en Tokko CRM.
 * El lead aparece directamente en el panel del cliente.
 *
 * Body esperado:
 *   { propertyId, name, email, phone, message }
 *
 * Validación básica incluida — nunca confiar en datos del cliente.
 */

import { NextRequest, NextResponse } from 'next/server'
import { submitPropertyLead } from '@/lib/tokko/queries'
import { createLeadsClient, ORG_ID } from '@/lib/supabase-leads'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[API /contact] recibido:', JSON.stringify(body))

    const { propertyId, name, email, phone, message } = body

    // Validación básica
    if (!propertyId || !name || !email) {
      return NextResponse.json(
        { error: 'Campos requeridos: propertyId, name, email' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const result = await submitPropertyLead({
      property_id: parseInt(propertyId, 10),
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 200),
      phone: String(phone ?? '').trim().slice(0, 50),
      message: String(message ?? '').trim().slice(0, 1000),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'No se pudo enviar el mensaje. Intentá nuevamente.' },
        { status: 500 }
      )
    }

    // Capturar en Supabase (non-blocking — no afecta al usuario si falla)
    captureContactInSupabase({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      message: String(message ?? '').trim(),
      propertyId: String(propertyId),
    }).catch(err => {
      console.error('[API /contact] Supabase capture failed (non-blocking):', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /contact] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ── Supabase capture ──────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('549')) return '+' + digits
  if (digits.startsWith('54')) return '+549' + digits.slice(2)
  if (digits.startsWith('0')) return '+549' + digits.slice(1)
  if (digits.length === 10) return '+549' + digits
  return '+549' + digits
}

async function captureContactInSupabase(data: {
  name: string
  email: string
  phone?: string
  message?: string
  propertyId: string
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createLeadsClient() as any
  const { name, email, phone, message, propertyId } = data
  const phoneNormalized = phone ? normalizePhone(phone) : null

  // Dedup: mismo email + misma propiedad + 30 min
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('org_id', ORG_ID)
    .eq('email', email)
    .single()

  if (existingContact?.id) {
    const { data: prop } = await supabase
      .from('properties')
      .select('id')
      .eq('org_id', ORG_ID)
      .eq('tokko_id', propertyId)
      .single()
    const supaPropertyId = prop?.id ?? null

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
      console.log('[Supabase /contact] Duplicate, skipping:', dupLead.id)
      return { duplicate: true }
    }
  }

  // Upsert contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      {
        org_id: ORG_ID,
        full_name: name.slice(0, 100),
        email,
        phone: phone ? phone.slice(0, 50) : null,
        phone_normalized: phoneNormalized,
      },
      { onConflict: 'org_id,email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (contactError) throw new Error(`Contact upsert failed: ${contactError.message}`)

  // Find property
  const { data: prop } = await supabase
    .from('properties')
    .select('id, operation')
    .eq('org_id', ORG_ID)
    .eq('tokko_id', propertyId)
    .single()

  // Insert lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      org_id: ORG_ID,
      contact_id: contact.id,
      property_id: prop?.id ?? null,
      source: 'web_form',
      operation: prop?.operation ?? null,
      message: message ? message.slice(0, 2000) : null,
      subject: 'Consulta de propiedad',
      raw_email_uid: 'web_' + Date.now(),
      received_at: new Date().toISOString(),
      metadata: {
        form_type: 'consulta_propiedad',
        tokko_property_id: propertyId,
      },
    })
    .select('id')
    .single()

  if (leadError) throw new Error(`Lead insert failed: ${leadError.message}`)

  await supabase.from('lead_states').insert({
    lead_id: lead.id,
    state: 'NUEVO',
    note: 'Lead recibido vía formulario web — Consulta de propiedad',
  })

  console.log('[Supabase /contact] Lead captured:', lead.id)
  return { success: true, lead_id: lead.id }
}
