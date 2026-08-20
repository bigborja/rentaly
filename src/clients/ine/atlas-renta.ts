import type { CensusRentStat } from "@/domain";
import { DATA_SOURCES } from "@/domain/sources";
import { TtlCache } from "@/cache/ttl";
import { UpstreamError, getJson } from "@/clients/http";
import { prisma } from "@/lib/db";

const cache = new TtlCache<CensusRentStat | null>(24 * 60 * 60 * 1000, 400);

interface ArcGisResponse {
  error?: { message?: string };
  features?: Array<{ attributes?: Record<string, string | number | null> }>;
}

function statFromAttrs(attrs: Record<string, string | number | null>, fallbackYear = 2023): CensusRentStat | null {
  const code = String(attrs.CUSEC || attrs.cusec || "");
  if (!/^\d{10}$/.test(code)) return null;
  const year = Number(attrs.anyo || fallbackYear) || fallbackYear;
  const mean = Number(attrs.dato2);
  return {
    censusSectionCode: code,
    year,
    meanHouseholdIncomeEuros: Number.isFinite(mean) ? mean : undefined,
    source: "ine_adrh",
  };
}

export async function censusSectionAt(longitude: number, latitude: number): Promise<CensusRentStat | null> {
  const key = `pt:${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const layer = DATA_SOURCES.ineAdrh.endpoint;
  const params = new URLSearchParams({
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "CUSEC,anyo,dato2,indicador2",
    returnGeometry: "false",
    f: "json",
    resultRecordCount: "1",
  });

  try {
    const json = await getJson<ArcGisResponse>(`${layer}/query?${params.toString()}`, "INE ADRH", {
      next: { revalidate: 60 * 60 * 24 },
    });
    const attrs = json.features?.[0]?.attributes;
    const stat = attrs ? statFromAttrs(attrs) : null;
    cache.set(key, stat);
    if (stat) await persistRentStat(stat);
    return stat;
  } catch (error) {
    if (error instanceof UpstreamError) {
      cache.set(key, null);
      return null;
    }
    cache.set(key, null);
    return null;
  }
}

export async function householdIncomeBySection(cusec: string, year = 2023): Promise<CensusRentStat | null> {
  const code = cusec.trim();
  if (!/^\d{10}$/.test(code)) return null;
  const key = `${code}:${year}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const db = prisma();
  if (db) {
    try {
      const row = await db.censusRentStat.findUnique({
        where: { censusSectionCode_year_source: { censusSectionCode: code, year, source: "ine_adrh" } },
      });
      if (row) {
        const stat: CensusRentStat = {
          censusSectionCode: row.censusSectionCode,
          year: row.year,
          referenceRentEurosM2: row.referenceRentEurosM2 ?? undefined,
          meanHouseholdIncomeEuros: row.meanHouseholdIncomeEuros ?? undefined,
          medianHouseholdIncomeEuros: row.medianHouseholdIncomeEuros ?? undefined,
          source: "ine_adrh",
        };
        cache.set(key, stat);
        return stat;
      }
    } catch {
      // not migrated
    }
  }

  const layer = DATA_SOURCES.ineAdrh.endpoint;
  const params = new URLSearchParams({
    where: `CUSEC='${code}'`,
    outFields: "CUSEC,anyo,dato2,indicador2",
    returnGeometry: "false",
    f: "json",
    resultRecordCount: "1",
  });

  try {
    const json = await getJson<ArcGisResponse>(`${layer}/query?${params.toString()}`, "INE ADRH", {
      next: { revalidate: 60 * 60 * 24 },
    });
    const attrs = json.features?.[0]?.attributes;
    const stat = attrs ? statFromAttrs(attrs, year) : null;
    cache.set(key, stat);
    if (stat) await persistRentStat(stat);
    return stat;
  } catch {
    cache.set(key, null);
    return null;
  }
}

async function persistRentStat(stat: CensusRentStat) {
  const db = prisma();
  if (!db) return;
  try {
    await db.censusSection.upsert({
      where: { code: stat.censusSectionCode },
      create: {
        code: stat.censusSectionCode,
        municipalityCode: stat.censusSectionCode.slice(0, 5),
        districtCode: stat.censusSectionCode.slice(5, 7),
        year: stat.year,
      },
      update: {},
    });
    await db.censusRentStat.upsert({
      where: {
        censusSectionCode_year_source: {
          censusSectionCode: stat.censusSectionCode,
          year: stat.year,
          source: stat.source,
        },
      },
      create: {
        censusSectionCode: stat.censusSectionCode,
        year: stat.year,
        meanHouseholdIncomeEuros: stat.meanHouseholdIncomeEuros,
        referenceRentEurosM2: stat.referenceRentEurosM2,
        source: stat.source,
      },
      update: {
        meanHouseholdIncomeEuros: stat.meanHouseholdIncomeEuros,
        referenceRentEurosM2: stat.referenceRentEurosM2,
      },
    });
  } catch {
    // ignore until migrate
  }
}
