/** Legal-person row from the Comunidad de Madrid RAIN open dataset (CC BY). */
export interface RainLegalAgent {
  rainNumber: string;
  legalName: string;
  taxId: string;
}

const LEGAL_PERSON_TAX_ID = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
const CSV_HEADER = "NUMERO REGISTRO RAIN";

function cleanCell(value: string): string {
  return value.replace(/^\uFEFF/, "").trim();
}

function keepLegalTaxId(raw: string): string | null {
  const compact = raw.trim().toUpperCase().replace(/[\s.-]/g, "");
  return LEGAL_PERSON_TAX_ID.test(compact) ? compact : null;
}

function keepLegalAgent(rainNumber: string, legalName: string, taxRaw: string): RainLegalAgent | null {
  const taxId = keepLegalTaxId(taxRaw);
  if (!taxId) return null;
  const name = legalName.replace(/\s+/g, " ").trim();
  if (name.length < 3) return null;
  const number = rainNumber.replace(/\s+/g, "");
  if (!number) return null;
  return { rainNumber: number, legalName: name.slice(0, 180), taxId };
}

/** Keep CIF rows only. Masked NIF/NIE and natural-person names never leave this parser. */
export function parseRainCsv(text: string): RainLegalAgent[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const out: RainLegalAgent[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(";").map(cleanCell);
    if (parts.length < 3) continue;
    if (parts[0].toUpperCase() === CSV_HEADER) continue;
    const row = keepLegalAgent(parts[0], parts[1], parts[2]);
    if (!row || seen.has(row.taxId)) continue;
    seen.add(row.taxId);
    out.push(row);
  }
  return out;
}

type RainJsonRecord = {
  "NUMERO REGISTRO RAIN"?: string;
  "NOMBRE TITULAR"?: string;
  "CIF/NIF/NIE"?: string;
};

export function parseRainJson(payload: unknown): RainLegalAgent[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];
  const out: RainLegalAgent[] = [];
  const seen = new Set<string>();
  for (const item of records) {
    if (!item || typeof item !== "object") continue;
    const rec = item as RainJsonRecord;
    const row = keepLegalAgent(
      String(rec["NUMERO REGISTRO RAIN"] || ""),
      String(rec["NOMBRE TITULAR"] || ""),
      String(rec["CIF/NIF/NIE"] || ""),
    );
    if (!row || seen.has(row.taxId)) continue;
    seen.add(row.taxId);
    out.push(row);
  }
  return out;
}
