export type ReportType = "experiencia" | "incidente" | "abuso";
export type Intent = "buscar" | "alquilar" | "avisar";

export type AbuseCategory =
  | "fianza"
  | "honorarios"
  | "clausulas"
  | "acoso"
  | "entrada"
  | "suministros"
  | "obras"
  | "discriminacion"
  | "sin_contrato"
  | "precio"
  | "otro";

export type Severity = "baja" | "media" | "alta";

export interface Barrio {
  id: string;
  slug: string;
  name: string;
  districtId: string;
  district: string;
  centroid: [number, number];
  bbox: [number, number, number, number];
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  body: string;
  barrioId?: string;
  cadastralRef?: string;
  addressLabel?: string;
  yearFrom?: number;
  yearTo?: number;
  rentEuros?: number;
  rating?: number;
  abuseCategory?: AbuseCategory;
  severity?: Severity;
  author: string;
  userId?: string;
  recommend?: boolean;
  createdAt: string;
  status: "published";
}

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

export interface CreateReportInput {
  type: ReportType;
  title: string;
  body: string;
  barrioId?: string;
  cadastralRef?: string;
  addressLabel?: string;
  yearFrom?: number;
  yearTo?: number;
  rentEuros?: number;
  rating?: number;
  abuseCategory?: AbuseCategory;
  severity?: Severity;
  author?: string;
  userId?: string;
  recommend?: boolean;
}
