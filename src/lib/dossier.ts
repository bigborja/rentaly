import { lookupByRef } from "@/clients/catastro";
import { touristLicensesNear } from "@/clients/madrid/vut";
import { inspectionConsulta } from "@/clients/madrid/ite";
import { barrioAt } from "@/lib/barrios";
import { listReports } from "@/lib/reports";
import { parcelFromCatastro, toPublicReport, type FincaDossier } from "@/domain";

export async function loadFincaDossier(ref: string): Promise<FincaDossier> {
  const catastro = await lookupByRef(ref);
  const barrio =
    catastro.longitude != null && catastro.latitude != null
      ? await barrioAt(catastro.longitude, catastro.latitude)
      : undefined;
  const touristLicenses =
    catastro.longitude != null && catastro.latitude != null
      ? await touristLicensesNear(catastro.longitude, catastro.latitude)
      : [];
  const reports = (await listReports({ ref: catastro.parcelRef })).map(toPublicReport);

  return {
    parcel: parcelFromCatastro(catastro, { barrioId: barrio?.id }),
    catastro,
    barrio,
    touristLicenses,
    inspections: [inspectionConsulta(catastro.address)],
    worksLicenses: [],
    ownershipClaims: [],
    reports,
  };
}
