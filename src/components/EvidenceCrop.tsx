"use client";

import { useRef, useState } from "react";

/**
 * Client-side crop: EXIF never leaves the device. PDFs are rejected.
 * The JPEG is hashed on the server and the pixels are discarded.
 */
export function EvidenceCrop({ onChange }: { onChange: (jpegBase64: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("Ningún recorte. El aviso se publicará con confianza media (cuenta).");

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setHint("No se aceptan PDF ni notas simples. Fotografía o recorta un JPEG.");
      onChange(null);
      setPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setHint("Solo imagen. Tapa nombres y DNI antes de continuar.");
      onChange(null);
      return;
    }
    const bitmap = await createImageBitmap(file);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const max = 720;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const jpeg = canvas.toDataURL("image/jpeg", 0.72);
    setPreview(jpeg);
    onChange(jpeg);
    setHint("Recorte listo. Guardamos el hash, no el archivo nítido ni el GPS. Se borra con el aporte.");
  }

  return (
    <fieldset className="rounded-2xl border border-ink/10 bg-mist/60 p-4">
      <legend className="px-1 text-sm font-medium">Recorte ofuscado (opcional)</legend>
      <p className="mt-1 text-xs leading-5 text-ink/60">
        Opcional. Sirve para subir la confianza del aviso. Tapa nombres, DNI e IBAN en el recuadro; deja CIF, referencia
        catastral, fechas e importe. El original no se sube: al dibujar aquí se pierde el EXIF (ubicación de la foto).
        Guardamos un hash, no el archivo nítido. Conservación 24 meses o hasta que retires el aviso.
      </p>
      <p className="mt-2 text-xs leading-5 text-ink/55">
        En público se ve apodo y sello de confianza. PDF y notas simples no se aceptan.
      </p>
      <input
        className="mt-3 block w-full text-sm"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <canvas ref={canvasRef} className="hidden" />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Recorte ofuscado que se va a hashear" className="mt-3 max-h-40 rounded-xl border border-ink/10" />
      ) : null}
      <p className="mt-2 text-xs text-ink/55">{hint}</p>
      {preview ? (
        <button
          type="button"
          className="mt-2 text-xs underline"
          onClick={() => {
            setPreview(null);
            onChange(null);
            setHint("Ningún recorte. El aviso se publicará con confianza media (cuenta).");
          }}
        >
          Quitar recorte
        </button>
      ) : null}
    </fieldset>
  );
}
