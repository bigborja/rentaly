import asociacionesJson from "../data/asociaciones.json" with { type: "json" };

export type AsociacionTipo = "asamblea" | "sindicato" | "pah" | "plataforma" | "coordinadora" | "federacion";

export type Asociacion = {
  id: string;
  nombre: string;
  tipo?: AsociacionTipo;
  distritos_cubiertos: string[];
  codigo_postal?: string[];
  canal_telegram: string;
  horario_reunion: string;
  generico?: boolean;
  solo_directorio?: boolean;
};

export const ASOCIACIONES = asociacionesJson as Asociacion[];

const TIPO_LABEL: Record<AsociacionTipo, string> = {
  asamblea: "Asamblea de barrio",
  sindicato: "Sindicato de inquilinas",
  pah: "PAH",
  plataforma: "Plataforma",
  coordinadora: "Coordinadora",
  federacion: "Asociaciones vecinales",
};

export function tipoAsociacion(org: Asociacion): AsociacionTipo {
  return org.tipo ?? (org.generico ? "sindicato" : "asamblea");
}

export function labelTipoAsociacion(org: Asociacion) {
  return TIPO_LABEL[tipoAsociacion(org)];
}

/** Collapse accents, dashes and extra spaces so "Fuencarral-El Pardo" matches the municipal name. */
export function normalizeDistrito(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

export function matchAsociacionByDistrito(asociaciones: Asociacion[], distrito: string): Asociacion {
  const needle = normalizeDistrito(distrito);
  const specific = asociaciones.find(
    (org) =>
      !org.generico &&
      !org.solo_directorio &&
      org.distritos_cubiertos.some((covered) => normalizeDistrito(covered) === needle),
  );
  if (specific) return specific;

  const fallback = asociaciones.find((org) => org.generico);
  if (!fallback) {
    throw new Error("asociaciones.json debe incluir una organización genérica (generico: true).");
  }
  return fallback;
}

/** Local assembly covering that municipal district, or the city-wide tenant union. */
export function findAsociacionByDistrito(distrito: string): Asociacion {
  return matchAsociacionByDistrito(ASOCIACIONES, distrito);
}

const DIRECTORIO_SECTIONS: { id: string; title: string; tipos: AsociacionTipo[] }[] = [
  { id: "asambleas", title: "Asambleas de barrio", tipos: ["asamblea"] },
  { id: "sindicato", title: "Sindicato de Inquilinas", tipos: ["sindicato"] },
  { id: "pah", title: "PAH y vivienda pública", tipos: ["pah", "plataforma"] },
  { id: "red", title: "Coordinadoras y AAVV", tipos: ["coordinadora", "federacion"] },
];

export function directorioAsociaciones() {
  return DIRECTORIO_SECTIONS.map((section) => ({
    ...section,
    items: ASOCIACIONES.filter((org) => section.tipos.includes(tipoAsociacion(org))),
  })).filter((section) => section.items.length > 0);
}
