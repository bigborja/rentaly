import type { Barrio } from "./types";
import barriosJson from "@/data/barrios.json";

export const BARRIOS = barriosJson as Barrio[];

export function getBarrio(idOrSlug: string): Barrio | undefined {
  const needle = idOrSlug.toLowerCase();
  return BARRIOS.find((barrio) => barrio.id === idOrSlug || barrio.slug === needle);
}

export function districts() {
  const map = new Map<string, { id: string; name: string; barrios: Barrio[] }>();
  for (const barrio of BARRIOS) {
    const current = map.get(barrio.districtId) || {
      id: barrio.districtId,
      name: barrio.district,
      barrios: [],
    };
    current.barrios.push(barrio);
    map.set(barrio.districtId, current);
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}
