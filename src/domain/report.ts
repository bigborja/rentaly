import type { Parcel, PropertyRecord } from "./finca";
import type { OwnershipClaim } from "./ownership";
import type { BuildingInspection, CensusRentStat, TouristLicense, WorksLicense } from "./overlays";
import type { Barrio } from "./geography";

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

export type ConservationState = "bueno" | "regular" | "deficiente" | "ruinoso";

export type EvidenceKind = "nota_simple_redactada" | "borm" | "contrato_fragmento" | "foto" | "otro";

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
  conservationState?: ConservationState;
  /** Public byline: nickname only. Never a legal name. */
  author: string;
  /** Internal account id. Strip before sending to anonymous clients. */
  userId?: string;
  recommend?: boolean;
  managerTaxId?: string;
  managerLegalName?: string;
  createdAt: string;
  status: "published" | "pending" | "removed";
  verification?: "anonimo" | "cuenta" | "evidencia";
  trustBand?: "bajo" | "medio" | "alto";
}

export type PublicReport = Omit<Report, "userId">;

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
  conservationState?: ConservationState;
  author?: string;
  userId?: string;
  recommend?: boolean;
  managerTaxId?: string;
  managerLegalName?: string;
  evidenceJpegBase64?: string;
}

export interface ReportEvidence {
  id: string;
  reportId: string;
  kind: EvidenceKind;
  /** Object-storage key. Original files with PII must be redacted before upload. */
  storageKey: string;
  contentType: string;
  redacted: true;
  createdAt: string;
}

/** Consolidated building dossier shown on /inmueble/[ref]. */
export interface FincaDossier {
  parcel: Parcel;
  catastro: PropertyRecord;
  barrio?: Barrio;
  touristLicenses: TouristLicense[];
  inspections: BuildingInspection[];
  worksLicenses: WorksLicense[];
  rentContext?: CensusRentStat;
  ownershipClaims: OwnershipClaim[];
  reports: PublicReport[];
}

export function toPublicReport(report: Report): PublicReport {
  const { userId: _userId, ...rest } = report;
  void _userId;
  return rest;
}
