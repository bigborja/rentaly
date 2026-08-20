import { BARRIOS } from "@/lib/barrios-data";
import { prisma } from "@/lib/db";
import { hasSupabase, sbEq, sbSelect, sbUpsert } from "@/lib/supabase-rest";
import { hashPassword } from "@/lib/auth-crypto";
import seedReports from "@/data/seed-reports.json";
import type { AbuseCategory, ReportStatus, ReportType, Severity } from "@prisma/client";

let boot: Promise<void> | null = null;

export async function ensureDatabase() {
  if (!prisma() && !hasSupabase()) return;
  if (!boot) {
    boot = bootStores().catch((error) => {
      boot = null;
      throw error;
    });
  }
  await boot;
}

async function bootStores() {
  if (prisma()) await bootPrisma();
  else if (hasSupabase()) await bootSupabase();
}

async function demoUserRow() {
  return {
    id: "demo-inquilina",
    email: "inquilina@rentaly.madrid",
    nickname: "Inquilina 015",
    passwordHash: await hashPassword("madrid131"),
    createdAt: "2026-01-10T10:00:00.000Z",
    onboardingComplete: true,
    intent: "buscar",
    barrioId: "015",
  };
}

async function bootSupabase() {
  const barrios = BARRIOS.map((barrio) => ({
    id: barrio.id,
    slug: barrio.slug,
    name: barrio.name,
    districtId: barrio.districtId,
    district: barrio.district,
  }));
  for (let i = 0; i < barrios.length; i += 50) {
    await sbUpsert("neighborhoods", barrios.slice(i, i + 50), "id");
  }

  const demo = await sbSelect<{ id: string }>("users", `${sbEq("email", "inquilina@rentaly.madrid")}&select=id`);
  if (!demo.length) {
    await sbUpsert("users", await demoUserRow(), "id");
  }

  const existing = await sbSelect<{ id: string }>("reports", "select=id&limit=1");
  if (!existing.length) {
    const rows = (seedReports as Array<Record<string, unknown>>).map((item) => ({
      id: String(item.id),
      type: item.type,
      title: String(item.title),
      body: String(item.body),
      barrioId: item.barrioId ? String(item.barrioId) : null,
      cadastralRef: item.cadastralRef ? String(item.cadastralRef) : null,
      addressLabel: item.addressLabel ? String(item.addressLabel) : null,
      yearFrom: typeof item.yearFrom === "number" ? item.yearFrom : null,
      yearTo: typeof item.yearTo === "number" ? item.yearTo : null,
      rentEuros: typeof item.rentEuros === "number" ? item.rentEuros : null,
      rating: typeof item.rating === "number" ? item.rating : null,
      abuseCategory: item.abuseCategory || null,
      severity: item.severity || null,
      author: String(item.author || "Anónimo"),
      recommend: typeof item.recommend === "boolean" ? item.recommend : null,
      createdAt: String(item.createdAt),
      status: item.status || "published",
    }));
    await sbUpsert("reports", rows, "id");
  }
}

async function bootPrisma() {
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
    const row = await demoUserRow();
    await db.user.create({
      data: {
        ...row,
        createdAt: new Date(row.createdAt),
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
