# Lexinton Propiedades — Contexto del Proyecto

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS con variables custom en tailwind.config.ts
- Framer Motion para animaciones
- @iconify/react para íconos (familia solar: y line-md:)
- yet-another-react-lightbox para galería de fotos
- Vercel para deploy

## Integraciones externas
- **Tokko Broker**: CRM inmobiliario. API REST en `https://www.tokkobroker.com/api/v1/`
  - API key en variable de entorno TOKKO_API_KEY (nunca en el cliente)
  - Siempre usar `lang=es` en los fetches para obtener datos en español
  - Las propiedades se piden vía route handlers en `app/api/` (proxy server-side)
  - Revalidación: 300s para propiedades, 600s para featured y developments
- **Cliengo**: widget de chat flotante. Script en `components/CliengoScript.tsx`
  - Carga diferida con requestIdleCallback — no tocar la estrategia de carga
- **WhatsApp**: botón flotante en `components/WhatsAppButton.tsx`
  - Número: 5491131519928

## Estructura de carpetas clave
- `app/` — páginas Next.js App Router
- `components/properties/` — cards, galería, formulario de contacto
- `components/home/` — secciones específicas del home
- `components/ui/` — componentes reutilizables (SectionHeader, SocialFollowBar, etc.)
- `components/search/` — buscador y filtros de propiedades
- `lib/tokko/` — client, queries, types, translations, utils
- `public/logos/` — logos SVG oficiales del cliente
- `docs/` — documentación interna (no se sube información sensible)

## Paleta de colores
- Rojo principal: #C41230
- Oscuro hero: #0f1923
- Texto principal: #111111
- Gris claro secciones: #f5f5f5
- Blanco: #ffffff
- Verde WhatsApp: #25D366
- Botón Contactar: #374151

## Logos
- `public/logos/lexinton-logo-original.svg` — navbar sobre fondo claro
- `public/logos/lexinton-logo-blanco.svg` — navbar sobre fondo oscuro y footer
- Los SVG no deben tener fondo negro (es del archivo de presentación del diseñador)

## Formularios de contacto
- Componente único: `components/properties/ContactForm.tsx`
- Todos los formularios del sitio usan ContactForm — no crear formularios alternativos
- Los leads van a Tokko via `app/api/leads/route.ts`
- Props disponibles: showPropertyType, showBarrio, showPlazoVenta, showAyuda

## Traducciones
- Los datos de Tokko vienen mezclados en inglés y español
- Diccionario en `lib/tokko/translations.ts`
- Función helper: translate(value, DICT)
- Siempre usar lang=es en el fetch Y traducir con el diccionario como doble cobertura

## Reglas importantes
- La API key de Tokko NUNCA va en el frontend — solo en route handlers server-side
- El archivo .env.local nunca se commitea
- Verificar visualmente en localhost antes de reportar una tarea como completada
- No usar localStorage ni sessionStorage
- Cliengo y su estrategia de carga no se tocan sin consultar
- No agregar dependencias nuevas sin evaluar el impacto en bundle size
  (el sitio ya tuvo una regresión de performance por esto)

## Convenciones de código
- Animaciones con Framer Motion usando las variantes de lib/animations.ts
- Íconos de la familia solar: para UI general, line-md: para animados
- Imágenes de Tokko con next/image y sizes correcto según contexto
- priority={true} solo en imágenes del primer viewport
- ISR con revalidate en los fetches de Tokko

## Deploy
- Plataforma: Vercel
- Variables de entorno configuradas en panel de Vercel (ver docs/VERCEL_DEPLOY_GUIDE.md)
- Branch principal: main
- Repo: ver con `git remote get-url origin`