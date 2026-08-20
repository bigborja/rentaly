/**
 * Catastro-facing DTOs and the persisted finca model.
 * Spanish Cadastre does not publish private owner names; this layer never invents them.
 */

export interface CadastralRefParts {
  pc1: string;
  pc2: string;
  car?: string;
  cc1?: string;
  cc2?: string;
}

export interface PropertyUnit {
  ref: string;
  parcelRef: string;
  class?: string;
  use?: string;
  areaM2?: number;
  year?: number;
  participation?: number;
  block?: string;
  stair?: string;
  floor?: string;
  door?: string;
  address?: string;
  postalCode?: string;
}

export interface ConstructionPart {
  use?: string;
  typology?: string;
  floor?: string;
  door?: string;
  stair?: string;
  areaM2?: number;
}

/** Normalized OVC payload for one consulta (parcela or inmueble). */
export interface PropertyRecord {
  ref: string;
  parcelRef: string;
  class?: string;
  use?: string;
  areaM2?: number;
  year?: number;
  participation?: number;
  address?: string;
  postalCode?: string;
  districtCode?: string;
  parcelKind?: string;
  parcelAreaM2?: number;
  mapUrl?: string;
  longitude?: number;
  latitude?: number;
  units: PropertyUnit[];
  constructions: ConstructionPart[];
  rawControl?: Record<string, number | string>;
}

export interface StreetCandidate {
  type: string;
  name: string;
  code?: string;
}

export interface SearchResult {
  query: string;
  mode: "ref" | "address" | "street";
  streets?: StreetCandidate[];
  property?: PropertyRecord;
  units?: PropertyUnit[];
  warning?: string;
}

/** Persisted finca (parcela catastral, 14 characters). */
export interface Parcel {
  parcelRef: string;
  address?: string;
  postalCode?: string;
  barrioId?: string;
  censusSectionCode?: string;
  longitude?: number;
  latitude?: number;
  parcelAreaM2?: number;
  parcelKind?: string;
  yearBuilt?: number;
  fetchedAt: string;
}

/** Persisted inmueble (referencia de 20 caracteres cuando el Catastro la desglosa). */
export interface CadastralUnit {
  ref: string;
  parcelRef: string;
  use?: string;
  areaM2?: number;
  year?: number;
  participation?: number;
  stair?: string;
  floor?: string;
  door?: string;
}

export function parcelFromCatastro(
  record: PropertyRecord,
  extra?: { barrioId?: string; censusSectionCode?: string },
): Parcel {
  return {
    parcelRef: record.parcelRef,
    address: record.address,
    postalCode: record.postalCode,
    barrioId: extra?.barrioId,
    censusSectionCode: extra?.censusSectionCode,
    longitude: record.longitude,
    latitude: record.latitude,
    parcelAreaM2: record.parcelAreaM2,
    parcelKind: record.parcelKind,
    yearBuilt: record.year,
    fetchedAt: new Date().toISOString(),
  };
}

export function unitsFromCatastro(record: PropertyRecord): CadastralUnit[] {
  return record.units.map((unit) => ({
    ref: unit.ref,
    parcelRef: unit.parcelRef,
    use: unit.use,
    areaM2: unit.areaM2,
    year: unit.year,
    participation: unit.participation,
    stair: unit.stair,
    floor: unit.floor,
    door: unit.door,
  }));
}
