import type { BuildingInspection } from "@/domain";
import { DATA_SOURCES } from "@/domain/sources";

/**
 * ITE/IEE live in the municipal building register. There is no bulk open dump with
 * owners or inspectors. We point to the official consulta instead of scraping the sede.
 */
export function inspectionConsulta(address?: string): BuildingInspection {
  void address;
  return {
    kind: "ite",
    consultUrl: DATA_SOURCES.madridIte.endpoint || "https://servpub.madrid.es/GITEP_WBFICHA/SGiteCons",
    consultedAt: new Date().toISOString(),
    publicRecord: false,
    outcome: "desconocido",
  };
}
