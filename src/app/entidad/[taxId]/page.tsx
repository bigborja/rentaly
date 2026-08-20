import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { portfolioForTaxId } from "@/lib/ownership-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ taxId: string }> }): Promise<Metadata> {
  const { taxId } = await params;
  return { title: `Entidad ${taxId.toUpperCase()}` };
}

export default async function EntidadPage({ params }: { params: Promise<{ taxId: string }> }) {
  const { taxId } = await params;
  let portfolio;
  try {
    portfolio = await portfolioForTaxId(taxId);
  } catch {
    notFound();
  }
  if (!portfolio) notFound();

  const { entity, claims } = portfolio;
  const parcels = [...new Set(claims.map((claim) => claim.parcelRef))];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-wine">Persona jurídica</p>
      <h1 className="mt-2 font-display text-4xl">{entity.legalName}</h1>
      <p className="mt-2 font-mono text-sm text-ink/60">{entity.taxId}</p>
      <p className="mt-2 text-sm text-ink/65">
        {entity.kind.toUpperCase()} · {parcels.length} finca{parcels.length === 1 ? "" : "s"} aportadas por la comunidad
        o por fuentes públicas. El Catastro no identifica a personas físicas.
      </p>
      {entity.kind === "socimi" || entity.kind === "fondo" ? (
        <p className="mt-3 rounded-2xl bg-wine/10 px-4 py-3 text-sm">
          Candidata a gran tenedor por forma jurídica, no por un censo de viviendas oficiales.
        </p>
      ) : null}
      <ul className="mt-8 space-y-3">
        {claims.map((claim) => (
          <li key={claim.id} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
            <Link className="font-mono text-sm underline decoration-gold" href={`/inmueble/${claim.parcelRef}`}>
              {claim.parcelRef}
            </Link>
            <p className="text-xs text-ink/55">
              {claim.source} · confianza {claim.confidence}
              {claim.sourceUrl ? (
                <>
                  {" · "}
                  <a href={claim.sourceUrl} className="underline" target="_blank" rel="noreferrer">
                    fuente
                  </a>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
