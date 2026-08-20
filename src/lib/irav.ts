const IRAV_INE_TABLE = "https://www.ine.es/jaxiT3/Tabla.htm?t=72975";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type IravPoint = {
  year: number;
  month: number;
  ratePercent: number;
  label: string;
  sourceUrl: string;
};

export type IneTableRow = {
  COD?: string;
  Nombre?: string;
  Data?: Array<{ Anyo?: number; FK_Periodo?: number; Valor?: number }>;
};

export function parseIravTable(rows: IneTableRow[]): IravPoint | null {
  const series = rows.find((row) => row.COD === "IRAV1") || rows[0];
  const point = series?.Data?.[0];
  const year = Number(point?.Anyo);
  const month = Number(point?.FK_Periodo);
  const rate = Number(point?.Valor);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12 || !Number.isFinite(rate)) {
    return null;
  }
  return {
    year,
    month,
    ratePercent: rate,
    label: `${MONTHS[month - 1]} de ${year}`,
    sourceUrl: IRAV_INE_TABLE,
  };
}

export function applyIrav(rentEuros: number, ratePercent: number) {
  if (!Number.isFinite(rentEuros) || rentEuros <= 0 || !Number.isFinite(ratePercent)) return null;
  const next = Math.round(rentEuros * (1 + ratePercent / 100) * 100) / 100;
  return { next, delta: Math.round((next - rentEuros) * 100) / 100 };
}
