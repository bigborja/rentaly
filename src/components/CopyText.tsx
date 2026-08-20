"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CopyText({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast.success("Copiado. Pégalo en el correo o en WhatsApp.");
      window.setTimeout(() => setDone(false), 2500);
    } catch {
      toast.error("No se ha podido copiar. Selecciona el texto a mano.");
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {done ? "Copiado" : label}
    </button>
  );
}
