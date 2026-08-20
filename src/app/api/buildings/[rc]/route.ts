import { NextResponse } from "next/server";
import { loadFincaDossier } from "@/lib/dossier";
import { compactRef, isCadastralRef } from "@/lib/parse";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ rc: string }> }) {
  const { rc: raw } = await params;
  const rc = compactRef(raw);
  if (!isCadastralRef(rc)) {
    return NextResponse.json({ error: "Referencia catastral no válida." }, { status: 400 });
  }
  try {
    const dossier = await loadFincaDossier(rc);
    return NextResponse.json(
      {
        rc,
        parcelRef: dossier.parcel.parcelRef,
        physical: {
          address: dossier.catastro.address,
          yearBuilt: dossier.catastro.year,
          areaM2: dossier.catastro.areaM2,
          uses: dossier.catastro.constructions,
        },
        tourist: {
          onParcel: dossier.touristLicenses.filter((item) => item.onParcel).length,
          nearby: dossier.touristLicenses.filter((item) => !item.onParcel).length,
          licenses: dossier.touristLicenses,
        },
        inspections: dossier.inspections,
        ownership: {
          legalEntities: dossier.ownershipClaims.map((claim) => ({
            taxId: claim.legalEntity?.taxId,
            legalName: claim.legalEntity?.legalName,
            confidence: claim.confidence,
            parcelCountHint: true,
          })),
          naturalPersonHolders: "omitted",
        },
        community: {
          published: dossier.reports.length,
          verified: dossier.reports.filter((item) => item.trustBand === "alto").length,
        },
        rentContext: dossier.rentContext,
        barrio: dossier.barrio,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido armar la ficha.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
