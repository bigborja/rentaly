import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/ReportForm";
import { getBarrio } from "@/lib/barrios-data";
import { getCurrentUser } from "@/lib/auth";
import type { ReportType } from "@/lib/types";

export const metadata: Metadata = { title: "Aportar experiencia o aviso" };
export const dynamic = "force-dynamic";

export default async function AportarPage({
  searchParams,
}: {
  searchParams: Promise<{ barrio?: string; ref?: string; address?: string; tipo?: string }>;
}) {
  const params = await searchParams;
  const barrio = params.barrio ? getBarrio(params.barrio) : undefined;
  const user = await getCurrentUser();
  const tipo = ["experiencia", "incidente", "abuso"].includes(params.tipo || "")
    ? (params.tipo as ReportType)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="kicker">Memoria colectiva</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Deja rastro para quien venga detrás</h1>
      <p className="mt-4 text-ink/75 leading-7">
        Experiencias de un alquiler razonable, incidentes de finca y avisos de abuso. El objetivo no es linchar: es que
        el siguiente contrato se negocie con información.
      </p>
      {barrio ? (
        <p className="mt-3 text-sm text-sage">
          Vas a publicar en {barrio.name} ({barrio.district}).
        </p>
      ) : null}
      {!user ? (
        <div className="card mt-6 bg-ink p-5 text-paper">
          <p className="font-display text-2xl text-gold">Primero una cuenta</p>
          <p className="mt-2 text-sm leading-6 text-paper/75">
            Como en Reviu: el relato se lee con apodo. El correo queda en la cuenta por si hay que verificar un hecho.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/registro?next=/aportar" className="btn btn-primary">
              Crear cuenta
            </Link>
            <Link href="/entrar?next=/aportar" className="btn btn-gold">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <ReportForm
            defaultBarrioId={barrio?.id || user.barrioId || params.barrio}
            defaultRef={params.ref}
            defaultAddress={params.address}
            defaultType={tipo}
            nickname={user.nickname}
          />
        </div>
      )}
    </div>
  );
}
