"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LEGAL_ENTITY_KINDS, type LegalEntityKind, type OwnershipSource } from "@/domain/ownership";

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
  const [source, setSource] = useState<OwnershipSource>("user_verified");

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
          source,
          sourceUrl: String(form.get("sourceUrl") || "") || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se ha podido guardar.");
      event.currentTarget.reset();
      setSource("user_verified");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  const needsUrl = source === "borm" || source === "registro_mercantil";

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-2xl bg-mist/80 p-4">
      <p className="text-xs leading-5 text-ink/60">
        Solo personas jurídicas (CIF). No pegues un DNI ni subas la nota simple. Un aporte vecinal queda como baja
        confianza hasta que haya enlace a BOE, BORM o registradores.
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
          <select
            name="source"
            className="field-input"
            value={source}
            onChange={(event) => setSource(event.target.value as OwnershipSource)}
          >
            <option value="user_verified">Aporte vecinal (baja confianza)</option>
            <option value="borm">BORM</option>
            <option value="registro_mercantil">Registro mercantil</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-ink/70">URL de la fuente {needsUrl ? "(obligatoria)" : "(si la tienes)"}</span>
        <input
          name="sourceUrl"
          type="url"
          required={needsUrl}
          className="field-input"
          placeholder="https://www.boe.es/…"
        />
      </label>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
        {loading ? "Guardando…" : "Vincular entidad a esta finca"}
      </button>
    </form>
  );
}
