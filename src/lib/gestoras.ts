import { assertLegalPersonTaxId } from "@/domain/ownership";
import { listRainLegalAgents, rainByTaxId } from "@/clients/madrid/rain";
import type { RainLegalAgent } from "@/clients/madrid/rain-parse";
import { listLegalEntities, portfolioForTaxId } from "@/lib/ownership-store";
import { listReports } from "@/lib/reports";
import { matchesGestoraQuery } from "@/lib/gestoras-match";
import type { OwnershipClaim, Report } from "@/domain";

export type GestoraHit = {
  taxId: string;
  legalName: string;
  reportCount: number;
  abuseCount: number;
  parcelCount: number;
  inRain: boolean;
  rainNumber?: string;
  sources: Array<"memoria" | "cartera" | "rain">;
};

export type GestoraProfile = {
  taxId: string;
  legalName: string;
  reports: Report[];
  abuseCount: number;
  parcels: string[];
  claims: OwnershipClaim[];
  rain: RainLegalAgent | null;
};

type Seed = {
  taxId: string;
  legalName: string;
  reportCount: number;
  abuseCount: number;
  parcelCount: number;
  rain?: RainLegalAgent;
};

function sourcesOf(seed: Seed): GestoraHit["sources"] {
  const sources: GestoraHit["sources"] = [];
  if (seed.reportCount) sources.push("memoria");
  if (seed.parcelCount) sources.push("cartera");
  if (seed.rain) sources.push("rain");
  return sources;
}

function toHit(seed: Seed): GestoraHit {
  return {
    taxId: seed.taxId,
    legalName: seed.legalName,
    reportCount: seed.reportCount,
    abuseCount: seed.abuseCount,
    parcelCount: seed.parcelCount,
    inRain: Boolean(seed.rain),
    rainNumber: seed.rain?.rainNumber,
    sources: sourcesOf(seed),
  };
}

function rank(hit: GestoraHit): number {
  return hit.reportCount * 10 + hit.abuseCount * 5 + hit.parcelCount * 2 + (hit.inRain ? 1 : 0);
}

async function collectSeeds(): Promise<Map<string, Seed>> {
  const seeds = new Map<string, Seed>();

  function upsert(taxId: string, patch: Partial<Omit<Seed, "taxId">> & { legalName?: string }) {
    const current = seeds.get(taxId) || {
      taxId,
      legalName: patch.legalName || taxId,
      reportCount: 0,
      abuseCount: 0,
      parcelCount: 0,
    };
    if (patch.legalName && patch.legalName !== taxId) current.legalName = patch.legalName;
    if (patch.reportCount != null) current.reportCount = patch.reportCount;
    if (patch.abuseCount != null) current.abuseCount = patch.abuseCount;
    if (patch.parcelCount != null) current.parcelCount = patch.parcelCount;
    if (patch.rain) current.rain = patch.rain;
    seeds.set(taxId, current);
  }

  const [reports, entities, rain] = await Promise.all([
    listReports(),
    listLegalEntities().catch(() => []),
    listRainLegalAgents(),
  ]);

  const byManager = new Map<string, { name: string; total: number; abuso: number }>();
  for (const report of reports) {
    if (!report.managerTaxId) continue;
    const current = byManager.get(report.managerTaxId) || {
      name: report.managerLegalName || report.managerTaxId,
      total: 0,
      abuso: 0,
    };
    current.total += 1;
    if (report.managerLegalName) current.name = report.managerLegalName;
    if (report.type === "abuso") current.abuso += 1;
    byManager.set(report.managerTaxId, current);
  }
  for (const [taxId, stats] of byManager) {
    upsert(taxId, {
      legalName: stats.name,
      reportCount: stats.total,
      abuseCount: stats.abuso,
    });
  }

  for (const entity of entities) {
    upsert(entity.taxId, { legalName: entity.legalName, parcelCount: entity.parcelCount });
  }

  for (const row of rain) {
    upsert(row.taxId, { legalName: row.legalName, rain: row });
  }

  return seeds;
}

export async function searchGestoras(query = ""): Promise<{
  hits: GestoraHit[];
  query: string;
  rainLegalCount: number;
  rainAvailable: boolean;
}> {
  const seeds = await collectSeeds();
  const q = query.trim();
  const rainLegalCount = [...seeds.values()].filter((seed) => seed.rain).length;
  const filtered = [...seeds.values()].filter((seed) => {
    if (!matchesGestoraQuery(q, seed)) return false;
    if (!q) return seed.reportCount > 0 || seed.parcelCount > 0;
    return true;
  });
  const hits = filtered
    .map(toHit)
    .sort((a, b) => rank(b) - rank(a) || a.legalName.localeCompare(b.legalName, "es"))
    .slice(0, 40);
  return {
    hits,
    query: q,
    rainLegalCount,
    rainAvailable: rainLegalCount > 0,
  };
}

export async function getGestoraProfile(rawTaxId: string): Promise<GestoraProfile> {
  const taxId = assertLegalPersonTaxId(rawTaxId);
  const [reports, portfolio, rain] = await Promise.all([
    listReports({ managerTaxId: taxId }),
    portfolioForTaxId(taxId).catch(() => null),
    rainByTaxId(taxId),
  ]);
  const legalName =
    reports.find((report) => report.managerLegalName)?.managerLegalName ||
    portfolio?.entity.legalName ||
    rain?.legalName ||
    taxId;
  const claims = portfolio?.claims || [];
  return {
    taxId,
    legalName,
    reports,
    abuseCount: reports.filter((report) => report.type === "abuso").length,
    parcels: [...new Set(claims.map((claim) => claim.parcelRef))],
    claims,
    rain,
  };
}
