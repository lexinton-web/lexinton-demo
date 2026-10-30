import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from '@/lib/site'

interface PageMetadataOptions {
  title: string
  description: string
  /** Path canónico de la página, ej. "/tasar" */
  path: string
  /** Título para redes si difiere del <title> (por defecto, el mismo) */
  socialTitle?: string
  image?: { url: string; alt?: string; width?: number; height?: number }
  keywords?: string
  robots?: Metadata['robots']
}

/**
 * Metadatos consistentes para una página: title, description, canonical,
 * Open Graph y Twitter. Evita que cada página herede el og:url y los textos del home.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  image,
  keywords,
  robots,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  const img = image ?? DEFAULT_OG_IMAGE
  // Absoluta siempre: las redes no resuelven URLs relativas
  const images = [{ ...img, url: img.url.startsWith('/') ? absoluteUrl(img.url) : img.url }]
  const ogTitle = socialTitle ?? title

  return {
    title,
    description,
    ...(keywords && { keywords }),
    ...(robots && { robots }),
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'es_AR',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: images.map((i) => i.url),
    },
  }
}
