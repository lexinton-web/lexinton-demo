/**
 * Tokko Broker API — Cliente HTTP seguro (server-side only)
 *
 * CRÍTICO: La API key NUNCA se expone al browser.
 * Este módulo solo puede ser importado desde:
 *   - app/api/* (route handlers)
 *   - lib/tokko/queries.ts
 *   - Server Components (page.tsx con async)
 *
 * Si se importa en un Client Component ('use client'), Next.js lanzará error
 * porque TOKKO_API_KEY no está disponible en el bundle del cliente.
 */

const TOKKO_API_KEY = process.env.TOKKO_API_KEY
const TOKKO_BASE_URL = process.env.TOKKO_BASE_URL ?? 'https://www.tokkobroker.com/api/v1'

if (!TOKKO_API_KEY) {
  // En producción este error aparece en los logs del servidor, nunca en el cliente
  throw new Error(
    '[Tokko] TOKKO_API_KEY no está definida. Agregala a .env.local:\n' +
    'TOKKO_API_KEY=tu_api_key_aqui'
  )
}

/**
 * Hace un GET autenticado a la API de Tokko.
 * Aplica cache de 5 minutos (revalidate: 300) por defecto.
 *
 * @param endpoint   - Ruta sin slash inicial, e.g. "property", "property/19554"
 * @param params     - Query params adicionales (sin key ni format)
 * @param revalidate - Segundos de cache. 0 = sin cache (siempre fresco)
 */
export async function tokkoFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  revalidate = 300
): Promise<T> {
  const searchParams = new URLSearchParams({
    key: TOKKO_API_KEY!,
    format: 'json',
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  })

  const url = `${TOKKO_BASE_URL}/${endpoint}/?${searchParams}`

  let res = await fetch(url, {
    next: { revalidate },
    headers: { 'Accept': 'application/json' },
  })

  // Retry once on 429 — wait for Retry-After header or 2s
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10)
    await new Promise((r) => setTimeout(r, Math.min(retryAfter, 5) * 1000))
    res = await fetch(url, {
      next: { revalidate },
      headers: { 'Accept': 'application/json' },
    })
  }

  if (!res.ok) {
    // 404 → el recurso no existe (propiedad archivada, ID incorrecto)
    if (res.status === 404) {
      return null as T
    }
    const errorUrl = url.replace(TOKKO_API_KEY!, '[KEY_HIDDEN]')
    console.error(`[Tokko] API error ${res.status} en /${endpoint} → ${errorUrl}`)
    throw new Error(`[Tokko] ${res.status} ${res.statusText} en /${endpoint}`)
  }

  return res.json() as Promise<T>
}

/**
 * Hace un POST a la API de Tokko (para envío de leads).
 * Sin cache — siempre fresco.
 */
export async function tokkoPost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${TOKKO_BASE_URL}/${endpoint}/?key=${TOKKO_API_KEY!}&format=json`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `[Tokko] POST error en /${endpoint}: ${res.status} ${res.statusText}\n${text}`
    )
  }

  return res.json() as Promise<T>
}
