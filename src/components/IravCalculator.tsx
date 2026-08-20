"use client";

import { useMemo, useState } from "react";
import { applyIrav, type IravPoint } from "@/lib/irav";
import { IRAV_CALCULATOR, IRAV_CONTRACT_CUTOFF, IRAV_INE_TABLE } from "@/lib/official";
import { formatEuros } from "@/lib/format";

export function IravCalculator({ latest }: { latest: IravPoint | null }) {
  const [rent, setRent] = useState("");
  const [rate, setRate] = useState(latest ? String(latest.ratePercent) : "");
  const parsedRent = Number(rent.replace(",", "."));
  const parsedRate = Number(rate.replace(",", "."));
  const result = useMemo(() => applyIrav(parsedRent, parsedRate), [parsedRent, parsedRate]);

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-ink/70">Renta actual €/mes</span>
          <input
            inputMode="decimal"
            value={rent}
            onChange={(event) => setRent(event.target.value)}
            className="field-input"
            placeholder="1200"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/70">IRAV oficial %</span>
          <input
            inputMode="decimal"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="field-input"
            placeholder={latest ? String(latest.ratePercent) : "el del INE"}
          />
        </label>
      </div>
      {result ? (
        <p className="rounded-2xl bg-mist/80 px-4 py-3 text-sm">
          Techo ilustrativo con ese porcentaje: <strong>{formatEuros(result.next)}</strong> (
          {result.delta >= 0 ? "+" : ""}
          {formatEuros(result.delta)}). Verifica el mes en el INE y en tu cláusula.
        </p>
      ) : (
        <p className="text-xs text-ink/50">Escribe la renta y el porcentaje del mes que toca revisar.</p>
      )}
      <p className="text-xs leading-5 text-ink/50">
        Solo aplica si el contrato de vivienda habitual es posterior al {IRAV_CONTRACT_CUTOFF.replaceAll("-", "/")} y
        hay cláusula de revisión. Los anteriores se rigen por lo pactado (a menudo IPC).{" "}
        <a className="underline decoration-gold" href={IRAV_INE_TABLE} target="_blank" rel="noreferrer">
          Tabla INE
        </a>
        {" · "}
        <a className="underline decoration-gold" href={IRAV_CALCULATOR} target="_blank" rel="noreferrer">
          Calculadora MIVAU
        </a>
        .
      </p>
    </div>
  );
}
