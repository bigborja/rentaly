import Link from "next/link";
import type { Metadata } from "next";
import { districts } from "@/lib/barrios-data";
import { reportStats } from "@/lib/reports";

export const metadata: Metadata = { title: "Barrios de Madrid" };
export const dynamic = "force-dynamic";

export default async function BarriosPage() {
  const stats = await reportStats();
  const groups = districts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl sm:text-5xl">131 barrios, 21 distritos</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Delimitación oficial del Ayuntamiento de Madrid. Entra en un barrio para ver su mapa, los aportes de inquilinos
        y buscar fincas del Catastro en esa zona.
      </p>
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
                        {count} aportes{abuso ? ` · ${abuso} abusos` : ""}
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
