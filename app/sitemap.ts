/**
 * Sitemap dinámico para Lexinton Propiedades
 *
 * Incluye:
 * - Páginas estáticas principales
 * - Propiedades activas (con el mismo slug que declara su canonical)
 * - Emprendimientos
 *
 * NO incluye:
 * - URLs con filtros (?operation=Sale, etc.) — están marcadas noindex
 * - /api/* — son route handlers, no páginas
 *
 * No se informa lastModified: Tokko no da fecha de última modificación y
 * poner "ahora" en todas las URLs hace que Google ignore la señal.
 */

import type { MetadataRoute } from 'next'
import { getAllPropertyRefs, getDevelopments } from '@/lib/tokko/queries'
import { makeDevelopmentSlug, makePropertySlug } from '@/lib/tokko/utils'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1.0 },
    { url: absoluteUrl('/propiedades'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/tasar'), changeFrequency: 'monthly', priority: 0.85 },
    { url: absoluteUrl('/quiero-vender'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/emprendimientos'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/inversor'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/contacto'), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Propiedades activas desde Tokko
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const refs = await getAllPropertyRefs()
    propertyPages = refs.map((p) => ({
      url: absoluteUrl(`/propiedades/${makePropertySlug(p.id, p.address)}`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Si la API falla, el sitemap se genera sin propiedades individuales
    console.warn('[Sitemap] No se pudieron obtener las propiedades')
  }

  let developmentPages: MetadataRoute.Sitemap = []
  try {
    const devs = await getDevelopments()
    developmentPages = devs.map((d) => ({
      url: absoluteUrl(`/emprendimientos/${makeDevelopmentSlug(d)}`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    console.warn('[Sitemap] No se pudieron obtener los emprendimientos')
  }

  return [...staticPages, ...developmentPages, ...propertyPages]
}
