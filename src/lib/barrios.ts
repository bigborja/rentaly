import type { Barrio } from "./types";
import { getBarrio } from "./barrios-data";
import barriosGeo from "../../public/geo/barrios.geojson";

export { BARRIOS, getBarrio, districts } from "./barrios-data";

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, geometry: GeoJSON.Geometry): boolean {
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];
  for (const polygon of polygons) {
    if (!pointInRing(lng, lat, polygon[0] as number[][])) continue;
    let inHole = false;
    for (const hole of polygon.slice(1)) {
      if (pointInRing(lng, lat, hole as number[][])) inHole = true;
    }
    if (!inHole) return true;
  }
  return false;
}

export async function loadBarriosGeo(): Promise<GeoJSON.FeatureCollection> {
  return barriosGeo;
}

export async function barrioAt(lng: number, lat: number): Promise<Barrio | undefined> {
  const geo = await loadBarriosGeo();
  for (const feature of geo.features) {
    if (!feature.geometry) continue;
    if (pointInPolygon(lng, lat, feature.geometry)) {
      const id = String(feature.id || (feature.properties as { id?: string } | null)?.id || "");
      return getBarrio(id);
    }
  }
  return undefined;
}
