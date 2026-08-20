"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BARRIOS, districts } from "@/lib/barrios-data";
import type { Intent } from "@/lib/types";

const INTENTS: { id: Intent; title: string; body: string }[] = [
  {
    id: "buscar",
    title: "Estoy buscando piso",
    body: "Quiero contrastar un anuncio con el Catastro y ver si el barrio o la finca ya tienen avisos.",
  },
  {
    id: "alquilar",
    title: "Ya alquilo en Madrid",
    body: "Vivo o he vivido un contrato y puedo dejar memoria: lo que funcionó y lo que no.",
  },
  {
    id: "avisar",
    title: "Necesito avisar de un abuso",
    body: "Fianza extra, temporada fingida, entrada sin permiso, discriminación. Quiero dejar constancia.",
  },
];

export function OnboardingWizard({
  nickname,
  barrioId,
}: {
  nickname: string;
  barrioId?: string;
}) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [barrio, setBarrio] = useState(barrioId || "");
  const [name, setName] = useState(nickname);
  const [pact, setPact] = useState({ facts: false, noPii: false, notComplaint: false, madrid: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const groups = districts();
  const allPact = Object.values(pact).every(Boolean);

  async function finish() {
    if (!intent) return;
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent,
        barrioId: barrio || undefined,
        nickname: name,
        onboardingComplete: true,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se ha podido guardar.");
      setLoading(false);
      return;
    }
    if (next) {
      router.push(next);
    } else if (intent === "avisar") {
      router.push("/aportar?tipo=abuso");
    } else if (intent === "buscar") {
      router.push("/checklist");
    } else {
      const selected = BARRIOS.find((item) => item.id === barrio);
      router.push(selected ? `/barrios/${selected.slug}` : "/");
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="kicker">Paso {step + 1} de 4</p>
      <div className="mt-3 mb-8 flex gap-1">
        {[0, 1, 2, 3].map((item) => (
          <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-wine" : "bg-ink/10"}`} />
        ))}
      </div>

      {step === 0 ? (
        <>
          <h1 className="font-display text-4xl">¿En qué momento del alquiler estás?</h1>
          <p className="mt-3 text-ink/70">JustFix parte de una tarea, no de un feed. Nosotros igual: elige el trabajo que tienes ahora.</p>
          <div className="mt-6 space-y-3">
            {INTENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIntent(item.id)}
                className={`w-full rounded-3xl border px-5 py-4 text-left ${
                  intent === item.id ? "border-wine bg-wine text-paper" : "card hover:border-wine/40"
                }`}
              >
                <p className="font-display text-2xl">{item.title}</p>
                <p className={`mt-1 text-sm ${intent === item.id ? "text-paper/80" : "text-ink/65"}`}>{item.body}</p>
              </button>
            ))}
          </div>
          <button type="button" disabled={!intent} className="btn btn-primary mt-6" onClick={() => setStep(1)}>
            Continuar
          </button>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <h1 className="font-display text-4xl">¿Qué barrio te importa ahora?</h1>
          <p className="mt-3 text-ink/70">
            {intent === "buscar"
              ? "Donde estás mirando anuncios. Luego podrás cambiarlo."
              : "Donde vives o has vivido. La memoria se ancla al barrio municipal."}
          </p>
          <select value={barrio} onChange={(event) => setBarrio(event.target.value)} className="field-input mt-6">
            <option value="">Elegir más tarde</option>
            {groups.map((district) => (
              <optgroup key={district.id} label={`${district.id} · ${district.name}`}>
                {district.barrios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
              Atrás
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
              Continuar
            </button>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h1 className="font-display text-4xl">Cómo te leerán las demás</h1>
          <p className="mt-3 text-ink/70">El apodo es lo único público. El correo se queda en la cuenta.</p>
          <input value={name} onChange={(event) => setName(event.target.value)} className="field-input mt-6" maxLength={40} />
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              Atrás
            </button>
            <button type="button" disabled={name.trim().length < 2} className="btn btn-primary" onClick={() => setStep(3)}>
              Continuar
            </button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h1 className="font-display text-4xl">Pacto de la memoria</h1>
          <p className="mt-3 text-ink/70">Shelter recuerda que el tono importa cuando alguien está bajo estrés. Aquí el pacto es corto y claro.</p>
          <ul className="mt-6 space-y-3">
            {(
              [
                ["facts", "Escribo hechos: fechas, cantidades, qué pedían, cómo se resolvió."],
                ["noPii", "No publico DNI, cuentas, menores ni el nombre de terceras personas."],
                ["notComplaint", "Sé que un aviso en Rentaly no es una denuncia policial ni un juicio."],
                ["madrid", "Hablo de Madrid capital, no de otros municipios."],
              ] as const
            ).map(([key, label]) => (
              <li key={key}>
                <label className="card flex cursor-pointer items-start gap-3 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={pact[key]}
                    onChange={(event) => setPact((current) => ({ ...current, [key]: event.target.checked }))}
                    className="mt-1"
                  />
                  <span>{label}</span>
                </label>
              </li>
            ))}
          </ul>
          {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
              Atrás
            </button>
            <button type="button" disabled={!allPact || loading} className="btn btn-primary" onClick={finish}>
              {loading ? "Guardando…" : "Entrar a Rentaly"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
