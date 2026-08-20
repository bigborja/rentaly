import type { CensusRentStat } from "@/domain";

/**
 * Individual rental deposits (IVIMA / Agencia de Vivienda Social) are not published
 * as address-level open data. Use the state rental reference index (MITMA/MIVAU)
 * and INE ADRH, both by census section. User-reported rents stay anonymized on Report.
 */
export async function referenceRentBySection(_cusec: string): Promise<CensusRentStat | null> {
  void _cusec;
  return null;
}
