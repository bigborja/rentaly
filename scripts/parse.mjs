const VIA_TYPES = [
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
  "TR",
  "EM",
  "GV",
  "PAS",
];

const VIA_WORDS = {
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

export function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function compactRef(value) {
  return String(value || "")
    .replace(/[\s-]/g, "")
    .toUpperCase();
}

export function isCadastralRef(value) {
  const compact = compactRef(value);
  return /^[0-9A-Z]{14}$/.test(compact) || /^[0-9A-Z]{20}$/.test(compact);
}

export function formatRef(parts) {
  const pc1 = String(parts.pc1 || "").padEnd(7, " ").slice(0, 7).replace(/ /g, "");
  const pc2 = String(parts.pc2 || "").padEnd(7, " ").slice(0, 7).replace(/ /g, "");
  const parcel = `${pc1}${pc2}`;
  if (!parts.car) return parcel;
  return `${parcel}${parts.car}${parts.cc1 || ""}${parts.cc2 || ""}`;
}

export function parcelRefFrom(ref) {
  return compactRef(ref).slice(0, 14);
}

export function parseAddressQuery(raw) {
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

  let sigla;
  const wordMatch = q.match(/^([a-záéíóúüñ]+)\s+/i);
  if (wordMatch) {
    const key = wordMatch[1].toLowerCase();
    if (VIA_WORDS[key]) {
      sigla = VIA_WORDS[key];
      q = q.slice(wordMatch[0].length);
    }
  }

  const codeMatch = q.match(/^([A-Z]{1,3})\s+/i);
  if (!sigla && codeMatch && VIA_TYPES.includes(codeMatch[1].toUpperCase())) {
    sigla = codeMatch[1].toUpperCase();
    q = q.slice(codeMatch[0].length);
  }

  let number;
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

export function parseNumber(value) {
  if (value == null || value === "") return undefined;
  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

export function parseCoord(value) {
  if (value == null || value === "") return undefined;
  const n = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}
