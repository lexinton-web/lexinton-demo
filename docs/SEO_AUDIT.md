# Auditoría SEO — lexinton.com.ar

**Fecha:** 30/10/2026 · **Sitio auditado:** producción (`https://www.lexinton.com.ar`, Next.js en Vercel) + código de `main` (`e809f1c`)

---

## 1. Resumen

El sitio está bien de base: todo se renderiza en el servidor (Google y los LLMs leen el contenido sin ejecutar JS), cada propiedad tiene título, descripción, canonical y og:image propios, y los listados filtrados están en `noindex`. Pero hay **errores técnicos que hoy le mandan señales contradictorias a Google**, y no hay nada pensado para buscadores con IA.

Lo más grave, en orden:

1. **No existe `robots.txt`** (`/robots.txt` → 404). Google no encuentra el sitemap por su cuenta.
2. **Todas las URLs canónicas apuntan a un dominio que redirige.** El código usa `https://lexinton.com.ar/...`, pero Vercel redirige el dominio sin www a `https://www.lexinton.com.ar` (308). Canonical, `og:url` y sitemap apuntan a URLs que redirigen.
3. **El sitemap tiene 4 páginas que no existen** (404) y las 191 URLs de propiedades no coinciden con su canonical (`/propiedades/20399-` en el sitemap vs `/propiedades/20399-nunez-3100` en la página).
4. **Cero datos estructurados (JSON-LD).** Ni la inmobiliaria, ni las sucursales, ni las propiedades. Es lo que más usan Google y los LLMs para entender quién es Lexinton y qué publica.
5. **No hay analítica ni verificación de Search Console visible** (ver sección 3).

---

## 2. Hallazgos

Severidad: 🔴 crítico · 🟠 importante · 🟡 menor

### 2.1 Rastreo e indexación

| # | Sev. | Hallazgo | Evidencia |
|---|---|---|---|
| 1 | 🔴 | Sin `robots.txt` | `GET /robots.txt` → 404. No hay `app/robots.ts`. |
| 2 | 🔴 | Canonical en dominio que redirige | `lexinton.com.ar` → 308 → `www.lexinton.com.ar`. El dominio está hardcodeado como `https://lexinton.com.ar` en `app/sitemap.ts`, `app/layout.tsx` y en el `canonical` de cada página. |
| 3 | 🔴 | Sitemap con URLs 404 | `/inmobiliaria-en-palermo`, `/tasacion-de-propiedades-en-palermo`, `/vender-para-comprar`, `/propiedades-en-palermo` están en el sitemap y dan 404 (eran landings planificadas que nunca se crearon). |
| 4 | 🔴 | URLs del sitemap ≠ canonical | `app/sitemap.ts` arma el slug con `makePropertySlug(id, '')` → `/propiedades/20399-`. La página declara canonical `/propiedades/20399-nunez-3100`. |
| 5 | 🟠 | Al sitemap le faltan páginas | No están `/tasar`, `/quiero-vender`, `/inversor`, `/emprendimientos` ni los emprendimientos individuales. |
| 6 | 🟠 | `lastModified` siempre es "ahora" | Todas las URLs dicen que cambiaron hoy; Google termina ignorando la señal. |
| 7 | 🟠 | Cualquier slug con ID válido devuelve 200 | `/propiedades/20399-cualquier-cosa` y `/propiedades/20399` → 200. El canonical lo salva a medias; lo correcto es redirigir (308) al slug real. Lo mismo en `/emprendimientos/[id]`, donde además el canonical usa el slug que vino en la URL (`params.id`), así que cada variante se declara canónica a sí misma. |
| 8 | 🟠 | URLs del WordPress viejo dan 404 | El sitio anterior (Houzez) tenía `/propiedad/...`, `/ciudad/...`, `/area/...`, `/estado/...`, `/caracteristica/...` (Wayback Machine registra cientos). Hoy todas dan 404: se pierde el posicionamiento y los links externos que tenían. |

### 2.2 Metadatos y redes

| # | Sev. | Hallazgo | Evidencia |
|---|---|---|---|
| 9 | 🟠 | El home no tiene canonical | `app/page.tsx` no exporta `metadata`; hereda el layout, que no define `alternates`. |
| 10 | 🟠 | `og:url` y textos OG heredados en todas las páginas estáticas | `/tasar`, `/contacto`, `/inversor`, etc. muestran `og:url = https://lexinton.com.ar` y el título/descr. OG del home. Al compartir `/tasar` por WhatsApp aparece el texto del home. |
| 11 | 🟠 | Sin imagen OG por defecto | Home y páginas estáticas no tienen `og:image` → previsualización sin imagen en WhatsApp/Facebook/LinkedIn. `twitter:card` queda en `summary`. |
| 12 | 🟠 | Falta `metadataBase` | Sin eso, cualquier imagen OG relativa no se resuelve. |
| 13 | 🟡 | Título de propiedad poco descriptivo | `NUÑEZ 3100 · Venta USD 179.500 \| Lexinton`: en mayúsculas y sin tipo, ambientes ni barrio, que es lo que la gente busca ("departamento 3 ambientes venta Núñez"). |
| 14 | 🟡 | Typo en emprendimientos | `` `${title} . Emprendimiento | Lexinton` `` (espacio + punto). |
| 15 | 🟡 | `meta keywords` | Google lo ignora desde 2009. No hace daño, pero no aporta. |

### 2.3 Datos estructurados (JSON-LD)

| # | Sev. | Hallazgo |
|---|---|---|
| 16 | 🔴 | No hay ningún bloque `application/ld+json` en el sitio. Faltan: `RealEstateAgent` (con las dos sucursales, teléfono, horarios, redes), `WebSite`, `BreadcrumbList` en propiedades y `RealEstateListing` en cada propiedad y emprendimiento. |

### 2.4 Buscadores con IA (ChatGPT, Perplexity, Claude, Gemini, Copilot)

| # | Sev. | Hallazgo |
|---|---|---|
| 17 | 🟠 | Sin `robots.txt`, no hay política explícita para los bots de IA (hoy se permiten por defecto, pero tampoco hay sitemap declarado para ellos). |
| 18 | 🟠 | No hay `/llms.txt`. |
| 19 | 🟠 | Sin datos estructurados (ver #16), los LLMs tienen que adivinar desde el HTML qué es precio, barrio, superficie, etc. |
| 20 | 🟡 | No hay contenido de preguntas frecuentes (cómo se tasa, cuánto tarda vender, comisiones, documentación). Es el tipo de texto que los LLMs citan. |

### 2.5 Medición y otros

| # | Sev. | Hallazgo |
|---|---|---|
| 21 | 🟠 | **No hay Google Analytics / GTM instalado.** El layout hace `preconnect` a `googletagmanager.com` pero no carga ningún script: hoy es una conexión desperdiciada. |
| 22 | 🟡 | `/favicon.ico` → 404 y no hay `apple-touch-icon` en PNG (iOS no usa SVG). Hay `favicon.svg` duplicado en `app/` y `public/`. |
| 23 | 🟡 | Links sociales inconsistentes: dos URLs de Facebook distintas (`/LexintonPropiedadesOficial` y `/lexintonpropiedades/`), dos variantes de YouTube y un link a `https://www.instagram.com/` sin perfil. |

---

## 3. Google Search Console

No lo puedo confirmar desde afuera, pero los indicios dicen que **hoy no está verificado (o se va a caer la verificación)**:

- El DNS está en Vercel (`ns1/ns2.vercel-dns.com`) y **no tiene ningún registro TXT** de verificación de Google.
- El HTML no tiene `<meta name="google-site-verification">`.
- No hay archivo `googleXXXX.html` en `public/` ni Google Analytics (otros dos métodos de verificación).

Si existía una propiedad del sitio WordPress, seguramente estaba verificada por meta tag o por Analytics desde el plugin de la agencia (Optimun); al cambiar de sitio eso desapareció, y Google la da de baja en la próxima revisión.

**Qué hacer (15 minutos, lo hace quien tenga acceso a Vercel y a la cuenta de Google de Lexinton):**

1. En Search Console → *Agregar propiedad* → **Dominio** → `lexinton.com.ar` (cubre www, sin www, http y https).
2. Copiar el TXT que da Google → Vercel → *Domains* → `lexinton.com.ar` → *DNS Records* → agregar registro `TXT` en `@`.
3. Verificar, enviar `https://www.lexinton.com.ar/sitemap.xml` (después de corregirlo).
4. Revisar *Páginas → No encontrado (404)* para tener la lista real de URLs viejas a redirigir.
5. Preguntarle a Lexinton/Optimun si había una propiedad vieja: si existe, pedir que nos agreguen como propietarios para conservar el historial.
6. Hacer lo mismo en **Bing Webmaster Tools** (se puede importar desde Search Console con un clic). ChatGPT Search y Copilot usan el índice de Bing.

---

## 4. Propuesta de implementación

Todo se hace con lo que ya trae Next.js 14 (`app/robots.ts`, `sitemap.ts`, `metadata`, route handlers). **No hace falta agregar dependencias.**

### Fase 1 — Correcciones críticas (≈ medio día) — ✅ implementada (30/10/2026, falta deploy)

Dominio elegido: `www`. Además de lo listado abajo se corrigió que un slug no numérico (`/propiedades/abc`) daba 500 en vez de 404, y los links del carrusel/slider de emprendimientos y de las unidades ahora usan el slug canónico.

**Decisión previa:** dominio principal. Propongo **`https://www.lexinton.com.ar`**, que es lo que Vercel sirve hoy y lo que Google ya está viendo. (La alternativa es invertir la redirección en Vercel y dejar el código como está; es igual de válido, pero cambia las URLs que Google ya conoce.)

1. **`lib/site.ts`**: una sola constante `SITE_URL` (y datos de la empresa: nombre, teléfono, email, sucursales, redes). Reemplazar los ~10 `https://lexinton.com.ar` hardcodeados.
2. **`app/layout.tsx`**: `metadataBase: new URL(SITE_URL)`, `alternates.canonical: '/'`, quitar `openGraph.url` del layout (es lo que se hereda mal), `twitter.card: 'summary_large_image'`, imagen OG por defecto.
3. **`public/og-default.jpg`** (1200×630, logo + foto de Palermo). Archivo estático, sin costo de bundle.
4. **`lib/seo.ts`**: helper `pageMetadata({ title, description, path, image? })` que arma title, description, canonical, openGraph y twitter de forma consistente. Usarlo en todas las páginas estáticas.
5. **`app/robots.ts`** (nuevo):
   ```ts
   rules: [
     { userAgent: '*', allow: '/', disallow: ['/api/'] },
   ],
   sitemap: `${SITE_URL}/sitemap.xml`,
   host: SITE_URL,
   ```
6. **`app/sitemap.ts`**:
   - Sacar las 4 landings que no existen (vuelven cuando se creen, Fase 4).
   - Agregar `/tasar`, `/quiero-vender`, `/inversor`, `/emprendimientos` y cada emprendimiento.
   - Usar el slug real: cambiar `getAllPropertyIds()` (o sumar una query liviana) para que devuelva `{ id, address }`.
   - `lastModified`: solo donde Tokko da una fecha real; si no, omitirlo.
7. **Redirección al slug canónico** en `app/propiedades/[id]/page.tsx` y `app/emprendimientos/[id]/page.tsx`: si `params.id !== slugCorrecto` → `permanentRedirect()`. Y el canonical de emprendimientos se arma con el slug correcto, no con `params.id`.
8. **Títulos de propiedad**: `Departamento 3 ambientes en venta en Núñez · Nuñez 3100 · USD 179.500 | Lexinton` (dirección en formato título, no mayúsculas).

### Fase 2 — Datos estructurados (≈ medio día)

Un componente `components/seo/JsonLd.tsx` que imprime `<script type="application/ld+json">` desde el servidor (0 KB de JS en el cliente).

| Dónde | Schema | Contenido |
|---|---|---|
| Layout (todas las páginas) | `RealEstateAgent` + `WebSite` | Nombre, logo, URL, teléfono, email, `sameAs` (redes), las dos sucursales (Migueletes 1183, Palermo / Madero 351, Vicente López) con dirección, horarios y coordenadas, `areaServed` (barrios). |
| `/propiedades/[id]` | `RealEstateListing` + `BreadcrumbList` | Título, descripción, fotos, fecha de publicación, `offers` (precio, moneda, venta/alquiler) y el inmueble (`Apartment` / `House` / `SingleFamilyResidence`) con ambientes, baños, superficie (`floorSize`), dirección y coordenadas. |
| `/emprendimientos/[id]` | `RealEstateListing` + `BreadcrumbList` | Igual, con rango de precios de las unidades. |
| `/tasar`, `/quiero-vender` | `Service` | Tasación / venta, con `provider` = la inmobiliaria y `areaServed`. |

Validar con [Rich Results Test](https://search.google.com/test/rich-results) y [validator.schema.org](https://validator.schema.org).

### Fase 3 — Buscadores con IA (≈ 2–3 horas)

1. **`robots.ts`**: declarar explícitamente los bots de IA como permitidos (`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `Bingbot`). Los de *búsqueda* (OAI-SearchBot, Claude-SearchBot, PerplexityBot) conviene permitirlos sí o sí; los de *entrenamiento* (GPTBot, ClaudeBot, Google-Extended) es decisión del cliente. Como el objetivo es visibilidad máxima, propongo permitir todos.
2. **`app/llms.txt/route.ts`**: archivo de texto generado (con ISR) con quiénes son, servicios, barrios, sucursales y contacto, links a las páginas clave y un resumen del stock actual (cantidad por barrio/operación). Opcional: `/llms-full.txt` con la lista de propiedades activas (dirección, tipo, precio, link).
   *Ojo con las expectativas:* `llms.txt` es una propuesta, no un estándar adoptado por todos. Es barato y no molesta, pero lo que más pesa es lo de las fases 1 y 2 (HTML del servidor + JSON-LD) y estar indexado en Google **y Bing**.
3. **Bloque de preguntas frecuentes** en `/tasar` y `/quiero-vender` (texto visible, no oculto): cómo se tasa, cuánto tarda vender, qué documentos hacen falta, cómo funciona vender para comprar. Es el contenido que los LLMs citan cuando alguien pregunta "¿cómo tasar mi departamento en Palermo?".
4. **IndexNow** (opcional): avisarle a Bing cuando entra o se da de baja una propiedad. Se puede disparar desde el mismo proceso que revalida el caché.

### Fase 4 — Contenido y migración (≈ 1–2 días, según cuántas landings)

1. **Redirecciones del WordPress viejo** en `next.config.mjs` → `redirects()`:
   - `/propiedad/:slug*` → `/propiedades`
   - `/ciudad/:slug*`, `/area/:slug*`, `/estado/:slug*`, `/caracteristica/:slug*` → `/propiedades`
   - Refinar con la lista real del reporte 404 de Search Console (paso 4 de la sección 3).
2. **Landings por barrio** (las que estaban en el sitemap): páginas indexables tipo `/propiedades/venta/palermo`, `/propiedades/alquiler/belgrano`, con un texto propio por barrio (2–3 párrafos), el listado filtrado y links entre barrios. Empezar por los barrios con más stock (Palermo, Belgrano, Núñez, Villa Urquiza). Esto es lo que posiciona búsquedas como "departamentos en venta en Palermo".
3. **Landing "vender para comprar"**: es el diferencial de Lexinton y no tiene página propia.

### Fase 5 — Medición (≈ 1 hora + accesos)

1. **GA4** con `next/script` (`strategy="lazyOnload"`, sin dependencia nueva), o quitar el `preconnect` a GTM si se decide no medir. Necesitamos el ID de medición del cliente (o crearle una propiedad).
2. Arreglar `favicon.ico` y agregar `apple-icon.png` (180×180) en `app/`.
3. Unificar los links de redes sociales.

### Fuera del código (lo hace el cliente, pero es lo que más pesa en búsquedas locales)

- **Google Business Profile** para cada sucursal: categoría "Agencia inmobiliaria", fotos, horarios, link al sitio, y pedir reseñas a clientes cerrados. Para "inmobiliaria en Palermo" el mapa de Google aparece antes que los resultados orgánicos.
- Mismo nombre, dirección y teléfono en todos lados (Google Business, Zonaprop, Argenprop, redes, sitio).

---

## 5. Orden sugerido

| Fase | Esfuerzo | Impacto | Depende de |
|---|---|---|---|
| Search Console + Bing (sección 3) | 15 min | Alto | Acceso a Vercel y cuenta Google del cliente |
| 1 — Críticos | ½ día | Alto | Decidir www vs. sin www |
| 2 — JSON-LD | ½ día | Alto (Google + LLMs) | Fase 1 (`lib/site.ts`) |
| 3 — IA | 2–3 h | Medio | Fase 1 |
| 5 — Medición | 1 h | Medio | ID de GA4 |
| 4 — Contenido y redirecciones | 1–2 días | Alto a mediano plazo | Reporte 404 de Search Console, textos por barrio |
