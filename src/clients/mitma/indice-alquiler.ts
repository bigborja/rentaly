import type { CensusRentStat } from "@/domain";
import { SERPAVI_APP, SERPAVI_INFO, serpaviAppUrl, serpaviScope } from "@/lib/official";

/**
 * SERPAVI (MIVAU) publishes rent by census section as a 60MB+ workbook and map viewers,
 * not as a per-CUSEC JSON API. We never invent a range: the official app computes it
 * from the cadastral reference plus dwelling attributes.
 */
export const SERPAVI_VISOR = SERPAVI_INFO;
export const SERPAVI_APPLICATION = SERPAVI_APP;

export async function referenceRentBySection(_cusec: string): Promise<CensusRentStat | null> {
  void _cusec;
  return null;
}

export function serpaviUrlForSection(cusec: string) {
  return `${SERPAVI_INFO}#cusec=${encodeURIComponent(cusec)}`;
}

export function serpaviUrlForParcel(cadastralRef: string) {
  return serpaviAppUrl(cadastralRef);
}

export { serpaviScope, serpaviAppUrl };
