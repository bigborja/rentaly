import type { TouristLicense } from "@/domain";
import { DATA_SOURCES } from "@/domain/sources";
import { TtlCache } from "@/cache/ttl";
import { UpstreamError, getJson } from "@/clients/http";
import { searchMadrid } from "@/clients/catastro/ovc";
import { compactRef } from "@/lib/parse";

const LAYER = DATA_SOURCES.madridVut.endpoint;
const cache = new TtlCache<TouristLicense[]>(10 * 60 * 1000, 200);

interface ArcGisFeature {
  attributes?: {
    DIRECCION?: string;
    PLANTA?: string;
    UNIDADES_VUT?: number;
    EXPEDIENTE_LU?: string;
    DECRETO_LU?: string;
    RESOLUCION_LU?: number;
  };
  geometry?: { x?: number; y?: number };
}

interface ArcGisResponse {
  error?: { message?: string };
  features?: ArcGisFeature[];
}

function toLicense(feature: ArcGisFeature): TouristLicense {
  const a = feature.attributes || {};
  return {
    expedienteLu: a.EXPEDIENTE_LU,
    decretoLu: a.DECRETO_LU,
    resolvedAt: a.RESOLUCION_LU ? new Date(a.RESOLUCION_LU).toISOString() : undefined,
    address: a.DIRECCION,
    floor: a.PLANTA,
    units: Number(a.UNIDADES_VUT) || 1,
    longitude: feature.geometry?.x,
    latitude: feature.geometry?.y,
    source: "ayuntamiento_madrid_vut",
  };
}

export async function touristLicensesNear(
  longitude: number,
  latitude: number,
  meters = 60,
): Promise<TouristLicense[]> {
  const key = `${longitude.toFixed(5)},${latitude.toFixed(5)},${meters}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const dLng = meters / 85000;
  const dLat = meters / 111000;
  const params = new URLSearchParams({
    geometry: `${longitude - dLng},${latitude - dLat},${longitude + dLng},${latitude + dLat}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "DIRECCION,PLANTA,UNIDADES_VUT,EXPEDIENTE_LU,DECRETO_LU,RESOLUCION_LU",
    returnGeometry: "true",
    outSR: "4326",
    resultRecordCount: "50",
    f: "json",
  });

  let json: ArcGisResponse;
  try {
    json = await getJson<ArcGisResponse>(`${LAYER}/query?${params.toString()}`, "Ayuntamiento de Madrid · VUT", {
      next: { revalidate: 60 * 60 },
    });
  } catch (error) {
    if (error instanceof UpstreamError) return [];
    return [];
  }
  if (json.error) return [];
  const licenses = (json.features || []).map(toLicense);
  cache.set(key, licenses);
  return licenses;
}

/** Geocode each nearby VUT address with Catastro and keep those on this parcela. */
export async function touristLicensesOnParcel(parcelRef: string, longitude: number, latitude: number): Promise<{
  onParcel: TouristLicense[];
  nearby: TouristLicense[];
}> {
  const nearby = await touristLicensesNear(longitude, latitude, 80);
  const needle = compactRef(parcelRef).slice(0, 14);
  const onParcel: TouristLicense[] = [];
  const rest: TouristLicense[] = [];

  for (const license of nearby.slice(0, 8)) {
    if (!license.address) {
      rest.push(license);
      continue;
    }
    try {
      const result = await searchMadrid(license.address);
      const ref = result.property?.parcelRef;
      if (ref && compactRef(ref).slice(0, 14) === needle) {
        onParcel.push({ ...license, parcelRef: needle, onParcel: true });
      } else {
        rest.push({ ...license, parcelRef: ref, onParcel: false });
      }
    } catch {
      rest.push(license);
    }
  }

  return { onParcel, nearby: rest };
}
