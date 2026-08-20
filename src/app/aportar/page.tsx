import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/ReportForm";
import { Guide, Steps } from "@/components/Guide";
import { NotebookMark } from "@/components/illustrations";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="kicker">Memoria colectiva</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Deja rastro para quien venga detrás</h1>
        </div>
        <NotebookMark className="hidden w-28 shrink-0 text-ink sm:block" />
      </div>
      <p className="mt-4 text-ink/75 leading-7">
        Experiencias de un alquiler razonable, incidentes de finca y avisos de abuso. El objetivo no es linchar: es que
        quien mire el mismo portal o el mismo barrio no negocie a ciegas. En público solo se ve tu apodo.
      </p>
      <div className="mt-6">
        <Guide title="Cómo escribir para que sirva">
          <Steps
            items={[
              {
                title: "Elige el tipo",
                body: "Experiencia: cómo fue el contrato (renta, trato, si lo recomendarías). Incidente: algo del edificio o de la gestión (humedad, calefacción, portería). Abuso: fianza irregular, honorarios indebidos, entrada sin permiso, discriminación u otra irregularidad.",
              },
              {
                title: "Cuenta hechos",
                body: "Fechas, cantidades, qué pedían y cómo se resolvió. Sin nombres de terceras personas, sin DNI y sin cuentas bancarias.",
              },
              {
                title: "Ancla el relato si puedes",
                body: "Barrio, calle o referencia catastral. Un CIF de la gestora (nunca un DNI) ayuda a quien busque la misma entidad. Si hay delito o riesgo, 112 además de este aviso.",
              },
            ]}
          />
        </Guide>
      </div>
      {barrio ? (
        <p className="mt-3 text-sm text-sage">
          Vas a publicar en {barrio.name} ({barrio.district}).
        </p>
      ) : null}
      {!user ? (
        <div className="card mt-6 bg-ink p-5 text-paper">
          <p className="font-display text-2xl text-gold">Primero una cuenta</p>
          <p className="mt-2 text-sm leading-6 text-paper/75">
            El relato se lee con apodo. El correo queda en la cuenta por si hay que verificar un hecho, y no se publica
            junto al aviso. Leer el mapa y las fichas no pide registro; publicar sí.
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
