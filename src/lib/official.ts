/** Public offices and official tools. We link out; we never file on the user's behalf. */

export const SERPAVI_APP = "https://serpavi.mivau.gob.es/";
export const SERPAVI_INFO = "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi";
export const SERPAVI_FAQS = "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi/faqs";

export const IRAV_INE_TABLE = "https://www.ine.es/jaxiT3/Tabla.htm?t=72975";
export const IRAV_INE_API = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/72975?nult=3";
export const IRAV_CALCULATOR = "https://www.mivau.gob.es/vivienda/calculadora-precio-alquiler";
export const IRAV_CONTRACT_CUTOFF = "2023-05-26";

export const SAV_MADRID = {
  title: "Servicio de Asesoramiento de Vivienda (SAV Madrid)",
  href: "https://www.madrid.es/portales/munimadrid/es/Inicio/Vivienda-urbanismo-y-obras/Vivienda/Puntos-de-informacion-y-asesoramiento-para-los-ciudadanos-en-materia-de-vivienda/",
  phone: "900 814 815",
  detail: "Cita gratuita con letrados del Ayuntamiento e ICAM sobre contrato, desahucio o comunidad. No es Rentaly quien tramita.",
};

export const SINDICATO_INQUILINAS = {
  title: "Sindicato de Inquilinas de Madrid",
  href: "https://inquilinato.org/",
  defendHref: "https://inquilinato.org/defiendete/",
  detail: "Organización colectiva. Rentaly investiga la finca; el sindicato actúa con vecinas.",
};

export const CATASTRO_SEDE = "https://www.sedecatastro.gob.es/";
export const EMERGENCY_NUMBER = "112";

export function serpaviAppUrl(cadastralRef?: string) {
  if (!cadastralRef) return SERPAVI_APP;
  return `${SERPAVI_APP}?refcat=${encodeURIComponent(cadastralRef)}`;
}

export type SerpaviScope = {
  inScope: boolean;
  reasons: string[];
};

/** SERPAVI individual range: collective housing, 30–150 m², building older than five years. */
export function serpaviScope(input: { areaM2?: number; year?: number; use?: string }): SerpaviScope {
  const reasons: string[] = [];
  if (input.areaM2 != null) {
    if (input.areaM2 < 30) reasons.push("superficie construida menor de 30 m²");
    if (input.areaM2 > 150) reasons.push("superficie construida mayor de 150 m²");
  }
  if (input.year != null) {
    const age = new Date().getFullYear() - input.year;
    if (age < 5) reasons.push("edificio de menos de cinco años");
  }
  const use = (input.use || "").toLowerCase();
  if (use && !/vivienda|residencial/.test(use) && /comercial|oficina|industrial|almac[eé]n|aparcamiento|trastero|garaje/.test(use)) {
    reasons.push("uso no residencial en el Catastro");
  }
  return { inScope: reasons.length === 0, reasons };
}

export function officialActionLinks() {
  return [
    {
      title: SAV_MADRID.title,
      href: SAV_MADRID.href,
      detail: `${SAV_MADRID.detail} Teléfono ${SAV_MADRID.phone}.`,
    },
    {
      title: SINDICATO_INQUILINAS.title,
      href: SINDICATO_INQUILINAS.defendHref,
      detail: SINDICATO_INQUILINAS.detail,
    },
    {
      title: "SERPAVI · rango de alquiler",
      href: SERPAVI_APP,
      detail: "Aplicación del Ministerio: introduce la referencia catastral y las características de la vivienda.",
    },
    {
      title: "Calculadora IRAV (MIVAU)",
      href: IRAV_CALCULATOR,
      detail: "Techo de actualización anual para contratos de vivienda habitual posteriores al 26 de mayo de 2023.",
    },
  ];
}
