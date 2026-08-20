/**
 * Ownership of private natural persons is not in the Spanish Cadastre open services
 * and must never be simulated. We only persist legal persons from public sources
 * (BORM, company registries, SOCIMIs) or user evidence with PII already stripped.
 */

export const LEGAL_ENTITY_KINDS = ["socimi", "fondo", "sa", "sl", "cooperativa", "administracion", "otra_juridica"] as const;

export type LegalEntityKind = (typeof LEGAL_ENTITY_KINDS)[number];

export type OwnershipSource = "borm" | "registro_mercantil" | "nota_simple_redactada" | "user_verified";

export interface LegalEntity {
  id: string;
  /** CIF / NIF de persona jurídica. Never a DNI of a natural person. */
  taxId: string;
  legalName: string;
  kind: LegalEntityKind;
}

export interface OwnershipClaim {
  id: string;
  parcelRef: string;
  unitRef?: string;
  legalEntityId: string;
  legalEntity?: LegalEntity;
  source: OwnershipSource;
  sourceUrl?: string;
  observedAt: string;
  confidence: "low" | "medium" | "high";
  /** True when the claim is about a large holder / SOCIMI / fund, never a neighbour. */
  largeHolderCandidate: boolean;
}

/**
 * AEAT letters for personas jurídicas / entidades. Excludes DNI (digits), NIE (X/Y/Z)
 * and the old natural-person prefixes K/L/M.
 */
export const LEGAL_PERSON_TAX_ID = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;

export function tryLegalPersonTaxId(taxId: string): string | null {
  const compact = taxId.trim().toUpperCase().replace(/[\s.-]/g, "");
  return LEGAL_PERSON_TAX_ID.test(compact) ? compact : null;
}

export function assertLegalPersonTaxId(taxId: string): string {
  const compact = tryLegalPersonTaxId(taxId);
  if (!compact) {
    throw new Error("Solo se pueden registrar identificadores de persona jurídica (CIF), nunca un DNI/NIE.");
  }
  return compact;
}
