# Rentaly

Plataforma de transparencia para inquilinas e inquilinos en **Madrid capital**. La idea es que nadie firme un alquiler a ciegas: se puede contrastar la finca con el Catastro, situarla en su barrio y leer (o dejar) experiencias, incidentes y avisos de abuso.

## Qué hay en esta primera versión

- Mapa de los **131 barrios y 21 distritos** con la delimitación oficial del Ayuntamiento de Madrid.
- Búsqueda en vivo contra los **servicios libres del Catastro** (callejero, referencia catastral y coordenadas).
- Ficha de inmueble con uso, superficie, año, unidades constructivas y distribución de usos.
- Memoria vecinal: experiencias, notas/incidentes y notificaciones de abuso, ligadas a un barrio o a una parcela.
- Guía breve de derechos y enlaces a Catastro, índice de precios de alquiler y Oficina de Vivienda.

No mostramos titularidad ni otros datos catastrales protegidos. Los relatos de la comunidad no son resoluciones oficiales.

## Arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Cuenta de ejemplo: `inquilina@rentaly.madrid` / `madrid131`.

## Recorrido de producto

Inspirado en **Reviu** (reseñas de piso + Catastro, apodo público), **JustFix / Who Owns What** (una tarea, datos oficiales) y **Shelter** (tono calmado, el rojo solo para urgencia):

1. Explorar el mapa sin cuenta.
2. Crear cuenta → onboarding (momento del alquiler, barrio, pacto).
3. **Antes de firmar**: checklist + búsqueda catastral.
4. Publicar experiencia, incidente o aviso (hace falta sesión; en público solo se ve el apodo).
5. Cuenta con lo publicado.

## Arquitectura

Capas, de fuera hacia dentro:

```
src/app                presentación (App Router)
src/components         UI / mapa
src/lib                casos de uso (dossier, persistencia JSON, auth)
src/domain             tipos, invariantes RGPD, fuentes oficiales
src/clients            Catastro, Ayuntamiento, INE, MITMA
src/cache              TTL en proceso (Redis más adelante)
prisma/schema.prisma   modelo PostGIS de destino
```

El Catastro **no** publica titulares de personas físicas. Los “grandes tenedores” solo se modelan como personas jurídicas (BORM, CIF, SOCIMI) o como evidencia de usuaria ya anonimizada. Los aportes salen a la API sin `userId`.

Hasta que haya backend remoto, cuentas y relatos siguen en JSON (`data/` en local, `/tmp` en Vercel). El orden de persistencia es:

1. `DATABASE_URL` → Prisma (Postgres / pooler).
2. Si no hay URI, `SUPABASE_SECRET_KEY` → PostgREST en `https://ipnqyejdfcwcltutrrvh.supabase.co` (clave secreta, solo servidor).
3. Si no hay ninguna de las dos, JSON.

Pega `supabase/init.sql` en el SQL editor de Supabase si las tablas aún no existen. En Vercel añade `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SECRET_KEY` (y `DATABASE_URL` solo si usas Prisma). La clave secreta no va en el cliente.

## Fuentes

- Dirección General del Catastro, servicios web JSON (`Consulta_DNPLOC`, `Consulta_DNPRC`, `ObtenerCallejero`, `Consulta_RCCOOR`, `Consulta_CPMRC`) y WMS de parcelas.
- Ayuntamiento de Madrid: barrios oficiales, Geoportal de **VUT con licencia**, consulta ITE/IEE por dirección (sin volcado masivo de titulares).
- INE Atlas de distribución de renta de los hogares e índice estatal de alquiler (MITMA/MIVAU) por **sección censal**. El registro de fianzas no es un API nominativo abierto.
- Aportes de ejemplo en `src/data/seed-reports.json` para que el mapa no arranque vacío.
- Catálogo de endpoints en `src/domain/sources.ts`.

## Despliegue en Vercel

La URL de producción del proyecto es `https://rentaly-mibo1.vercel.app` (cada deploy también tiene un host único del estilo `https://rentaly-….vercel.app`). `https://rentaly.vercel.app` pertenece a **otro** proyecto y no es esta app.

Si el navegador muestra la página genérica de Vercel:

```
404: NOT_FOUND
Code: NOT_FOUND
ID: cdg1::…
```

eso **no** es el 404 de Rentaly (el de la app dice «No está en el mapa»). Vercel Authentication está activo: la petición a `/` responde `302` a `https://vercel.com/sso-api?…`. Quien no pertenezca al equipo del proyecto acaba en `NOT_FOUND`.

Para dejar la web pública:

1. [Dashboard del proyecto](https://vercel.com) → **Settings** → **Deployment Protection**.
2. Desactiva **Vercel Authentication** en Production (o déjala solo en Preview).
3. Guarda. No hace falta redeploy: el host de producción debería servir la home en cuanto la protección caiga.

En Vercel el sistema de archivos es de solo lectura. Sin `SUPABASE_SECRET_KEY` (ni `DATABASE_URL`), cuentas, sesiones y aportes se escriben en `/tmp/rentaly-data` y se pierden al reciclar la instancia. En local, el mismo fallback usa `data/`.

Las rutas `/api/*` pasan por un rate limit en el Edge (`slidingWindow`, 15 peticiones / 10 s por IP) con `@upstash/ratelimit`. En Vercel añade `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (REST, misma región que el proyecto). Si faltan o Redis falla, la API sigue (fail-open) y responde `429` + `Retry-After` solo cuando el cupo está agotado.

## Límites actuales

Los aportes se guardan en Supabase (PostgREST con la clave secreta, o Prisma si hay `DATABASE_URL`) y, si no, en JSON. En un despliegue duradero sigue haciendo falta moderación y, si se desea, el índice estatal de precios de alquiler por sección censal. El Catastro no publica un inventario masivo de todas las viviendas de cada barrio por estos servicios libres: la distribución de inmuebles se obtiene finca a finca, que es justo el momento en el que alguien está a punto de alquilar.
