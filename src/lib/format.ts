import type { AbuseCategory, ReportType } from "./types";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  experiencia: "Experiencia",
  incidente: "Incidente",
  abuso: "Aviso de abuso",
};

export const ABUSE_LABELS: Record<AbuseCategory, string> = {
  fianza: "Fianza irregular",
  honorarios: "Honorarios o gastos indebidos",
  clausulas: "Cláusulas abusivas",
  acoso: "Acoso o intimidación",
  entrada: "Entrada al piso sin consentimiento",
  suministros: "Suministros o comunidad",
  obras: "Obras, habitabilidad o salubridad",
  discriminacion: "Discriminación",
  sin_contrato: "Sin contrato o contrato simulado",
  precio: "Precio, actualización o indexación irregular",
  otro: "Otro",
};

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatM2(value?: number): string {
  if (value == null) return "—";
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value)} m²`;
}

export function formatEuros(value?: number): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function prettyUse(value?: string): string {
  if (!value) return "Sin uso informado";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function officialLinks() {
  return [
    {
      title: "Sede Electrónica del Catastro",
      href: "https://www.sedecatastro.gob.es/",
      detail: "Datos no protegidos del inmueble, cartografía y referencia catastral.",
    },
    {
      title: "Índice de precios de alquiler",
      href: "https://www.mivau.gob.es/vivienda/alquila-con-seguridad/index-alquiler",
      detail: "Referencia estatal de precios del Ministerio de Vivienda y Agenda Urbana.",
    },
    {
      title: "Oficina de Vivienda de Madrid",
      href: "https://www.madrid.es/portales/munimadrid/es/Inicio/Vivienda/",
      detail: "Información municipal, ayudas y atención a inquilinos.",
    },
    {
      title: "Ley de Arrendamientos Urbanos",
      href: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003",
      detail: "Marco legal del alquiler de vivienda en España.",
    },
  ];
}
