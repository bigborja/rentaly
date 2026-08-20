import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";
import { getBarrio } from "@/lib/barrios-data";

export const metadata: Metadata = { title: "Aportar experiencia o aviso" };

export default async function AportarPage({
  searchParams,
}: {
  searchParams: Promise<{ barrio?: string; ref?: string; address?: string }>;
}) {
  const params = await searchParams;
  const barrio = params.barrio ? getBarrio(params.barrio) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-wine">Memoria colectiva</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Deja rastro para quien venga detrás</h1>
      <p className="mt-4 text-ink/75 leading-7">
        Experiencias de un alquiler razonable, incidentes de finca y avisos de abuso. El objetivo no es linchar a nadie:
        es que el siguiente contrato se negocie con información. Si hay delito, denuncia también en el canal oficial.
      </p>
      {barrio ? (
        <p className="mt-3 text-sm text-sage">
          Vas a publicar en {barrio.name} ({barrio.district}).
        </p>
      ) : null}
      <div className="mt-8">
        <ReportForm defaultBarrioId={barrio?.id || params.barrio} defaultRef={params.ref} defaultAddress={params.address} />
      </div>
    </div>
  );
}
