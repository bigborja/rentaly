/** Provenance for every official dataset we ingest. */

export type Publisher = "catastro" | "ayuntamiento_madrid" | "comunidad_madrid" | "ine" | "mitma" | "borm" | "community";

export interface DataSource {
  id: string;
  publisher: Publisher;
  title: string;
  homepage: string;
  endpoint?: string;
  license: string;
  grain: string;
  notes: string;
}

export const DATA_SOURCES = {
  catastroCallejero: {
    id: "catastro-ovc-callejero",
    publisher: "catastro",
    title: "OVC Callejero JSON (Consulta_DNPLOC, Consulta_DNPRC, ObtenerCallejero)",
    homepage: "https://www.catastro.minhap.es/",
    endpoint: "https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json",
    license: "Datos catastrales no protegidos",
    grain: "referencia catastral / portal",
    notes: "No incluye titularidad de personas físicas.",
  },
  catastroCoordenadas: {
    id: "catastro-ovc-coordenadas",
    publisher: "catastro",
    title: "OVC Coordenadas JSON (Consulta_RCCOOR, Consulta_CPMRC)",
    homepage: "https://www.catastro.minhap.es/",
    endpoint: "https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCoordenadas.svc/json",
    license: "Datos catastrales no protegidos",
    grain: "parcela",
    notes: "Geocodifica RC ↔ WGS84.",
  },
  catastroWms: {
    id: "catastro-wms",
    publisher: "catastro",
    title: "Cartografía catastral WMS",
    homepage: "https://www.catastro.minhap.es/",
    endpoint: "https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx",
    license: "Dirección General del Catastro",
    grain: "tesela",
    notes: "Capa Catastro para Leaflet/MapLibre.",
  },
  madridVut: {
    id: "madrid-vut",
    publisher: "ayuntamiento_madrid",
    title: "Viviendas de uso turístico con licencia urbanística",
    homepage: "https://datos.madrid.es/dataset/300694-0-viviendas-turisticas-geoportal",
    endpoint: "https://sigma.madrid.es/hosted/rest/services/VIVIENDA/VIVIENDAS_TURISTICAS/MapServer/0",
    license: "CC BY 4.0",
    grain: "punto / dirección / expediente",
    notes: "No cruza titularidad. Emparejamos por proximidad a la parcela.",
  },
  madridIte: {
    id: "madrid-ite-iee",
    publisher: "ayuntamiento_madrid",
    title: "Registro de Edificios y Construcciones (consulta ITE/IEE)",
    homepage: "https://sede.madrid.es/",
    endpoint: "https://servpub.madrid.es/GITEP_WBFICHA/SGiteCons",
    license: "Consulta individual en sede",
    grain: "expediente o dirección",
    notes: "No hay volcado masivo con titulares. No scrapear la sede.",
  },
  ineAdrh: {
    id: "ine-adrh",
    publisher: "ine",
    title: "Atlas de distribución de renta de los hogares",
    homepage: "https://www.ine.es/dynt3/inebase/index.htm?padre=7132",
    endpoint: "https://www.ine.es/servergis/rest/services/ws/ADRH_2023_Renta_media_por_hogar/MapServer/3",
    license: "INE",
    grain: "sección censal (CUSEC)",
    notes: "Nunca a nivel de hogar identificable.",
  },
  mitmaAlquiler: {
    id: "mitma-indice-alquiler",
    publisher: "mitma",
    title: "Sistema estatal de referencia del precio del alquiler de vivienda",
    homepage: "https://www.mivau.gob.es/",
    license: "Administración General del Estado",
    grain: "sección censal / distrito",
    notes: "Sustituye un registro de fianzas nominativo, que no es dato abierto.",
  },
} as const satisfies Record<string, DataSource>;
