/**
 * Datos del sitio usados en metadatos, sitemap y robots.
 *
 * SITE_URL es el dominio canónico: Vercel redirige lexinton.com.ar → www,
 * así que todas las URLs absolutas (canonical, og:url, sitemap) usan www.
 */

export const SITE_URL = 'https://www.lexinton.com.ar'

export const SITE_NAME = 'Lexinton Propiedades'

export const HOME_TITLE = 'Lexinton Propiedades — Especialistas en operaciones inmobiliarias en Palermo'
export const HOME_DESCRIPTION =
  'Coordinamos venta, compra y tasación con una estrategia clara, tiempos sincronizados y acompañamiento experto. 20 años de trayectoria en CABA y zona norte.'

/** Imagen por defecto para compartir en redes (1200×630) */
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og-default.jpg`,
  width: 1200,
  height: 630,
  alt: 'Lexinton Propiedades — Venta, compra y tasación en Palermo y zona norte',
}

/** Arma una URL absoluta a partir de un path ("/tasar" → "https://www.lexinton.com.ar/tasar") */
export function absoluteUrl(path = '/'): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}
