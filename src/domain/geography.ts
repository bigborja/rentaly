/** Official Madrid-capital geography. IDs follow Ayuntamiento / INE codes. */

export interface Barrio {
  id: string;
  slug: string;
  name: string;
  districtId: string;
  district: string;
  centroid: [number, number];
  bbox: [number, number, number, number];
}

/** INE sección censal (CUSEC, 10 digits: CPRO+CMUN+CDIS+CSEC). Grain for ADRH and the state rental index. */
export interface CensusSection {
  code: string;
  municipalityCode: string;
  districtCode: string;
  year: number;
}

export interface GeoPoint {
  longitude: number;
  latitude: number;
  srid: 4326;
}
