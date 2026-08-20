"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LEGAL_ENTITY_KINDS, type LegalEntityKind } from "@/domain/ownership";

const KIND_LABEL: Record<LegalEntityKind, string> = {
  socimi: "SOCIMI",
  fondo: "Fondo",
  sa: "S.A.",
  sl: "S.L.",
  cooperativa: "Cooperativa",
  administracion: "Administración",
  otra_juridica: "Otra persona jurídica",
};

export function OwnershipForm({ parcelRef }: { parcelRef: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelRef,
          taxId: String(form.get("taxId") || ""),
          legalName: String(form.get("legalName") || ""),
          kind: String(form.get("kind") || "otra_juridica"),
          source: String(form.get("source") || "user_verified"),
          sourceUrl: String(form.get("sourceUrl") || "") || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se ha podido guardar.");
      event.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-2xl bg-mist/80 p-4">
      <p className="text-xs leading-5 text-ink/60">
        Solo personas jurídicas (CIF). No pegues un DNI ni subas la nota simple: extrae la razón social y el enlace al
        BORM o al registro mercantil.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-ink/70">CIF</span>
          <input name="taxId" required className="field-input font-mono" placeholder="A28000000" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/70">Razón social</span>
          <input name="legalName" required minLength={3} className="field-input" placeholder="SOCIMI, SL, fondo…" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/70">Tipo</span>
          <select name="kind" className="field-input" defaultValue="otra_juridica">
            {LEGAL_ENTITY_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/70">Fuente</span>
          <select name="source" className="field-input" defaultValue="user_verified">
            <option value="user_verified">Aporte vecinal</option>
            <option value="borm">BORM</option>
            <option value="registro_mercantil">Registro mercantil</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">URL de la fuente (opcional)</span>
        <input name="sourceUrl" type="url" className="field-input" placeholder="https://…" />
      </label>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
        {loading ? "Guardando…" : "Vincular entidad a esta finca"}
      </button>
    </form>
  );
}
