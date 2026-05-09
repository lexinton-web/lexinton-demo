# Flujo de leads web → Supabase

## Qué envía el formulario

Cuando un usuario completa un formulario de propiedad en el sitio (`/propiedades/[id]`),
el componente `ContactForm.tsx` hace un POST a `/api/leads` con este body:

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@gmail.com",
  "telefono": "+54 11 3456 7890",
  "mensaje": "Quiero información sobre esta propiedad...",
  "tipo": "Consulta de propiedad",

  "propiedad_id": 7989214,          // ← property.id (número Tokko)
  "form_type": "consulta_propiedad",
  "operation": "Sale",              // ← property.operations[0].operation_type
  "page_url": "https://lexinton-demo.vercel.app/propiedades/7989214-..."
}
```

> El campo clave es `propiedad_id` — es el ID numérico de Tokko
> (el mismo número que aparece al inicio de la URL de la propiedad).

---

## Cómo lo guarda `/api/leads/route.ts`

1. **Envía a Tokko CRM** (comportamiento primario — no blocking)
2. **Llama a `captureLeadInSupabase()`** que:
   - Upsert en tabla `contacts` (conflict en `org_id, email`)
   - Busca la propiedad en `properties` por `tokko_id = propiedad_id`
   - Inserta en tabla `leads` con:
     - `contact_id` → UUID del contacto
     - `property_id` → UUID de la propiedad en Supabase
     - `operation` → "Sale" / "Rent" / "Temporary Rent"
     - `source` → `"web_form"`
     - `metadata` (jsonb):
       ```json
       {
         "form_type": "consulta_propiedad",
         "tokko_property_id": "7989214",
         "page_url": "https://...",
         "raw_form_data": { ...body completo... }
       }
       ```
   - Inserta en `lead_states` → `state: "NUEVO"`

---

## Cómo lo lee el panel (`lexinton-leads-panel`)

El panel lee los leads de Supabase con un JOIN:

```sql
SELECT
  l.id,
  l.operation,
  l.metadata->>'form_type'         AS form_type,
  l.metadata->>'tokko_property_id' AS tokko_property_id,
  l.property_id,                   -- UUID de la propiedad en Supabase
  p.canonical_name,                -- ej: "LUIS MARIA CAMPOS AL 1300"
  p.tokko_id,                      -- ej: "7989214"
  c.full_name,
  c.email,
  c.phone,
  lcs.state                        -- NUEVO / EN_PROCESO / CERRADO / etc.
FROM leads l
LEFT JOIN contacts c  ON c.id  = l.contact_id
LEFT JOIN properties p ON p.id = l.property_id
LEFT JOIN lead_current_state lcs ON lcs.lead_id = l.id
WHERE l.org_id = 'a0000000-0000-0000-0000-000000000001'
ORDER BY l.created_at DESC;
```

**Para mostrar la propiedad vinculada**, el panel usa `l.property_id` (UUID Supabase)
y el JOIN con `properties` le da `canonical_name`, `tokko_id`, dirección, etc.

Si `property_id` es `null` → el lead llegó sin propiedad (ej: formulario genérico de contacto)
o la propiedad no estaba sincronizada en Supabase al momento del envío.

---

## Tabla de campos

| Campo en `leads` | Origen | Ejemplo |
|---|---|---|
| `source` | hardcoded | `"web_form"` |
| `operation` | `property.operations[0].operation_type` | `"Sale"` |
| `contact_id` | upsert en `contacts` | UUID |
| `property_id` | lookup `properties.tokko_id = propiedad_id` | UUID |
| `metadata.form_type` | campo del form body | `"consulta_propiedad"` |
| `metadata.tokko_property_id` | `propiedad_id` del body | `"7989214"` |
| `metadata.page_url` | `window.location.href` | `"https://..."` |

---

## Dominios en producción

| URL | Proyecto Vercel | Estado |
|---|---|---|
| `lexinton-demo.vercel.app` | `lexinton-web` (alias) | ✅ activo |
| `lexinton-web.vercel.app` | `lexinton-web` | ✅ activo |
| `lexinton-leads-panel.vercel.app` | `lexinton-leads-panel` | ✅ panel |

> Ambos dominios del sitio público apuntan al mismo deployment de `lexinton-web`.
