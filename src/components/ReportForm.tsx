"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BARRIOS } from "@/lib/barrios-data";
import { ABUSE_LABELS } from "@/lib/format";
import type { AbuseCategory, ReportType } from "@/lib/types";

export function ReportForm({
  defaultBarrioId,
  defaultRef,
  defaultAddress,
}: {
  defaultBarrioId?: string;
  defaultRef?: string;
  defaultAddress?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<ReportType>("experiencia");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      type,
      title: String(form.get("title") || ""),
      body: String(form.get("body") || ""),
      barrioId: String(form.get("barrioId") || "") || undefined,
      cadastralRef: String(form.get("cadastralRef") || "") || undefined,
      addressLabel: String(form.get("addressLabel") || "") || undefined,
      author: String(form.get("author") || "") || "Anónimo",
      yearFrom: form.get("yearFrom") ? Number(form.get("yearFrom")) : undefined,
      rentEuros: form.get("rentEuros") ? Number(form.get("rentEuros")) : undefined,
      rating: form.get("rating") ? Number(form.get("rating")) : undefined,
      abuseCategory: (form.get("abuseCategory") || undefined) as AbuseCategory | undefined,
      severity: (form.get("severity") || undefined) as "baja" | "media" | "alta" | undefined,
    };
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se ha podido publicar.");
      if (payload.cadastralRef) router.push(`/inmueble/${payload.cadastralRef}`);
      else if (payload.barrioId) {
        const barrio = BARRIOS.find((item) => item.id === payload.barrioId);
        router.push(barrio ? `/barrios/${barrio.slug}` : "/");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-card">
      <div className="grid gap-2 sm:grid-cols-3">
        {(["experiencia", "incidente", "abuso"] as ReportType[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`rounded-2xl border px-3 py-3 text-sm ${
              type === value ? "border-wine bg-wine text-paper" : "border-ink/15 bg-paper"
            }`}
          >
            {value === "experiencia" ? "Experiencia" : value === "incidente" ? "Incidente" : "Aviso de abuso"}
          </button>
        ))}
      </div>

      <Field label="Título">
        <input name="title" required minLength={8} maxLength={120} className="field-input" placeholder="Qué deberían saber otras personas inquilinas" />
      </Field>
      <Field label="Relato">
        <textarea
          name="body"
          required
          minLength={40}
          maxLength={4000}
          rows={7}
          className="field-input"
          placeholder="Hechos, fechas, qué pedían, cómo se resolvió. Sin nombres de terceros ni datos médicos."
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Barrio">
          <select name="barrioId" defaultValue={defaultBarrioId || ""} className="field-input">
            <option value="">Sin barrio concreto</option>
            {BARRIOS.map((barrio) => (
              <option key={barrio.id} value={barrio.id}>
                {barrio.district} · {barrio.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Referencia catastral (opcional)">
          <input name="cadastralRef" defaultValue={defaultRef} className="field-input font-mono" placeholder="14 o 20 caracteres" />
        </Field>
      </div>
      <Field label="Calle o entorno">
        <input name="addressLabel" defaultValue={defaultAddress} className="field-input" placeholder="Calle y portal, o zona" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Año">
          <input name="yearFrom" type="number" min="1990" max="2026" className="field-input" />
        </Field>
        <Field label="Renta €/mes">
          <input name="rentEuros" type="number" min="0" className="field-input" />
        </Field>
        {type === "experiencia" ? (
          <Field label="Valoración">
            <select name="rating" className="field-input" defaultValue="">
              <option value="">Sin nota</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </Field>
        ) : (
          <Field label="Gravedad">
            <select name="severity" className="field-input" defaultValue="media">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </Field>
        )}
      </div>
      {type === "abuso" ? (
        <Field label="Tipo de abuso">
          <select name="abuseCategory" className="field-input" defaultValue="otro">
            {Object.entries(ABUSE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Firma (o déjalo en Anónimo)">
        <input name="author" className="field-input" placeholder="Anónimo" />
      </Field>
      <p className="text-xs leading-5 text-ink/55">
        No publiques DNI, cuentas bancarias ni el nombre de menores. Un aviso en Rentaly no es una denuncia: si hay
        delito o riesgo, acude a Policía/Guardia Civil o al 112.
      </p>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-wine px-5 py-3 text-sm font-medium text-paper disabled:opacity-60"
      >
        {loading ? "Publicando…" : "Publicar en la memoria vecinal"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ink/70">{label}</span>
      {children}
    </label>
  );
}
