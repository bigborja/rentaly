/** Official overlays keyed by parcel, address, or census section — never by a private individual. */

export interface TouristLicense {
  expedienteLu?: string;
  decretoLu?: string;
  resolvedAt?: string;
  address?: string;
  floor?: string;
  units: number;
  longitude?: number;
  latitude?: number;
  parcelRef?: string;
  onParcel?: boolean;
  source: "ayuntamiento_madrid_vut";
}

export type InspectionOutcome = "favorable" | "desfavorable" | "pendiente" | "desconocido";

/**
 * ITE/IEE are consulted per address at the municipal register.
 * Bulk open data does not include owner or inspector identity; we never store those.
 */
export interface BuildingInspection {
  parcelRef?: string;
  address?: string;
  kind: "ite" | "iee";
  outcome?: InspectionOutcome;
  consultedAt: string;
  consultUrl: string;
  publicRecord: boolean;
}

export interface WorksLicense {
  expediente?: string;
  address?: string;
  parcelRef?: string;
  description?: string;
  year?: number;
  source: "ayuntamiento_madrid";
}

export interface CensusRentStat {
  censusSectionCode: string;
  year: number;
  /** MITMA / Sistema estatal de referencia del precio del alquiler — aggregated. */
  referenceRentEurosM2?: number;
  /** INE Atlas de distribución de renta de los hogares. */
  meanHouseholdIncomeEuros?: number;
  medianHouseholdIncomeEuros?: number;
  source: "mitma_indice_alquiler" | "ine_adrh" | "cmadrid_agregado";
}
