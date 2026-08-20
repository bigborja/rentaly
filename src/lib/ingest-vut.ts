import { DATA_SOURCES } from "@/domain/sources";
import { getJson } from "@/clients/http";
import { hasSupabase, sbUpsert } from "@/lib/supabase-rest";
import { prisma } from "@/lib/db";

interface ArcGisResponse {
  error?: { message?: string };
  features?: Array<{
    attributes?: {
      DIRECCION?: string;
      PLANTA?: string;
      UNIDADES_VUT?: number;
      EXPEDIENTE_LU?: string;
      DECRETO_LU?: string;
      RESOLUCION_LU?: number;
    };
    geometry?: { x?: number; y?: number };
  }>;
}

/** Mirror a slice of the official VUT layer. Does not geocode (that would hammer the Cadastre). */
export async function ingestTouristLicenses(limit = 120): Promise<{ upserted: number }> {
  const layer = DATA_SOURCES.madridVut.endpoint;
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "DIRECCION,PLANTA,UNIDADES_VUT,EXPEDIENTE_LU,DECRETO_LU,RESOLUCION_LU",
    returnGeometry: "true",
    outSR: "4326",
    resultRecordCount: String(limit),
    f: "json",
  });
  const json = await getJson<ArcGisResponse>(`${layer}/query?${params.toString()}`, "Ayuntamiento de Madrid · VUT", {
    next: { revalidate: 0 },
  });
  if (json.error) throw new Error(json.error.message || "VUT no disponible");
  const rows = (json.features || []).map((feature) => {
    const a = feature.attributes || {};
    const id = a.EXPEDIENTE_LU || `${a.DIRECCION || "vut"}-${a.PLANTA || ""}`;
    return {
      id: id.slice(0, 80),
      expedienteLu: a.EXPEDIENTE_LU || null,
      decretoLu: a.DECRETO_LU || null,
      resolvedAt: a.RESOLUCION_LU ? new Date(a.RESOLUCION_LU).toISOString() : null,
      address: a.DIRECCION || null,
      floor: a.PLANTA || null,
      units: Number(a.UNIDADES_VUT) || 1,
      longitude: feature.geometry?.x ?? null,
      latitude: feature.geometry?.y ?? null,
      source: "ayuntamiento_madrid_vut",
    };
  });

  const db = prisma();
  if (db) {
    for (const row of rows) {
      await db.touristLicense.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          expedienteLu: row.expedienteLu || undefined,
          decretoLu: row.decretoLu || undefined,
          resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
          address: row.address || undefined,
          floor: row.floor || undefined,
          units: row.units,
          longitude: row.longitude ?? undefined,
          latitude: row.latitude ?? undefined,
        },
        update: {
          address: row.address || undefined,
          floor: row.floor || undefined,
          units: row.units,
          longitude: row.longitude ?? undefined,
          latitude: row.latitude ?? undefined,
        },
      });
    }
    return { upserted: rows.length };
  }
  if (hasSupabase() && rows.length) {
    for (let i = 0; i < rows.length; i += 40) {
      await sbUpsert("tourist_licenses", rows.slice(i, i + 40), "id");
    }
  }
  return { upserted: rows.length };
}
