import { randomUUID } from "crypto";
import type { AbuseCategory, Report, ReportType, CreateReportInput } from "./types";
import { compactRef, isCadastralRef } from "./parse";
import { getBarrio } from "./barrios-data";
import { readJsonFile, writeJsonFile } from "./fs-store";
import { publicAuthor, sanitizeReportText } from "@/domain/privacy";
import { assertLegalPersonTaxId } from "@/domain/ownership";
import { prisma } from "./db";
import { ensureDatabase } from "./ensure-db";
import seedReports from "@/data/seed-reports.json";
import type { Report as DbReport } from "@prisma/client";

const REPORTS_FILE = "reports.json";

const ABUSE_CATEGORIES = new Set([
  "fianza",
  "honorarios",
  "clausulas",
  "acoso",
  "entrada",
  "suministros",
  "obras",
  "discriminacion",
  "sin_contrato",
  "precio",
  "otro",
]);

let writeQueue: Promise<void> = Promise.resolve();

function mapReport(row: DbReport): Report {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    barrioId: row.barrioId || undefined,
    cadastralRef: row.cadastralRef || undefined,
    addressLabel: row.addressLabel || undefined,
    yearFrom: row.yearFrom || undefined,
    yearTo: row.yearTo || undefined,
    rentEuros: row.rentEuros || undefined,
    rating: row.rating || undefined,
    abuseCategory: row.abuseCategory || undefined,
    severity: row.severity || undefined,
    conservationState: row.conservationState || undefined,
    managerTaxId: row.managerTaxId || undefined,
    managerLegalName: row.managerLegalName || undefined,
    author: row.author,
    userId: row.userId || undefined,
    recommend: row.recommend ?? undefined,
    createdAt: row.createdAt.toISOString(),
    status: row.status,
  };
}

async function readStore(): Promise<Report[]> {
  const db = prisma();
  if (db) {
    await ensureDatabase();
    const rows = await db.report.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(mapReport);
  }
  const parsed = await readJsonFile<Report[]>(REPORTS_FILE, seedReports as Report[]);
  if (Array.isArray(parsed) && parsed.length) return parsed;
  return seedReports as Report[];
}

async function writeStore(reports: Report[]) {
  await writeJsonFile(REPORTS_FILE, reports);
}

export async function listReports(filters?: {
  barrioId?: string;
  ref?: string;
  type?: ReportType;
  userId?: string;
}): Promise<Report[]> {
  const reports = await readStore();
  return reports
    .filter((report) => report.status === "published")
    .filter((report) => !filters?.barrioId || report.barrioId === filters.barrioId)
    .filter((report) => !filters?.type || report.type === filters.type)
    .filter((report) => !filters?.userId || report.userId === filters.userId)
    .filter((report) => {
      if (!filters?.ref) return true;
      const needle = compactRef(filters.ref);
      const value = compactRef(report.cadastralRef || "");
      if (!value) return false;
      return value === needle || value.startsWith(needle.slice(0, 14)) || needle.startsWith(value.slice(0, 14));
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function reportStats() {
  const reports = await listReports();
  const byBarrio = new Map<string, { total: number; abuso: number; incidente: number; experiencia: number }>();
  const empty = { total: 0, abuso: 0, incidente: 0, experiencia: 0 };
  for (const report of reports) {
    if (!report.barrioId) continue;
    const current = byBarrio.get(report.barrioId) || { ...empty };
    current.total += 1;
    current[report.type] += 1;
    byBarrio.set(report.barrioId, current);
  }
  return {
    total: reports.length,
    abuso: reports.filter((report) => report.type === "abuso").length,
    incidente: reports.filter((report) => report.type === "incidente").length,
    experiencia: reports.filter((report) => report.type === "experiencia").length,
    byBarrio: Object.fromEntries(byBarrio),
  };
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const type = input.type;
  if (!["experiencia", "incidente", "abuso"].includes(type)) {
    throw new Error("El tipo de aporte no es válido.");
  }
  const title = sanitizeReportText(String(input.title || ""));
  const body = sanitizeReportText(String(input.body || ""));
  if (title.length < 8 || title.length > 120) {
    throw new Error("El título debe tener entre 8 y 120 caracteres.");
  }
  if (body.length < 40 || body.length > 4000) {
    throw new Error("Cuenta lo ocurrido con al menos 40 caracteres, sin datos personales de terceros.");
  }
  if (input.barrioId && !getBarrio(input.barrioId)) {
    throw new Error("Ese barrio no está en Madrid capital.");
  }
  const cadastralRef = input.cadastralRef ? compactRef(input.cadastralRef) : undefined;
  if (cadastralRef && !isCadastralRef(cadastralRef)) {
    throw new Error("La referencia catastral no tiene un formato válido.");
  }
  if (type === "abuso" && input.abuseCategory && !ABUSE_CATEGORIES.has(input.abuseCategory)) {
    throw new Error("La categoría de abuso no es válida.");
  }
  if (input.rating != null && (input.rating < 1 || input.rating > 5)) {
    throw new Error("La valoración va de 1 a 5.");
  }

  let managerTaxId: string | undefined;
  let managerLegalName: string | undefined;
  if (input.managerTaxId || input.managerLegalName) {
    if (!input.managerTaxId || !input.managerLegalName) {
      throw new Error("Si indicas una gestora o SOCIMI, hace falta CIF y razón social. No subas notas simples.");
    }
    managerTaxId = assertLegalPersonTaxId(input.managerTaxId);
    managerLegalName = sanitizeReportText(input.managerLegalName).slice(0, 120);
  }

  const report: Report = {
    id: randomUUID(),
    type,
    title,
    body,
    barrioId: input.barrioId,
    cadastralRef,
    addressLabel: input.addressLabel?.trim() || undefined,
    yearFrom: input.yearFrom,
    yearTo: input.yearTo,
    rentEuros: input.rentEuros,
    rating: input.rating,
    abuseCategory: type === "abuso" ? input.abuseCategory : undefined,
    severity: input.severity,
    managerTaxId,
    managerLegalName,
    author: publicAuthor(input.author),
    userId: input.userId,
    recommend: input.recommend,
    createdAt: new Date().toISOString(),
    status: "published",
  };

  writeQueue = writeQueue.then(async () => {
    const db = prisma();
    if (db) {
      await ensureDatabase();
      await db.report.create({
        data: {
          id: report.id,
          type: report.type,
          title: report.title,
          body: report.body,
          barrioId: report.barrioId,
          cadastralRef: report.cadastralRef,
          addressLabel: report.addressLabel,
          yearFrom: report.yearFrom,
          yearTo: report.yearTo,
          rentEuros: report.rentEuros,
          rating: report.rating,
          abuseCategory: (report.abuseCategory as AbuseCategory | undefined) || undefined,
          severity: report.severity,
          managerTaxId: report.managerTaxId,
          managerLegalName: report.managerLegalName,
          author: report.author,
          userId: report.userId,
          recommend: report.recommend,
          createdAt: new Date(report.createdAt),
          status: "published",
        },
      });
      return;
    }
    const reports = await readStore();
    reports.unshift(report);
    await writeStore(reports);
  });
  await writeQueue;
  if (report.managerTaxId && report.managerLegalName && cadastralRef) {
    try {
      const { createOwnershipClaim } = await import("./ownership-store");
      await createOwnershipClaim({
        parcelRef: cadastralRef,
        taxId: report.managerTaxId,
        legalName: report.managerLegalName,
        source: "user_verified",
      });
    } catch {
      // report stands even if the entity claim cannot be stored yet
    }
  }
  return report;
}
