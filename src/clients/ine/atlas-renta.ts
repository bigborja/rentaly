import type { CensusRentStat } from "@/domain";
import { DATA_SOURCES } from "@/domain/sources";
import { TtlCache } from "@/cache/ttl";
import { UpstreamError, getJson } from "@/clients/http";

const cache = new TtlCache<CensusRentStat | null>(24 * 60 * 60 * 1000, 300);

interface ArcGisResponse {
  error?: { message?: string };
  features?: Array<{ attributes?: Record<string, string | number | null> }>;
}

/**
 * INE Atlas household income by census section (CUSEC). Aggregates only.
 */
export async function householdIncomeBySection(cusec: string, year = 2023): Promise<CensusRentStat | null> {
  const code = cusec.trim();
  if (!/^\d{10}$/.test(code)) return null;
  const key = `${code}:${year}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const layer = DATA_SOURCES.ineAdrh.endpoint;
  const params = new URLSearchParams({
    where: `CUSEC='${code}'`,
    outFields: "*",
    returnGeometry: "false",
    f: "json",
    resultRecordCount: "1",
  });

  try {
    const json = await getJson<ArcGisResponse>(`${layer}/query?${params.toString()}`, "INE ADRH", {
      next: { revalidate: 60 * 60 * 24 },
    });
    const attrs = json.features?.[0]?.attributes;
    if (!attrs) {
      cache.set(key, null);
      return null;
    }
    const mean = Number(
      attrs.Renta_media_por_hogar ?? attrs.renta_media_hogar ?? attrs.INDICADOR ?? NaN,
    );
    const stat: CensusRentStat = {
      censusSectionCode: code,
      year,
      meanHouseholdIncomeEuros: Number.isFinite(mean) ? mean : undefined,
      source: "ine_adrh",
    };
    cache.set(key, stat);
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
