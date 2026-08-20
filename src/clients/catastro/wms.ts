export const CATASTRO_WMS = {
  url: "https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx",
  layers: "Catastro",
  format: "image/png",
  attribution: "Dirección General del Catastro",
} as const;

export const CATASTRO_INSPIRE_CP_WMS = {
  url: "https://ovc.catastro.meh.es/INSPIRE/wms/ES.SDGC.CP.wms",
  layers: "CP.CadastralParcel",
  format: "image/png",
  attribution: "INSPIRE · Dirección General del Catastro",
} as const;

export function catastroMapUrl(parcelRef: string) {
  return `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${encodeURIComponent(parcelRef)}`;
}
