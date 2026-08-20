import { createHash } from "crypto";

const MAX_BYTES = 350_000;

export function hashDiscardedJpeg(base64: string): { sha256: string; bytes: number } {
  const compact = base64.replace(/^data:image\/jpeg;base64,/i, "").replace(/\s/g, "");
  if (!compact || compact.length > MAX_BYTES * 2) {
    throw new Error("El recorte es demasiado pesado. Recorta de nuevo, sin el PDF entero.");
  }
  const buffer = Buffer.from(compact, "base64");
  if (buffer.length < 8 || buffer.length > MAX_BYTES) {
    throw new Error("El recorte no parece una imagen JPEG ofuscada.");
  }
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    throw new Error("No se aceptan PDF ni notas simples. Recorta en JPEG solo CIF, RC e importe.");
  }
  if (buffer.length < 24 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("El recorte tiene que ser JPEG (la cámara o el recorte de la web lo generan solos).");
  }
  return { sha256: createHash("sha256").update(buffer).digest("hex"), bytes: buffer.length };
}
