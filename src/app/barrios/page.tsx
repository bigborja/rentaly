import Link from "next/link";
import type { Metadata } from "next";
import { districts } from "@/lib/barrios-data";
import { reportStats } from "@/lib/reports";
import { Guide, Steps } from "@/components/Guide";

export const metadata: Metadata = { title: "Barrios de Madrid" };
export const dynamic = "force-dynamic";

export default async function BarriosPage() {
  const stats = await reportStats();
  const groups = districts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl sm:text-5xl">131 barrios, 21 distritos</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Son los barrios oficiales del Ayuntamiento de Madrid, no zonas de portales inmobiliarios. El número de aportes
        cuenta relatos de la comunidad (experiencias, incidentes y avisos). Entra en uno para ver el mapa, buscar un
        portal del Catastro y leer la memoria de esa zona.
      </p>
      <div className="mt-6 max-w-2xl">
        <Guide title="Cómo leer esta lista">
          <Steps
            items={[
              {
                title: "Elige distrito y barrio",
                body: "Están agrupados como en el callejero municipal. El código (por ejemplo 011) es el identificador oficial, no un ranking.",
              },
              {
                title: "Mira cuántos aportes hay",
                body: "Cero no significa que no haya problemas: a menudo significa que nadie ha escrito todavía. Un aviso de abuso se marca aparte.",
              },
              {
                title: "Dentro podrás buscar calle y número",
                body: "La ficha del inmueble cruza Catastro y memoria. También puedes aportar desde el propio barrio.",
              },
            ]}
          />
        </Guide>
      </div>
      <div className="mt-10 space-y-10">
        {groups.map((district) => (
          <section key={district.id}>
            <h2 className="font-display text-2xl">
              {district.id} · {district.name}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {district.barrios.map((barrio) => {
                const count = stats.byBarrio[barrio.id]?.total || 0;
                const abuso = stats.byBarrio[barrio.id]?.abuso || 0;
                return (
                  <li key={barrio.id}>
                    <Link
                      href={`/barrios/${barrio.slug}`}
                      className="block rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 transition hover:border-wine/40 hover:bg-white"
                    >
                      <p className="font-medium">{barrio.name}</p>
                      <p className="text-xs text-ink/50">
                        {count === 0
                          ? "Aún sin memoria vecinal"
                          : `${count} aporte${count === 1 ? "" : "s"}${abuso ? ` · ${abuso} aviso${abuso === 1 ? "" : "s"} de abuso` : ""}`}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
