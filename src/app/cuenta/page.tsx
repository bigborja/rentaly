import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBarrio } from "@/lib/barrios-data";
import { listReports } from "@/lib/reports";
import { ReportList } from "@/components/ReportList";
import { Guide } from "@/components/Guide";
import { NotebookMark } from "@/components/illustrations";

export const metadata: Metadata = { title: "Tu cuenta" };
export const dynamic = "force-dynamic";

const INTENT_LABEL: Record<string, string> = {
  buscar: "Estás buscando piso",
  alquilar: "Ya alquilas o has alquilado",
  avisar: "Viniste a dejar un aviso",
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/cuenta");
  if (!user.onboardingComplete) redirect("/onboarding");

  const barrio = user.barrioId ? getBarrio(user.barrioId) : undefined;
  const mine = await listReports({ userId: user.id });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="kicker">Cuenta</p>
          <h1 className="mt-2 font-display text-5xl">{user.nickname}</h1>
          <p className="mt-3 text-ink/65">{user.email} · el correo no se publica junto a tus avisos</p>
        </div>
        <NotebookMark className="hidden w-28 shrink-0 text-ink sm:block" />
      </div>

      <div className="mt-6">
        <Guide title="Para qué sirve esta cuenta">
          <p>
            El apodo es lo único que se lee en la memoria vecinal. El correo queda aquí por si hay que verificar un
            relato. El barrio y el momento (buscando piso, ya alquilando, o avisando) sirven para llevarte a la tarea
            adecuada; puedes cambiarlos cuando quieras.
          </p>
        </Guide>
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="card px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">Momento</dt>
          <dd className="mt-1 font-display text-2xl">{user.intent ? INTENT_LABEL[user.intent] : "Sin elegir"}</dd>
        </div>
        <div className="card px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">Barrio</dt>
          <dd className="mt-1 font-display text-2xl">
            {barrio ? (
              <Link className="underline decoration-gold" href={`/barrios/${barrio.slug}`}>
                {barrio.name}
              </Link>
            ) : (
              "Sin anclar"
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/checklist" className="btn btn-ink">
          Antes de firmar
        </Link>
        <Link href="/aportar" className="btn btn-primary">
          Dejar memoria
        </Link>
        <Link href="/onboarding" className="btn btn-ghost">
          Cambiar el recorte
        </Link>
      </div>

      <h2 className="mt-12 font-display text-3xl">Lo que has publicado</h2>
      <p className="mb-5 mt-2 text-sm text-ink/60">
        En público se ve el apodo, no este correo. Si un texto ya no debería estar, contacta a quien mantiene el
        repositorio (aviso legal).
      </p>
      <ReportList reports={mine} />
    </div>
  );
}
