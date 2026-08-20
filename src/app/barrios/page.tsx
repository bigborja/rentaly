import Link from "next/link";
import type { Metadata } from "next";
import { districts } from "@/lib/barrios-data";
import { reportStats } from "@/lib/reports";
import { Steps } from "@/components/Guide";
import { CoachGuide } from "@/components/CoachGuide";
import { MadridMap } from "@/components/MadridMap";

export const metadata: Metadata = { title: "Barrios de Madrid" };
export const dynamic = "force-dynamic";

export default async function BarriosPage() {
  const stats = await reportStats();
  const groups = districts();

  return (
    <div>
      <section className="relative h-[min(70vh,640px)] min-h-[480px] w-full overflow-hidden">
        <MadridMap
          frame="bleed"
          className="absolute inset-0"
          statsByBarrio={stats.byBarrio}
          hint="Si conoces la geografía de Madrid pero no el nombre del barrio, pulsa en el mapa. Cada polígono es un barrio oficial del Ayuntamiento."
        />
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="kicker">21 distritos · 131 barrios</p>
        <h1 className="mt-2 font-display text-4xl sm:text-6xl">Encuéntralo en el plano</h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          Son los barrios oficiales del Ayuntamiento de Madrid, no zonas de portales inmobiliarios. Arriba, el mapa: si
          sabes dónde queda Lavapiés o el Pilar, entra pulsando. Abajo, la lista por distrito si buscas por nombre.
        </p>
        <div className="mt-6 max-w-2xl">
          <CoachGuide title="Cómo orientarte">
            <Steps
              items={[
                {
                  title: "Por geografía",
                  body: "Pulsa el polígono en el mapa. El verde se oscurece donde hay más relatos; el vino marca avisos de abuso.",
                },
                {
                  title: "Por nombre",
                  body: "Están agrupados como en el callejero municipal. El código (por ejemplo 011) es el identificador oficial, no un ranking.",
                },
                {
                  title: "Dentro, busca calle y número",
                  body: "La ficha del inmueble cruza Catastro y memoria. También puedes aportar desde el propio barrio.",
                },
              ]}
            />
          </CoachGuide>
        </div>
        <div className="mt-10 space-y-10">
          {groups.map((district) => (
            <section key={district.id} id={`distrito-${district.id}`}>
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
                        className="card block px-4 py-3 transition hover:border-wine/40 hover:shadow-lift"
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
    </div>
  );
}
