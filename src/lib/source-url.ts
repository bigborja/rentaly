/** Official gazette / registry hosts. Never fetch these URLs server-side (SSRF). */

const ALLOWED_HOSTS = [
  "boe.es",
  "borm.es",
  "registradores.org",
  "cnmv.es",
  "datos.gob.es",
  "madrid.es",
  "comunidad.madrid",
];

export function assertAllowedSourceUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error("El enlace a la fuente no es una URL válida.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("La fuente tiene que ser https (BORM, BOE o registro).");
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!host || /^\d/.test(host) || host === "localhost" || host.endsWith(".local")) {
    throw new Error("Ese enlace no es un boletín ni un registro oficial.");
  }
  const allowed = ALLOWED_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (!allowed) {
    throw new Error("Solo se aceptan enlaces a BOE, BORM, registradores, CNMV o datos abiertos oficiales.");
  }
  return parsed.toString();
}
