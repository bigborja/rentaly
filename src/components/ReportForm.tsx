"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BARRIOS } from "@/lib/barrios-data";
import { ABUSE_LABELS } from "@/lib/format";
import type { AbuseCategory, ReportType } from "@/lib/types";
import { EvidenceCrop } from "@/components/EvidenceCrop";

export function ReportForm({
  defaultBarrioId,
  defaultRef,
  defaultAddress,
  defaultType = "experiencia",
  nickname,
}: {
  defaultBarrioId?: string;
  defaultRef?: string;
  defaultAddress?: string;
  defaultType?: ReportType;
  nickname: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<ReportType>(defaultType);
  const [recommend, setRecommend] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [evidenceJpegBase64, setEvidenceJpegBase64] = useState<string | null>(null);

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
      managerTaxId: String(form.get("managerTaxId") || "") || undefined,
      managerLegalName: String(form.get("managerLegalName") || "") || undefined,
      yearFrom: form.get("yearFrom") ? Number(form.get("yearFrom")) : undefined,
      rentEuros: form.get("rentEuros") ? Number(form.get("rentEuros")) : undefined,
      rating: form.get("rating") ? Number(form.get("rating")) : undefined,
      abuseCategory: (form.get("abuseCategory") || undefined) as AbuseCategory | undefined,
      severity: (form.get("severity") || undefined) as "baja" | "media" | "alta" | undefined,
      recommend: recommend === "" ? undefined : recommend === "si",
      evidenceJpegBase64: evidenceJpegBase64 || undefined,
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
        router.push(barrio ? `/barrios/${barrio.slug}` : "/cuenta");
      } else {
        router.push("/cuenta");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      <p className="text-sm text-ink/60">
        Se publicará como <strong>{nickname}</strong>. El correo de la cuenta no aparece. Elige el tipo y cuenta hechos:
        fechas, cantidades, qué pedían, cómo se resolvió.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {(["experiencia", "incidente", "abuso"] as ReportType[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`rounded-2xl border px-3 py-3 text-sm ${
              type === value
                ? value === "abuso"
                  ? "border-wine bg-wine text-paper"
                  : "border-ink bg-ink text-paper"
                : "border-ink/15 bg-paper"
            }`}
          >
            {value === "experiencia" ? "Experiencia" : value === "incidente" ? "Incidente" : "Aviso de abuso"}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-ink/55">
        {type === "experiencia"
          ? "Experiencia: cómo fue vivir el contrato (renta, trato, vecinos, si lo recomendarías). Útil aunque el alquiler fuera razonable."
          : type === "incidente"
            ? "Incidente: algo del edificio o de la gestión que no es necesariamente un abuso (humedad, calefacción, portería, obras, ruidos)."
            : "Aviso de abuso: fianza irregular, honorarios indebidos, entrada sin permiso, discriminación, contrato simulado u otra irregularidad. Si hay delito, 112 además de este texto."}
      </p>

      <Field label="Título">
        <input
          name="title"
          required
          minLength={8}
          maxLength={120}
          className="field-input"
          placeholder="Qué deberían saber otras personas inquilinas"
        />
      </Field>
      <p className="-mt-3 text-xs text-ink/50">Una frase clara. Evita insultos y nombres propios.</p>
      <Field label="Relato">
        <textarea
          name="body"
          required
          minLength={40}
          maxLength={4000}
          rows={7}
          className="field-input"
          placeholder="Hechos, fechas, qué pedían, ruido, trato, fianza, cómo se resolvió. Sin nombres de terceros."
        />
      </Field>
      {type === "experiencia" ? (
        <fieldset>
          <legend className="mb-2 text-sm text-ink/70">¿Se lo recomendarías a una amiga?</legend>
          <div className="flex gap-2">
            {[
              ["si", "Sí"],
              ["no", "No"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRecommend(value)}
                className={`rounded-full px-4 py-2 text-sm ${recommend === value ? "bg-sage text-paper" : "bg-mist"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
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
          <input
            name="cadastralRef"
            defaultValue={defaultRef}
            className="field-input font-mono"
            placeholder="14 o 20 caracteres"
          />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-ink/50">
        La referencia sale en la ficha de Rentaly o en el recibo del IBI. Si no la tienes, basta el barrio y la calle.
      </p>
      <Field label="Calle o entorno">
        <input name="addressLabel" defaultValue={defaultAddress} className="field-input" placeholder="Calle y portal, o zona" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CIF de la gestora o SOCIMI (opcional)">
          <input name="managerTaxId" className="field-input font-mono" placeholder="A28000000 · nunca un DNI" />
        </Field>
        <Field label="Razón social">
          <input name="managerLegalName" className="field-input" placeholder="Solo persona jurídica" />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-ink/50">
        CIF es el identificador de una empresa (empieza por letra). Nunca un DNI. La razón social es el nombre de esa
        sociedad, no el de un particular.
      </p>
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
      <p className="text-xs leading-5 text-ink/55">
        No publiques DNI, cuentas bancarias ni el nombre de menores. No subas notas simples: si conoces la gestora,
        basta el CIF y la razón social. Si hay delito o riesgo, 112.
      </p>
      <EvidenceCrop onChange={setEvidenceJpegBase64} />
      {error ? <p className="text-sm text-wine">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary">
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
