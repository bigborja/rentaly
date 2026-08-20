"use client";

import Link from "next/link";
import { ABUSE_LABELS, REPORT_TYPE_LABELS, formatDate } from "@/lib/format";
import type { Report } from "@/lib/types";
import { getBarrio } from "@/lib/barrios-data";

export function ReportList({ reports }: { reports: Report[] }) {
  if (!reports.length) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 bg-white/40 px-6 py-10 text-center">
        <p className="font-display text-xl">Aún no hay memoria vecinal aquí</p>
        <p className="mt-2 text-sm text-ink/60">
          Nadie ha publicado todavía una experiencia, un incidente o un aviso de abuso en este sitio. Si has alquilado
          aquí, un relato con fechas y cantidades ayuda a quien venga detrás. Hace falta cuenta; en público solo se ve el
          apodo.
        </p>
        <Link href="/aportar" className="mt-4 inline-flex rounded-full bg-wine px-4 py-2 text-sm text-paper">
          Aportar
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reports.map((report) => {
        const barrio = report.barrioId ? getBarrio(report.barrioId) : undefined;
        return (
        <li key={report.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em]">
              <span
                className={`rounded-full px-2 py-1 ${
                  report.type === "abuso"
                    ? "bg-wine text-paper"
                    : report.type === "incidente"
                      ? "bg-gold/30 text-ink"
                      : "bg-sage/15 text-sage"
                }`}
              >
                {REPORT_TYPE_LABELS[report.type]}
              </span>
              {report.abuseCategory ? <span className="text-wine">{ABUSE_LABELS[report.abuseCategory]}</span> : null}
              {report.severity ? <span className="text-ink/50">gravedad {report.severity}</span> : null}
            </div>
            <h3 className="mt-3 font-display text-2xl leading-tight">{report.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/80">{report.body}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50">
              <span>{report.author}</span>
              <span>{formatDate(report.createdAt)}</span>
              {barrio ? (
                <Link className="underline decoration-gold" href={`/barrios/${barrio.slug}`}>
                  {barrio.name}
                </Link>
              ) : null}
              {report.addressLabel ? <span>{report.addressLabel}</span> : null}
              {report.rentEuros ? <span>{report.rentEuros} €/mes</span> : null}
              {report.rating ? <span>{"★".repeat(report.rating)}</span> : null}
              {report.recommend === true ? <span>Lo recomendaría</span> : null}
              {report.recommend === false ? <span>No lo recomendaría</span> : null}
              {report.cadastralRef ? (
                <Link className="font-mono underline" href={`/inmueble/${report.cadastralRef}`}>
                  {report.cadastralRef}
                </Link>
              ) : null}
              {report.trustBand ? (
                <span>
                  {report.trustBand === "alto"
                    ? "confianza alta (recorte de prueba)"
                    : report.trustBand === "medio"
                      ? "confianza media (cuenta)"
                      : "confianza baja"}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
