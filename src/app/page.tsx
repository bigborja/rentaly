import Link from "next/link";
import { SearchPanel } from "@/components/SearchPanel";
import { MadridMap } from "@/components/MadridMap";
import { ReportList } from "@/components/ReportList";
import { Guide, Steps } from "@/components/Guide";
import { reportStats, listReports } from "@/lib/reports";
import { BARRIOS } from "@/lib/barrios-data";
import { getCurrentUser } from "@/lib/auth";
import { getBarrio } from "@/lib/barrios-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await reportStats();
  const latest = (await listReports()).slice(0, 3);
  const user = await getCurrentUser();
  const barrio = user?.barrioId ? getBarrio(user.barrioId) : undefined;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10">
        <p className="kicker">Madrid capital · inquilinas e inquilinos</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
          Alquila con los ojos abiertos.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-ink/75">
          No listamos pisos. Contrastamos el Catastro (metros, uso, unidades), el barrio municipal y la memoria de quien
          ya firmó, para que el siguiente contrato en Madrid capital no se negocie a ciegas.
        </p>
        {user ? (
          <p className="mt-4 text-sm text-sage">
            Hola, {user.nickname}
            {barrio ? (
              <>
                {" "}
                · tu barrio es{" "}
                <Link className="underline decoration-gold" href={`/barrios/${barrio.slug}`}>
                  {barrio.name}
                </Link>
              </>
            ) : null}
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink/55">
            Puedes explorar sin cuenta.{" "}
            <Link href="/registro" className="underline decoration-gold">
              Crea una para publicar
            </Link>
            .
          </p>
        )}
        <div className="mt-8">
          <SearchPanel />
        </div>
        <div className="mt-8">
          <Guide title="Si no sabes por dónde empezar">
            <Steps
              items={[
                {
                  title: "Escribe calle y número, o pega la referencia catastral",
                  body: "El Catastro te devolverá el portal: viviendas, locales, trasteros y los metros oficiales. Si el anuncio infla la superficie, esa cifra manda.",
                },
                {
                  title: "Entra en el barrio o en la ficha",
                  body: "Ahí verás avisos de otras inquilinas, si hay viviendas turísticas en la parcela y un enlace para consultar la inspección del edificio.",
                },
                {
                  title: "Usa la lista antes de firmar o deja memoria si ya vives ahí",
                  body: "Leer no pide cuenta. Publicar sí, con apodo en público y correo privado.",
                },
              ]}
            />
            <p className="pt-1">
              <Link href="/como-funciona" className="underline decoration-gold">
                Guía completa y glosario (Catastro, VUT, CIF)
              </Link>
            </p>
          </Guide>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Job
            href="/checklist"
            kicker="Tarea"
            title="Antes de firmar"
            body="Lista corta: metros del Catastro, fianza, contrato de vivienda, honorarios."
          />
          <Job
            href="/barrios"
            kicker="Mapa"
            title="Memoria del barrio"
            body={`${BARRIOS.length} barrios oficiales. Experiencias, incidentes y avisos.`}
          />
          <Job
            href={user ? "/aportar" : "/registro?next=/aportar"}
            kicker="Comunidad"
            title="Deja rastro"
            body="Experiencia, incidente o aviso de abuso. Apodo en público, correo privado. Leer no pide cuenta."
          />
        </div>
        <dl className="mt-8 grid gap-3 sm:grid-cols-4">
          <HeroStat label="Barrios" value={String(BARRIOS.length)} />
          <HeroStat label="Aportes" value={String(stats.total)} />
          <HeroStat label="Avisos de abuso" value={String(stats.abuso)} />
          <HeroStat label="Distritos" value="21" />
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl">Mapa de Madrid</h2>
            <p className="text-sm text-ink/60">
              Cada polígono es un barrio oficial. El verde se oscurece donde hay más relatos; el vino marca avisos de
              abuso. Pulsa un barrio para entrar. El botón inferior activa las parcelas del Catastro: entonces un clic
              abre la ficha de esa finca.
            </p>
          </div>
          <Link href="/como-funciona" className="text-sm underline decoration-gold">
            Cómo está pensado
          </Link>
        </div>
        <MadridMap statsByBarrio={stats.byBarrio} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-3xl">Última memoria vecinal</h2>
          <p className="mb-5 mt-2 text-sm text-ink/60">
            Experiencias de un alquiler, incidentes de finca y avisos de abuso. Son relatos de la comunidad, no
            sentencias ni titularidad. Un solo texto no basta; un patrón en el mismo portal sí es una señal.
          </p>
          <ReportList reports={latest} />
        </div>
        <aside className="space-y-4">
          <article className="rounded-3xl bg-ink p-6 text-paper">
            <h3 className="font-display text-2xl text-gold">Si hay abuso ahora</h3>
            <p className="mt-3 text-sm leading-6 text-paper/80">
              El rojo se reserva para esto. Documenta, deja aviso, y si hay delito o riesgo usa 112. El Sindicato de
              Inquilinas recorre el resto del camino colectivo.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/aportar?tipo=abuso" className="btn btn-primary">
                Dejar aviso
              </Link>
              <Link href="/derechos" className="btn btn-gold">
                Derechos y 112
              </Link>
            </div>
          </article>
          <article className="card p-6">
            <h3 className="font-display text-2xl">Datos oficiales, no de portales</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              La ficha sale de los servicios libres del Catastro: uso, superficie, antigüedad y unidades. No es un
              anuncio ni un tasador. Si el portal infla metros o vende un local como piso, esa cifra es el ancla.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

function Job({ href, kicker, title, body }: { href: string; kicker: string; title: string; body: string }) {
  return (
    <Link href={href} className="card block p-5 transition hover:border-wine/40">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">{kicker}</p>
      <h2 className="mt-2 font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{body}</p>
    </Link>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/50 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-ink/50">{label}</dt>
      <dd className="font-display text-3xl">{value}</dd>
    </div>
  );
}
