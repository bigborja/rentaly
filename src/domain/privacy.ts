/**
 * RGPD helpers for tenant reports.
 * Cadastre open data has no private owner names; we also refuse to persist them from users.
 */

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE = /(?:\+34|0034)?[\s.]?[6-9]\d{2}[\s.]?\d{3}[\s.]?\d{3}/g;
const DNI = /\b\d{8}[A-HJ-NP-TV-Z]\b/gi;
const NIE = /\b[XYZ]\d{7}[A-Z]\b/gi;
const IBAN = /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/gi;

const NATURAL_PERSON_OWNER = /\b(propietario|propietaria|dueño|dueña|arrendador|arrendadora)\b[^.]{0,40}\b(dni|nie|llamad[oa]|se llama)\b/i;

export function redactPii(text: string): string {
  return text
    .replace(EMAIL, "[correo omitido]")
    .replace(IBAN, "[cuenta omitida]")
    .replace(DNI, "[documento omitido]")
    .replace(NIE, "[documento omitido]")
    .replace(PHONE, "[teléfono omitido]");
}

export function containsNaturalPersonOwnerClaim(text: string): boolean {
  return NATURAL_PERSON_OWNER.test(text);
}

export function sanitizeReportText(text: string): string {
  const redacted = redactPii(text).replace(/\s+/g, " ").trim();
  if (containsNaturalPersonOwnerClaim(redacted)) {
    throw new Error(
      "No publiques nombres, DNI ni datos de personas físicas propietarias. El Catastro no los da y Rentaly no los inventa. Si es una empresa, usa la razón social y el CIF.",
    );
  }
  return redacted;
}

export function publicAuthor(nickname: string | undefined): string {
  const value = (nickname || "Anónimo").trim().slice(0, 40);
  return value || "Anónimo";
}
