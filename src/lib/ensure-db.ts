import { BARRIOS } from "@/lib/barrios-data";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-crypto";
import seedReports from "@/data/seed-reports.json";
import type { AbuseCategory, ReportStatus, ReportType, Severity } from "@prisma/client";

let boot: Promise<void> | null = null;

export async function ensureDatabase() {
  const db = prisma();
  if (!db) return;
  if (!boot) {
    boot = bootDatabase().catch((error) => {
      boot = null;
      throw error;
    });
  }
  await boot;
}

async function bootDatabase() {
  const db = prisma();
  if (!db) return;

  await db.neighborhood.createMany({
    skipDuplicates: true,
    data: BARRIOS.map((barrio) => ({
      id: barrio.id,
      slug: barrio.slug,
      name: barrio.name,
      districtId: barrio.districtId,
      district: barrio.district,
    })),
  });

  const demoEmail = "inquilina@rentaly.madrid";
  const demo = await db.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    await db.user.create({
      data: {
        id: "demo-inquilina",
        email: demoEmail,
        nickname: "Inquilina 015",
        passwordHash: await hashPassword("madrid131"),
        createdAt: new Date("2026-01-10T10:00:00.000Z"),
        onboardingComplete: true,
        intent: "buscar",
        barrioId: "015",
      },
    });
  }

  if ((await db.report.count()) === 0) {
    await db.report.createMany({
      data: (seedReports as Array<Record<string, unknown>>).map((item) => ({
        id: String(item.id),
        type: item.type as ReportType,
        title: String(item.title),
        body: String(item.body),
        barrioId: item.barrioId ? String(item.barrioId) : null,
        cadastralRef: item.cadastralRef ? String(item.cadastralRef) : null,
        addressLabel: item.addressLabel ? String(item.addressLabel) : null,
        yearFrom: typeof item.yearFrom === "number" ? item.yearFrom : null,
        yearTo: typeof item.yearTo === "number" ? item.yearTo : null,
        rentEuros: typeof item.rentEuros === "number" ? item.rentEuros : null,
        rating: typeof item.rating === "number" ? item.rating : null,
        abuseCategory: (item.abuseCategory as AbuseCategory | undefined) ?? null,
        severity: (item.severity as Severity | undefined) ?? null,
        author: String(item.author || "Anónimo"),
        recommend: typeof item.recommend === "boolean" ? item.recommend : null,
        createdAt: new Date(String(item.createdAt)),
        status: (item.status as ReportStatus | undefined) || "published",
      })),
    });
  }
}
