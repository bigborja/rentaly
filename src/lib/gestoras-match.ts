const LEGAL_PERSON_TAX_ID = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;

export function foldSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\b(SL|SA|SLU|SAU|SRL|SOCIMI)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesGestoraQuery(
  query: string,
  row: { taxId: string; legalName: string },
): boolean {
  const q = query.trim();
  if (!q) return true;
  const compact = q.toUpperCase().replace(/[\s.-]/g, "");
  if (LEGAL_PERSON_TAX_ID.test(compact)) return row.taxId === compact;
  if (/^[ABCDEFGHJNPQRSUVW]\d{2,7}[0-9A-J]?$/.test(compact)) {
    return row.taxId.startsWith(compact);
  }
  const needle = foldSearch(q);
  if (needle.length < 2) return false;
  return foldSearch(row.legalName).includes(needle) || row.taxId.includes(compact);
}
