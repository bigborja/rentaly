import { lookupByRef, summarizeUses } from "@/clients/catastro/ovc";
import { touristLicensesNear } from "@/clients/madrid/vut";
import { latestIrav } from "@/clients/ine/irav";
import { barrioAt } from "@/lib/barrios";
import { listReports } from "@/lib/reports";
import { listOwnershipClaims } from "@/lib/ownership-store";
import { serpaviScope } from "@/lib/official";
import type { ParcelPeek } from "@/domain/peek";

export async function loadFincaPeek(ref: string): Promise<ParcelPeek> {
  const catastro = await lookupByRef(ref);
  const barrio =
    catastro.longitude != null && catastro.latitude != null
      ? await barrioAt(catastro.longitude, catastro.latitude)
      : undefined;
  const nearby =
    catastro.longitude != null && catastro.latitude != null
      ? await touristLicensesNear(catastro.longitude, catastro.latitude, 80)
      : [];
  const [reports, claims, irav] = await Promise.all([
    listReports({ ref: catastro.parcelRef }),
    listOwnershipClaims(catastro.parcelRef).catch(() => []),
    latestIrav(),
  ]);
  const uses = summarizeUses(catastro);
  const primaryUse = catastro.use || uses[0]?.use;
  const entities = claims.flatMap((claim) =>
    claim.legalEntity
      ? [{ taxId: claim.legalEntity.taxId, legalName: claim.legalEntity.legalName }]
      : [],
  );
  const unique = [...new Map(entities.map((entity) => [entity.taxId, entity])).values()];

  return {
    parcelRef: catastro.parcelRef,
    address: catastro.address,
    areaM2: catastro.areaM2,
    year: catastro.year,
    use: primaryUse,
    barrio: barrio
      ? { id: barrio.id, name: barrio.name, slug: barrio.slug, district: barrio.district }
      : undefined,
    touristNearby: nearby.length,
    touristUnitsNearby: nearby.reduce((sum, item) => sum + item.units, 0),
    reports: reports.length,
    abuse: reports.filter((report) => report.type === "abuso").length,
    legalEntities: unique,
    serpavi: serpaviScope({ areaM2: catastro.areaM2, year: catastro.year, use: primaryUse }),
    irav: irav ? { label: irav.label, ratePercent: irav.ratePercent } : undefined,
  };
}
