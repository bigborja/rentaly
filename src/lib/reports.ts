import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { CreateReportInput, Report, ReportType } from "./types";
import { compactRef, isCadastralRef } from "./parse";
import { getBarrio } from "./barrios-data";
import seedReports from "@/data/seed-reports.json";

const REPORTS_PATH = join(process.cwd(), "data/reports.json");

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

async function readStore(): Promise<Report[]> {
  try {
    const raw = await readFile(REPORTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as Report[];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    // first run uses the committed seed
  }
  return seedReports as Report[];
}

async function writeStore(reports: Report[]) {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
  const temp = `${REPORTS_PATH}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(reports, null, 2), "utf8");
  await writeFile(REPORTS_PATH, JSON.stringify(reports, null, 2), "utf8");
}

export async function listReports(filters?: {
  barrioId?: string;
  ref?: string;
  type?: ReportType;
}): Promise<Report[]> {
  const reports = await readStore();
  return reports
    .filter((report) => report.status === "published")
    .filter((report) => !filters?.barrioId || report.barrioId === filters.barrioId)
    .filter((report) => !filters?.type || report.type === filters.type)
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
  const title = String(input.title || "").trim();
  const body = String(input.body || "").trim();
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
    author: (input.author || "Anónimo").trim().slice(0, 40) || "Anónimo",
    createdAt: new Date().toISOString(),
    status: "published",
  };

  writeQueue = writeQueue.then(async () => {
    const reports = await readStore();
    reports.unshift(report);
    await writeStore(reports);
  });
  await writeQueue;
  return report;
}
