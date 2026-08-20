import { lookupByRef } from "@/clients/catastro";
import { touristLicensesOnParcel } from "@/clients/madrid/vut";
import { inspectionConsulta } from "@/clients/madrid/ite";
import { censusSectionAt } from "@/clients/ine/atlas-renta";
import { barrioAt } from "@/lib/barrios";
import { listReports } from "@/lib/reports";
import { listOwnershipClaims } from "@/lib/ownership-store";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensure-db";
import { hasSupabase, sbUpsert } from "@/lib/supabase-rest";
import { parcelFromCatastro, toPublicReport, type FincaDossier } from "@/domain";

export async function loadFincaDossier(ref: string): Promise<FincaDossier> {
  const catastro = await lookupByRef(ref);
  const barrio =
    catastro.longitude != null && catastro.latitude != null
      ? await barrioAt(catastro.longitude, catastro.latitude)
      : undefined;

  const rentTask =
    catastro.longitude != null && catastro.latitude != null
      ? censusSectionAt(catastro.longitude, catastro.latitude)
      : Promise.resolve(null);
  const vutTask =
    catastro.longitude != null && catastro.latitude != null
      ? touristLicensesOnParcel(catastro.parcelRef, catastro.longitude, catastro.latitude)
      : Promise.resolve({ onParcel: [], nearby: [] as Awaited<ReturnType<typeof touristLicensesOnParcel>>["nearby"] });

  const [rentContext, vut, ownershipClaims, reports] = await Promise.all([
    rentTask,
    vutTask,
    listOwnershipClaims(catastro.parcelRef).catch(() => []),
    listReports({ ref: catastro.parcelRef }),
  ]);

  const parcel = parcelFromCatastro(catastro, {
    barrioId: barrio?.id,
    censusSectionCode: rentContext?.censusSectionCode,
  });
  await persistParcel(parcel);

  return {
    parcel,
    catastro,
    barrio,
    touristLicenses: [...vut.onParcel, ...vut.nearby],
    inspections: [inspectionConsulta(catastro.address)],
    worksLicenses: [],
    rentContext: rentContext || undefined,
    ownershipClaims,
    reports: reports.map(toPublicReport),
  };
}

async function persistParcel(parcel: ReturnType<typeof parcelFromCatastro>) {
  try {
    await ensureDatabase();
    const db = prisma();
    if (db) {
      if (parcel.censusSectionCode) {
        await db.censusSection.upsert({
          where: { code: parcel.censusSectionCode },
          create: {
            code: parcel.censusSectionCode,
            municipalityCode: parcel.censusSectionCode.slice(0, 5),
            districtCode: parcel.censusSectionCode.slice(5, 7),
            year: new Date().getFullYear(),
          },
          update: {},
        });
      }
      await db.parcel.upsert({
        where: { parcelRef: parcel.parcelRef },
        create: {
          parcelRef: parcel.parcelRef,
          address: parcel.address,
          postalCode: parcel.postalCode,
          barrioId: parcel.barrioId,
          censusSectionCode: parcel.censusSectionCode,
          longitude: parcel.longitude,
          latitude: parcel.latitude,
          parcelAreaM2: parcel.parcelAreaM2,
          parcelKind: parcel.parcelKind,
          yearBuilt: parcel.yearBuilt,
          fetchedAt: new Date(parcel.fetchedAt),
        },
        update: {
          address: parcel.address,
          postalCode: parcel.postalCode,
          barrioId: parcel.barrioId,
          censusSectionCode: parcel.censusSectionCode,
          longitude: parcel.longitude,
          latitude: parcel.latitude,
          fetchedAt: new Date(parcel.fetchedAt),
        },
      });
      return;
    }
    if (!hasSupabase()) return;
    if (parcel.censusSectionCode) {
      await sbUpsert(
        "census_sections",
        {
          code: parcel.censusSectionCode,
          municipalityCode: parcel.censusSectionCode.slice(0, 5),
          districtCode: parcel.censusSectionCode.slice(5, 7),
          year: new Date().getFullYear(),
        },
        "code",
      );
    }
    await sbUpsert(
      "parcels",
      {
        parcelRef: parcel.parcelRef,
        address: parcel.address || null,
        postalCode: parcel.postalCode || null,
        barrioId: parcel.barrioId || null,
        censusSectionCode: parcel.censusSectionCode || null,
        longitude: parcel.longitude ?? null,
        latitude: parcel.latitude ?? null,
        parcelAreaM2: parcel.parcelAreaM2 ?? null,
        parcelKind: parcel.parcelKind || null,
        yearBuilt: parcel.yearBuilt ?? null,
        fetchedAt: parcel.fetchedAt,
      },
      "parcelRef",
    );
  } catch {
    // migrate pending or REST optional
  }
}
