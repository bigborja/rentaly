import { randomUUID } from "crypto";
import type { LegalEntity, LegalEntityKind, OwnershipClaim, OwnershipSource } from "@/domain";
import { assertLegalPersonTaxId } from "@/domain/ownership";
import { prisma } from "./db";
import { ensureDatabase } from "./ensure-db";
import { compactRef, isCadastralRef } from "./parse";
import { sanitizeReportText } from "@/domain/privacy";

const LARGE_HOLDER = new Set<LegalEntityKind>(["socimi", "fondo"]);

export async function listOwnershipClaims(parcelRef: string): Promise<OwnershipClaim[]> {
  const db = prisma();
  if (!db) return [];
  await ensureDatabase();
  const needle = compactRef(parcelRef).slice(0, 14);
  const rows = await db.ownershipClaim.findMany({
    where: { parcelRef: needle },
    include: { legalEntity: true },
    orderBy: { observedAt: "desc" },
  });
  return rows.map(mapClaim);
}

export async function portfolioForTaxId(taxId: string): Promise<{ entity: LegalEntity; claims: OwnershipClaim[] } | null> {
  const db = prisma();
  if (!db) return null;
  await ensureDatabase();
  const compact = assertLegalPersonTaxId(taxId);
  const entity = await db.legalEntity.findUnique({
    where: { taxId: compact },
    include: { ownershipClaims: { include: { legalEntity: true }, orderBy: { observedAt: "desc" } } },
  });
  if (!entity) return null;
  return {
    entity: {
      id: entity.id,
      taxId: entity.taxId,
      legalName: entity.legalName,
      kind: entity.kind,
    },
    claims: entity.ownershipClaims.map(mapClaim),
  };
}

export async function createOwnershipClaim(input: {
  parcelRef: string;
  taxId: string;
  legalName: string;
  kind?: LegalEntityKind;
  source?: OwnershipSource;
  sourceUrl?: string;
}): Promise<OwnershipClaim> {
  const db = prisma();
  if (!db) {
    throw new Error("Hace falta la base de datos de Supabase (DATABASE_URL) para guardar personas jurídicas.");
  }
  await ensureDatabase();
  const parcelRef = compactRef(input.parcelRef).slice(0, 14);
  if (!isCadastralRef(parcelRef)) throw new Error("La referencia catastral no es válida.");
  const taxId = assertLegalPersonTaxId(input.taxId);
  const legalName = sanitizeReportText(input.legalName).slice(0, 160);
  if (legalName.length < 3) throw new Error("Indica la razón social, no un nombre de persona.");
  const kind = input.kind || "otra_juridica";
  const source = input.source || "user_verified";
  const sourceUrl = input.sourceUrl?.trim() || undefined;
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
    throw new Error("El enlace a BORM o al registro tiene que ser una URL http(s).");
  }

  await db.parcel.upsert({
    where: { parcelRef },
    create: { parcelRef, fetchedAt: new Date() },
    update: {},
  });

  const entity = await db.legalEntity.upsert({
    where: { taxId },
    create: { id: randomUUID(), taxId, legalName, kind },
    update: { legalName, kind },
  });

  const row = await db.ownershipClaim.create({
    data: {
      id: randomUUID(),
      parcelRef,
      legalEntityId: entity.id,
      source,
      sourceUrl,
      observedAt: new Date(),
      confidence: source === "borm" || source === "registro_mercantil" ? "high" : "low",
      largeHolderCandidate: LARGE_HOLDER.has(kind),
    },
    include: { legalEntity: true },
  });
  return mapClaim(row);
}

function mapClaim(row: {
  id: string;
  parcelRef: string;
  unitRef: string | null;
  source: OwnershipSource;
  sourceUrl: string | null;
  observedAt: Date;
  confidence: string;
  largeHolderCandidate: boolean;
  legalEntity: { id: string; taxId: string; legalName: string; kind: LegalEntityKind };
}): OwnershipClaim {
  return {
    id: row.id,
    parcelRef: row.parcelRef,
    unitRef: row.unitRef || undefined,
    legalEntityId: row.legalEntity.id,
    legalEntity: row.legalEntity,
    source: row.source,
    sourceUrl: row.sourceUrl || undefined,
    observedAt: row.observedAt.toISOString(),
    confidence: row.confidence as OwnershipClaim["confidence"],
    largeHolderCandidate: row.largeHolderCandidate,
  };
}
