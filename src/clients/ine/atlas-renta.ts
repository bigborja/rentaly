import type { CensusRentStat } from "@/domain";
import { DATA_SOURCES } from "@/domain/sources";
import { TtlCache } from "@/cache/ttl";
import { UpstreamError, getJson } from "@/clients/http";
import { prisma } from "@/lib/db";
import { hasSupabase, sbEq, sbInsert, sbPatch, sbSelect, sbUpsert } from "@/lib/supabase-rest";

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
        const stat = rentStatFromRow(row);
        cache.set(key, stat);
        return stat;
      }
    } catch {
      // not migrated
    }
  } else if (hasSupabase()) {
    try {
      const rows = await sbSelect<{
        censusSectionCode: string;
        year: number;
        referenceRentEurosM2: number | null;
        meanHouseholdIncomeEuros: number | null;
        medianHouseholdIncomeEuros: number | null;
      }>(
        "census_rent_stats",
        `${sbEq("censusSectionCode", code)}&year=eq.${year}&source=eq.ine_adrh&select=*`,
      );
      if (rows[0]) {
        const stat = rentStatFromRow(rows[0]);
        cache.set(key, stat);
        return stat;
      }
    } catch {
      // REST cache optional
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

function rentStatFromRow(row: {
  censusSectionCode: string;
  year: number;
  referenceRentEurosM2?: number | null;
  meanHouseholdIncomeEuros?: number | null;
  medianHouseholdIncomeEuros?: number | null;
}): CensusRentStat {
  return {
    censusSectionCode: row.censusSectionCode,
    year: row.year,
    referenceRentEurosM2: row.referenceRentEurosM2 ?? undefined,
    meanHouseholdIncomeEuros: row.meanHouseholdIncomeEuros ?? undefined,
    medianHouseholdIncomeEuros: row.medianHouseholdIncomeEuros ?? undefined,
    source: "ine_adrh",
  };
}

async function persistRentStat(stat: CensusRentStat) {
  const db = prisma();
  if (db) {
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
    return;
  }
  if (!hasSupabase()) return;
  try {
    await sbUpsert(
      "census_sections",
      {
        code: stat.censusSectionCode,
        municipalityCode: stat.censusSectionCode.slice(0, 5),
        districtCode: stat.censusSectionCode.slice(5, 7),
        year: stat.year,
      },
      "code",
    );
    const existing = await sbSelect<{ id: string }>(
      "census_rent_stats",
      `${sbEq("censusSectionCode", stat.censusSectionCode)}&year=eq.${stat.year}&${sbEq("source", stat.source)}&select=id`,
    );
    const payload = {
      censusSectionCode: stat.censusSectionCode,
      year: stat.year,
      meanHouseholdIncomeEuros: stat.meanHouseholdIncomeEuros ?? null,
      referenceRentEurosM2: stat.referenceRentEurosM2 ?? null,
      source: stat.source,
    };
    if (existing[0]) {
      await sbPatch("census_rent_stats", sbEq("id", existing[0].id), payload);
    } else {
      await sbInsert("census_rent_stats", { id: crypto.randomUUID(), ...payload });
    }
  } catch {
    // REST cache optional
  }
}
