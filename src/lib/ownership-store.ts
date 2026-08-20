import { randomUUID } from "crypto";
import type { LegalEntity, LegalEntityKind, OwnershipClaim, OwnershipSource } from "@/domain";
import { assertLegalPersonTaxId } from "@/domain/ownership";
import { prisma } from "./db";
import { ensureDatabase } from "./ensure-db";
import { compactRef, isCadastralRef } from "./parse";
import { sanitizeReportText } from "@/domain/privacy";
import { hasSupabase, sbEq, sbIn, sbInsert, sbPatch, sbSelect, sbUpsert } from "./supabase-rest";
import { assertAllowedSourceUrl } from "./source-url";

const LARGE_HOLDER = new Set<LegalEntityKind>(["socimi", "fondo"]);

type EntityRow = { id: string; taxId: string; legalName: string; kind: LegalEntityKind };
type ClaimRow = {
  id: string;
  parcelRef: string;
  unitRef: string | null;
  source: OwnershipSource;
  sourceUrl: string | null;
  observedAt: Date | string;
  confidence: string;
  largeHolderCandidate: boolean;
  legalEntityId: string;
};

export async function listOwnershipClaims(parcelRef: string): Promise<OwnershipClaim[]> {
  const needle = compactRef(parcelRef).slice(0, 14);
  const db = prisma();
  if (db) {
    await ensureDatabase();
    const rows = await db.ownershipClaim.findMany({
      where: { parcelRef: needle },
      include: { legalEntity: true },
      orderBy: { observedAt: "desc" },
    });
    return rows.map(mapClaim);
  }
  if (hasSupabase()) {
    await ensureDatabase();
    const claims = await sbSelect<ClaimRow>(
      "ownership_claims",
      `${sbEq("parcelRef", needle)}&order=observedAt.desc&select=*`,
    );
    return hydrateClaims(claims);
  }
  return [];
}

export async function portfolioForTaxId(taxId: string): Promise<{ entity: LegalEntity; claims: OwnershipClaim[] } | null> {
  const compact = assertLegalPersonTaxId(taxId);
  const db = prisma();
  if (db) {
    await ensureDatabase();
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
  if (hasSupabase()) {
    await ensureDatabase();
    const entities = await sbSelect<EntityRow>("legal_entities", `${sbEq("taxId", compact)}&select=*`);
    const entity = entities[0];
    if (!entity) return null;
    const claims = await sbSelect<ClaimRow>(
      "ownership_claims",
      `${sbEq("legalEntityId", entity.id)}&order=observedAt.desc&select=*`,
    );
    return {
      entity: { id: entity.id, taxId: entity.taxId, legalName: entity.legalName, kind: entity.kind },
      claims: await hydrateClaims(claims, [entity]),
    };
  }
  return null;
}

export async function createOwnershipClaim(input: {
  parcelRef: string;
  taxId: string;
  legalName: string;
  kind?: LegalEntityKind;
  source?: OwnershipSource;
  sourceUrl?: string;
}): Promise<OwnershipClaim> {
  const parcelRef = compactRef(input.parcelRef).slice(0, 14);
  if (!isCadastralRef(parcelRef)) throw new Error("La referencia catastral no es válida.");
  const taxId = assertLegalPersonTaxId(input.taxId);
  const legalName = sanitizeReportText(input.legalName).slice(0, 160);
  if (legalName.length < 3) throw new Error("Indica la razón social, no un nombre de persona.");
  const kind = input.kind || "otra_juridica";
  const source = input.source || "user_verified";
  let sourceUrl = input.sourceUrl?.trim() || undefined;
  if (source === "borm" || source === "registro_mercantil") {
    if (!sourceUrl) throw new Error("Un aviso BORM o de registro necesita el enlace https al anuncio.");
  }
  if (sourceUrl) sourceUrl = assertAllowedSourceUrl(sourceUrl);
  const confidence = source === "borm" || source === "registro_mercantil" ? "high" : "low";

  const db = prisma();
  if (db) {
    await ensureDatabase();
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
        confidence,
        largeHolderCandidate: LARGE_HOLDER.has(kind),
      },
      include: { legalEntity: true },
    });
    return mapClaim(row);
  }

  if (hasSupabase()) {
    await ensureDatabase();
    await sbUpsert("parcels", { parcelRef, fetchedAt: new Date().toISOString() }, "parcelRef");
    const existing = await sbSelect<EntityRow>("legal_entities", `${sbEq("taxId", taxId)}&select=*`);
    let entity = existing[0];
    if (entity) {
      const patched = await sbPatch<EntityRow>("legal_entities", sbEq("id", entity.id), { legalName, kind });
      entity = patched[0] || { ...entity, legalName, kind };
    } else {
      const created = await sbInsert<EntityRow>("legal_entities", {
        id: randomUUID(),
        taxId,
        legalName,
        kind,
      });
      entity = created[0];
    }
    if (!entity) throw new Error("No se pudo guardar la persona jurídica.");
    const observedAt = new Date().toISOString();
    const inserted = await sbInsert<ClaimRow>("ownership_claims", {
      id: randomUUID(),
      parcelRef,
      legalEntityId: entity.id,
      source,
      sourceUrl: sourceUrl || null,
      observedAt,
      confidence,
      largeHolderCandidate: LARGE_HOLDER.has(kind),
    });
    const claim = inserted[0];
    if (!claim) throw new Error("No se pudo guardar el vínculo con la finca.");
    return mapClaim({ ...claim, legalEntity: entity });
  }

  throw new Error("Hace falta SUPABASE_SECRET_KEY o DATABASE_URL para guardar personas jurídicas.");
}

export async function parcelCountsByTaxId(taxIds: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(taxIds.map((id) => id.trim().toUpperCase()).filter(Boolean))];
  const counts: Record<string, number> = {};
  await Promise.all(
    unique.map(async (taxId) => {
      try {
        const portfolio = await portfolioForTaxId(taxId);
        counts[taxId] = portfolio ? new Set(portfolio.claims.map((claim) => claim.parcelRef)).size : 0;
      } catch {
        counts[taxId] = 0;
      }
    }),
  );
  return counts;
}

async function hydrateClaims(claims: ClaimRow[], known: EntityRow[] = []): Promise<OwnershipClaim[]> {
  if (!claims.length) return [];
  const have = new Map(known.map((entity) => [entity.id, entity]));
  const missing = [...new Set(claims.map((claim) => claim.legalEntityId).filter((id) => !have.has(id)))];
  if (missing.length) {
    const extra = await sbSelect<EntityRow>("legal_entities", `${sbIn("id", missing)}&select=*`);
    for (const entity of extra) have.set(entity.id, entity);
  }
  return claims.flatMap((claim) => {
    const legalEntity = have.get(claim.legalEntityId);
    return legalEntity ? [mapClaim({ ...claim, legalEntity })] : [];
  });
}

function mapClaim(row: {
  id: string;
  parcelRef: string;
  unitRef: string | null;
  source: OwnershipSource;
  sourceUrl: string | null;
  observedAt: Date | string;
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
    observedAt: typeof row.observedAt === "string" ? row.observedAt : row.observedAt.toISOString(),
    confidence: row.confidence as OwnershipClaim["confidence"],
    largeHolderCandidate: row.largeHolderCandidate,
  };
}
