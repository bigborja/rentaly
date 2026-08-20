import asociacionesJson from "../data/asociaciones.json" with { type: "json" };

export type Asociacion = {
  id: string;
  nombre: string;
  distritos_cubiertos: string[];
  codigo_postal?: string[];
  canal_telegram: string;
  horario_reunion: string;
  generico?: boolean;
};

export const ASOCIACIONES = asociacionesJson as Asociacion[];

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
