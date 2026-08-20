import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assertLegalPersonTaxId } from "@/domain/ownership";
import { portfolioForTaxId } from "@/lib/ownership-store";
import { listReports } from "@/lib/reports";
import { ReportList } from "@/components/ReportList";
import { Guide } from "@/components/Guide";
import { UiIcon } from "@/components/UiIcon";
import { BuildingsIcon } from "@phosphor-icons/react/ssr";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ taxId: string }> }): Promise<Metadata> {
  const { taxId } = await params;
  return { title: `Gestora ${taxId.toUpperCase()}` };
}

export default async function GestoraPage({ params }: { params: Promise<{ taxId: string }> }) {
  const { taxId: raw } = await params;
  let taxId: string;
  try {
    taxId = assertLegalPersonTaxId(raw);
  } catch {
    notFound();
  }

  const reports = await listReports({ managerTaxId: taxId });
  const portfolio = await portfolioForTaxId(taxId).catch(() => null);
  const name =
    reports.find((report) => report.managerLegalName)?.managerLegalName || portfolio?.entity.legalName || taxId;
  const parcels = portfolio ? [...new Set(portfolio.claims.map((claim) => claim.parcelRef))] : [];
  const abuso = reports.filter((report) => report.type === "abuso").length;

  if (!reports.length && !portfolio) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wine">
          <UiIcon icon={BuildingsIcon} size="sm" className="text-wine" />
          Persona jurídica
        </p>
        <h1 className="mt-2 font-display text-4xl">{taxId}</h1>
        <p className="mt-3 text-sm text-ink/65">
          Nadie ha publicado todavía una experiencia con este CIF ni lo ha vinculado a una finca. Si alquilaste con esa
          gestora, el relato (sin DNI ni nombres de particulares) es lo que abre la ficha.
        </p>
        <Link href="/aportar" className="btn btn-primary mt-6">
          Aportar memoria
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wine">
        <UiIcon icon={BuildingsIcon} size="sm" className="text-wine" />
        Gestora o entidad que intermedia
      </p>
      <h1 className="mt-2 font-display text-4xl">{name}</h1>
      <p className="mt-2 font-mono text-sm text-ink/60">{taxId}</p>
      <p className="mt-2 text-sm text-ink/65">
        Relatos donde alguien indicó este CIF como gestora, SOCIMI o administradora del alquiler. No es un ranking ni
        una nota: es la misma memoria vecinal, agrupada. El Catastro no identifica a personas físicas.
      </p>
      <div className="mt-6">
        <Guide kicker="Cómo leer una gestora" title="Patrón, no una sola frase">
          <p>
            Reviu (Catalunya) filtra por inmobiliaria; aquí el ancla es el CIF. Varios avisos sobre honorarios o
            cláusulas pesan más que un comentario suelto. La cartera de parcelas, si existe, está en la ficha de
            entidad: otro recorte (fincas), no otro casero particular.
          </p>
        </Guide>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <Mini label="Relatos" value={String(reports.length)} />
        <Mini label="Avisos de abuso" value={String(abuso)} />
        <Mini label="Fincas con este CIF" value={String(parcels.length)} />
      </dl>
      {portfolio ? (
        <p className="mt-4 text-sm">
          Hay parcelas vinculadas a este identificador.{" "}
          <Link className="underline decoration-gold" href={`/entidad/${taxId}`}>
            Ver cartera de entidad
          </Link>
          .
        </p>
      ) : null}
      <h2 className="mt-12 font-display text-3xl">Memoria sobre esta gestora</h2>
      <p className="mb-5 mt-2 text-sm text-ink/60">
        Solo se ve el apodo de quien escribe. Si reconoces un contrato, contrasta metros en la finca y pide el papel por
        escrito.
      </p>
      <ReportList reports={reports} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 shadow-rest">
      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</dt>
      <dd className="font-display text-2xl">{value}</dd>
    </div>
  );
}
