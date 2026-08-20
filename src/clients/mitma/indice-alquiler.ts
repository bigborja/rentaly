import type { CensusRentStat } from "@/domain";

/**
 * SERPAVI (MIVAU) publishes rent by census section as a 60MB+ workbook and map viewers,
 * not as a per-CUSEC JSON API. We persist rows when ingested and always link the visor.
 */
export const SERPAVI_VISOR = "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi";

export async function referenceRentBySection(_cusec: string): Promise<CensusRentStat | null> {
  void _cusec;
  return null;
}

export function serpaviUrlForSection(cusec: string) {
  return `${SERPAVI_VISOR}#cusec=${encodeURIComponent(cusec)}`;
}
