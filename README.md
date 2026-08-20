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

## Fuentes

- Dirección General del Catastro, servicios web JSON (`Consulta_DNPLOC`, `Consulta_DNPRC`, `ObtenerCallejero`, `Consulta_RCCOOR`, `Consulta_CPMRC`) y WMS de parcelas.
- Ayuntamiento de Madrid, capa de barrios del servicio de límites administrativos (WGS84).
- Aportes de ejemplo en `src/data/seed-reports.json` para que el mapa no arranque vacío.

## Límites actuales

Los aportes se guardan en `data/reports.json` (archivo local). En un despliegue real haría falta base de datos, cuentas, moderación y, si se desea, el índice estatal de precios de alquiler por sección censal. El Catastro no publica un inventario masivo de todas las viviendas de cada barrio por estos servicios libres: la distribución de inmuebles se obtiene finca a finca, que es justo el momento en el que alguien está a punto de alquilar.
