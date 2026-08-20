import type { Barrio } from "./geography";

/** Lightweight parcel card for the map sheet. Never includes natural-person holders. */
export interface ParcelPeek {
  parcelRef: string;
  address?: string;
  areaM2?: number;
  year?: number;
  use?: string;
  barrio?: Pick<Barrio, "id" | "name" | "slug" | "district">;
  touristNearby: number;
  touristUnitsNearby: number;
  reports: number;
  abuse: number;
  legalEntities: Array<{ taxId: string; legalName: string }>;
  serpavi: { inScope: boolean; reasons: string[] };
  irav?: { label: string; ratePercent: number };
}
