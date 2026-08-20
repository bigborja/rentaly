import type { CadastralRefParts } from "./types";

export const VIA_TYPES = [
  "CL",
  "AV",
  "PZ",
  "PS",
  "CR",
  "CJ",
  "TR",
  "RD",
  "GL",
  "AC",
  "CM",
  "CT",
  "PJ",
  "PB",
  "UR",
  "PO",
  "PL",
  "CU",
  "BA",
  "BO",
  "CA",
  "CS",
  "PT",
  "RU",
  "EM",
  "GV",
] as const;

export const VIA_WORDS: Record<string, string> = {
  calle: "CL",
  cl: "CL",
  c: "CL",
  avenida: "AV",
  av: "AV",
  avda: "AV",
  plaza: "PZ",
  plz: "PZ",
  pz: "PZ",
  paseo: "PS",
  pso: "PS",
  ps: "PS",
  ronda: "RD",
  rd: "RD",
  glorieta: "GL",
  gl: "GL",
  travesia: "TR",
  "travesía": "TR",
  carretera: "CR",
  crta: "CR",
  camino: "CM",
  callejon: "CJ",
  "callejón": "CJ",
  costanilla: "CT",
  pasaje: "PJ",
};

export const VIA_TYPE_LABELS: Record<string, string> = {
  CL: "Calle",
  AV: "Avenida",
  PZ: "Plaza",
  PS: "Paseo",
  CR: "Carretera",
  CJ: "Callejón",
  TR: "Travesía",
  RD: "Ronda",
  GL: "Glorieta",
  CM: "Camino",
  CT: "Costanilla",
  PJ: "Pasaje",
};

export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function compactRef(value: string): string {
  return String(value || "")
    .replace(/[\s-]/g, "")
    .toUpperCase();
}

export function isCadastralRef(value: string): boolean {
  const compact = compactRef(value);
  return /^[0-9A-Z]{14}$/.test(compact) || /^[0-9A-Z]{20}$/.test(compact);
}

export function formatRef(parts: CadastralRefParts): string {
  const parcel = `${parts.pc1}${parts.pc2}`;
  if (!parts.car) return parcel;
  return `${parcel}${parts.car}${parts.cc1 || ""}${parts.cc2 || ""}`;
}

export function parcelRefFrom(ref: string): string {
  return compactRef(ref).slice(0, 14);
}

export type ParsedQuery =
  | { kind: "ref"; ref: string }
  | { kind: "address"; sigla?: string; street: string; number: string }
  | { kind: "street"; sigla?: string; street: string };

export function parseAddressQuery(raw: string): ParsedQuery | null {
  let q = String(raw || "").trim();
  if (!q) return null;

  const compact = compactRef(q);
  if (isCadastralRef(compact)) {
    return { kind: "ref", ref: compact };
  }

  q = q
    .replace(/\b(madrid capital|madrid)\b/gi, " ")
    .replace(/\bn[úu]m(?:ero)?\.?\s*/gi, " ")
    .replace(/\bnº\s*/gi, " ")
    .replace(/[,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let sigla: string | undefined;
  const wordMatch = q.match(/^([a-záéíóúüñ]+)\s+/i);
  if (wordMatch) {
    const key = wordMatch[1].toLowerCase();
    if (VIA_WORDS[key]) {
      sigla = VIA_WORDS[key];
      q = q.slice(wordMatch[0].length);
    }
  }

  const codeMatch = q.match(/^([A-Z]{1,3})\s+/i);
  if (!sigla && codeMatch && VIA_TYPES.includes(codeMatch[1].toUpperCase() as (typeof VIA_TYPES)[number])) {
    sigla = codeMatch[1].toUpperCase();
    q = q.slice(codeMatch[0].length);
  }

  let number: string | undefined;
  const numMatch = q.match(/\s+(\d{1,4})(?:\s*[-–]\s*\d{1,4})?$/);
  if (numMatch) {
    number = numMatch[1];
    q = q.slice(0, numMatch.index).trim();
  }

  const street = q.trim();
  if (!street) return null;
  if (number) {
    return { kind: "address", sigla, street, number };
  }
  return { kind: "street", sigla, street };
}

export function parseNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

export function parseCoord(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
