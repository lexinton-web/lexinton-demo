# Performance Report — Lexinton Propiedades

**Fecha:** 13 mayo 2026  
**URL:** https://lexinton-demo.vercel.app  
**Dispositivo:** Mobile (emulado — Moto G Power, 4G slow)  
**Herramienta:** Lighthouse CLI 12.x (local, misma versión que PSI)

---

## Scores actuales

| Categoría | Score |
|-----------|-------|
| **Performance** | **40 / 100** 🔴 |
| Accessibility | 91 / 100 🟢 |
| Best Practices | 73 / 100 🟡 |
| SEO | 100 / 100 🟢 |

---

## Core Web Vitals (mobile)

| Métrica | Valor | Estado |
|---------|-------|--------|
| **LCP** — Largest Contentful Paint | **11.2 s** | ❌ Crítico (>4s) |
| **TBT** — Total Blocking Time | **810 ms** | ❌ Crítico (>600ms) |
| **CLS** — Cumulative Layout Shift | **0** | ✅ Perfecto |
| FCP — First Contentful Paint | 5.7 s | ❌ Crítico (>3s) |
| Speed Index | 6.4 s | ❌ Pobre |
| TTI — Time to Interactive | 11.2 s | ❌ Crítico |

> El LCP está determinado por el `<h1>` del hero (texto), no la imagen — lo cual indica que la imagen hero aún no está lista cuando el texto aparece.

---

## Desglose del LCP

El LCP es el `<h1 class="font-serif">` dentro del hero section.

| Subparte | Duración |
|----------|----------|
| Time to First Byte (TTFB) | ~50 ms ✅ |
| Resource load delay | alto — por bloqueo de JS |
| Resource load duration | alto — JS pesado bloquea render |
| Element render delay | alto — estilos + layout |

El servidor responde en 50ms — **el problema NO es el servidor**. Es el JavaScript del lado cliente que bloquea el render.

---

## Principales problemas (ordenados por impacto)

### 1. 🔴 Tiempo de ejecución de JavaScript — 2.5s de CPU

**Impacto:** Causa directamente el TBT de 810ms y el TTI de 11.2s  
**Main thread total: 7.2s**

| Script | Tiempo total | CPU script |
|--------|-------------|------------|
| `183-4f9d6235fa6f26e2.js` (Framer Motion + deps) | 1603ms | 416ms |
| `gtag/js` (Google Analytics) | 911ms | 834ms |
| `117-45a4ab45359d0cd6.js` (chunks Next.js) | 770ms | 695ms |
| `fd9d1056-8e591228d2e97797.js` | 254ms | 220ms |
| Cliengo `mainclgo.bundle.js` | 83ms | 72ms |

**Fix propuesto:**
- Diferir Google Analytics (`strategy="afterInteractive"` con `next/script` — ya debería estar pero verificar)
- Auditar qué hay en `183-` y `117-` — posible code splitting
- Considerar reemplazar Framer Motion por CSS animations en secciones no críticas

**Complejidad:** Media

---

### 2. 🔴 Entrega de imágenes — 221 KB de ahorro potencial

**Impacto:** Contribuye al LCP alto y al FCP lento  
**Imágenes afectadas:**
- Hero: `palermo1.jpg` — sirviéndose como JPEG cuando debería ser AVIF/WebP
- Lifestyle images en DualCTA, TasacionCTA, StatHighlight
- Imágenes del carousel de emprendimientos

**Fix propuesto:**
- `next/image` ya está en uso — verificar que `formats: ['image/avif', 'image/webp']` esté en `next.config.mjs`
- Agregar `sizes` correctos a imágenes above-the-fold
- El hero `palermo1.jpg` (91KB en móvil) es razonable — el problema es el bloqueo de JS que retrasa su render

**Complejidad:** Baja

---

### 3. 🔴 Font display — 190ms bloqueando (Cliengo)

**Impacto:** 190ms de LCP adicional  
**Causa:** `cdn.icomoon.io/146409/cliengowidget/icomoon.woff2` carga sin `font-display: swap`  
**Fuente:** Cliengo widget (CSS externo del widget)

**Fix propuesto:** No podemos modificar el CSS de Cliengo. La única mitigación sería cargar Cliengo aún más tarde (después del TTI).  
**Nota:** Cliengo NO se toca — decisión del cliente.

**Complejidad:** No accionable

---

### 4. 🟡 JavaScript no utilizado — 54 KB (Google Analytics)

**Impacto:** 54KB de JS que se parsea pero no se usa en el initial load  
**Causa:** `gtag/js` se carga eagerly

**Fix propuesto:** Verificar que en el componente de Analytics se usa `strategy="afterInteractive"` o `strategy="lazyOnload"` en `next/script`

**Complejidad:** Baja

---

### 5. 🟡 Legacy JavaScript — 11 KB

**Impacto:** Menor (11KB)  
**Causa:** Algún paquete emitiendo código ES5 innecesario para browsers modernos

**Fix propuesto:** Revisar `browserslist` en package.json; generalmente Next.js maneja esto automáticamente.

**Complejidad:** Baja

---

### 6. 🟡 Cache lifetimes (Vercel CDN)

**Impacto:** Recarga innecesaria en visitas repetidas  
**Causa:** Algunos assets sin headers de cache óptimos  
**Fix propuesto:** Vercel maneja automáticamente el cache de `/_next/static/` con headers inmutables. Verificar que las imágenes de `/public/` tengan cache headers en `next.config.mjs` vía `headers()`.

**Complejidad:** Baja

---

### 7. 🔵 404 en favicon

**Impacto:** Error en consola, request extra fallido  
**Causa:** `https://lexinton-demo.vercel.app/favicon.ico` devuelve 404  
**Fix propuesto:** Crear `app/favicon.ico` o configurar en `app/layout.tsx` con `metadata.icons`

**Complejidad:** Baja (trivial)

---

## Third-party scripts y su impacto

| Script | Tamaño | CPU blocking | Accionable |
|--------|--------|-------------|------------|
| Google Tag Manager / Analytics | 161 KB | **834ms** | ✅ Sí — diferir más |
| Cliengo widget | 133 KB | ~72ms | ❌ No tocar (cliente) |
| icomoon.woff2 (Cliengo font) | — | 190ms | ❌ No tocar (cliente) |

> **Cliengo NO se toca** — es decisión del cliente.  
> GTM/Analytics contribuye ~834ms de CPU script time — es el mayor problema accionable de third-party.

---

## Recursos más pesados (transferSize)

| Tamaño | Recurso |
|--------|---------|
| 161 KB | `googletagmanager.com/gtag/js` (Analytics) |
| 133 KB | `lw2.cliengo.com/widget.js` |
| 91 KB | `palermo1.jpg` (hero image — optimizado por next/image) |
| 66 KB | Imagen carousel (next/image) |
| 54 KB | `183-4f9d6235fa6f26e2.js` (Framer Motion bundle) |
| 54 KB | `117-45a4ab45359d0cd6.js` (Next.js chunk) |
| 48 KB | `e4af272ccee01ff0-s.p.woff2` (fuente local — Cormorant/Nunito) |
| 45 KB | HTML página principal |
| 44 KB | Imagen lifestyle |
| 39 KB | `183-*.js` chunk |
| 20 KB | `fonts.gstatic.com` (Nunito) |

---

## Problemas de Accesibilidad detectados (score 91)

| Problema | Descripción |
|----------|-------------|
| Color contrast | Algún elemento con contraste insuficiente texto/fondo |
| Heading order | `<h2>` o `<h3>` aparece antes de un `<h1>` en alguna sección |
| Label/name mismatch | Elementos con texto visible no coinciden con accessible name |
| Touch target size | Algunos botones/links muy pequeños en mobile |

---

## Lo que NO vamos a tocar

- **Cliengo** — decisión del cliente. Agrega ~205ms de bloqueo total pero no es negociable.
- **Tokko Broker** — la integración es necesaria para el negocio. Sus 403 en build time son conocidos y no afectan el front.
- **Google Analytics** — se puede diferir más pero el GA es decisión del cliente.

---

## Plan de acción priorizado

| Prioridad | Acción | Impacto estimado | Complejidad |
|-----------|--------|-----------------|-------------|
| 🔴 1 | Verificar `strategy="afterInteractive"` en GTM/Analytics (`next/script`) | -400ms TBT | Baja |
| 🔴 2 | Auditar chunks `183-` y `117-` — code splitting de Framer Motion | -300ms TBT | Media |
| 🔴 3 | Agregar `preconnect` para Google Fonts y GTM | -100-200ms FCP | Baja |
| 🟡 4 | Verificar `formats: ['image/avif', 'image/webp']` en `next.config.mjs` | -50-100ms LCP | Baja |
| 🟡 5 | Crear `favicon.ico` para eliminar 404 | cosmético | Baja |
| 🟡 6 | Auditar contraste de colores para Accessibility 91→95+ | cosmético | Baja |
| 🔵 7 | `font-display: optional` en fuentes propias para eliminar FOUT | -50ms FCP | Baja |
| 🔵 8 | Headers de cache para `/public/logos/` y assets estáticos | repetidas visitas | Baja |

> **Objetivo realista mobile con los fixes accionables:** Performance 55-65 (desde 40)  
> El techo sin tocar Cliengo ni eliminar Analytics es aproximadamente 65-70 en mobile.

---

## Notas técnicas

- El **servidor responde en 50ms** — Vercel Edge está funcionando correctamente.
- El **CLS es 0** — excelente, no hay layout shift.
- El problema de performance es **100% JavaScript del lado cliente** — principalmente Framer Motion y Analytics bloqueando el main thread.
- En **desktop** el score debería ser 70-80 ya que el CPU throttling de mobile es 4x más severo en Lighthouse.
