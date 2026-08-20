import { IRAV_INE_API } from "@/lib/official";
import { TtlCache } from "@/cache/ttl";
import { getJson } from "@/clients/http";
import { parseIravTable, type IneTableRow, type IravPoint } from "@/lib/irav";

export type { IravPoint } from "@/lib/irav";
export { applyIrav, parseIravTable } from "@/lib/irav";

const cache = new TtlCache<IravPoint | null>(12 * 60 * 60 * 1000, 4);

export async function latestIrav(): Promise<IravPoint | null> {
  const hit = cache.get("latest");
  if (hit !== undefined) return hit;
  try {
    const json = await getJson<IneTableRow[]>(IRAV_INE_API, "INE IRAV", { next: { revalidate: 60 * 60 * 12 } });
    const point = parseIravTable(Array.isArray(json) ? json : []);
    cache.set("latest", point);
    return point;
  } catch {
    cache.set("latest", null);
    return null;
  }
}
