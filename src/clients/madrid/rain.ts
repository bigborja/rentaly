import { DATA_SOURCES } from "@/domain/sources";
import { TtlCache } from "@/cache/ttl";
import { UpstreamError, getText } from "@/clients/http";
import { parseRainCsv, type RainLegalAgent } from "./rain-parse";

const cache = new TtlCache<RainLegalAgent[]>(12 * 60 * 60 * 1000, 4);
const CSV_URL = DATA_SOURCES.madridRain.endpoint as string;

export async function listRainLegalAgents(): Promise<RainLegalAgent[]> {
  const hit = cache.get("legal");
  if (hit) return hit;

  let csv: string;
  try {
    csv = await getText(CSV_URL, "Comunidad de Madrid · RAIN", {
      next: { revalidate: 12 * 60 * 60 },
    });
  } catch (error) {
    if (error instanceof UpstreamError) return [];
    return [];
  }
  const rows = parseRainCsv(csv);
  cache.set("legal", rows);
  return rows;
}

export async function rainByTaxId(taxId: string): Promise<RainLegalAgent | null> {
  const needle = taxId.trim().toUpperCase();
  const rows = await listRainLegalAgents();
  return rows.find((row) => row.taxId === needle) || null;
}
