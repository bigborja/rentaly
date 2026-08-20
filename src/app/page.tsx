import Link from "next/link";
import { SearchPanel } from "@/components/SearchPanel";
import { MadridMap } from "@/components/MadridMap";
import { ReportList } from "@/components/ReportList";
import { Steps } from "@/components/Guide";
import { CoachGuide } from "@/components/CoachGuide";
import { UiIcon, type Icon } from "@/components/UiIcon";
import { ListChecksIcon, MapTrifoldIcon, PencilSimpleIcon } from "@phosphor-icons/react/ssr";
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
      <section className="relative h-[min(82vh,780px)] min-h-[560px] w-full overflow-hidden">
        <MadridMap frame="bleed" chrome={false} className="absolute inset-0" statsByBarrio={stats.byBarrio} />
        <div className="pointer-events-none absolute right-4 top-4 z-10 space-y-1.5 rounded-2xl bg-paper/90 px-3 py-2 text-xs text-ink/75 shadow-float sm:right-8 sm:top-8">
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sage" />
            Memoria
          </p>
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-wine" />
            Abuso
          </p>
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between gap-6 px-4 pb-8 pt-8 sm:pt-12">
          <div className="pointer-events-none max-w-2xl">
            <p className="kicker">Madrid capital · inquilinas e inquilinos</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">Alquila con los ojos abiertos.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink/75 sm:text-lg">
              No listamos pisos. Contrastamos el Catastro, el barrio municipal y la memoria de quien ya firmó. Pulsa el
              mapa si conoces la ciudad; busca calle y número si tienes un anuncio.
            </p>
            {user ? (
              <p className="mt-4 text-sm text-sage">
                Hola, {user.nickname}
                {barrio ? (
                  <>
                    {" "}
                    · tu barrio es{" "}
                    <Link className="pointer-events-auto underline decoration-gold" href={`/barrios/${barrio.slug}`}>
                      {barrio.name}
                    </Link>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="mt-4 text-sm text-ink/55">
                Puedes explorar sin cuenta.{" "}
                <Link href="/registro" className="pointer-events-auto underline decoration-gold">
                  Crea una para publicar
                </Link>
                .
              </p>
            )}
          </div>
          <div className="pointer-events-auto mx-auto w-full max-w-2xl">
            <SearchPanel overlay />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <CoachGuide title="Si no sabes por dónde empezar">
          <Steps
            items={[
              {
                title: "Escribe calle y número, o pega la referencia catastral",
                body: "El Catastro te devolverá el portal: viviendas, locales, trasteros y los metros oficiales. Si el anuncio infla la superficie, esa cifra manda.",
              },
              {
                title: "O entra por el mapa",
                body: "Cada polígono es un barrio oficial. Si acercas (zoom de calle) o activas parcelas, un clic en el edificio abre una hoja con metros, VUT y memoria, sin saltar de página.",
              },
              {
                title: "Usa la lista antes de firmar o deja memoria si ya vives ahí",
                body: "Leer no pide cuenta. Publicar sí, con apodo en público y correo privado.",
              },
            ]}
          />
          <p>
            <Link href="/como-funciona" className="underline decoration-gold">
              Guía completa y glosario (Catastro, VUT, CIF)
            </Link>
          </p>
        </CoachGuide>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Job
            href="/checklist"
            kicker="Tarea"
            title="Antes de firmar"
            body="Lista corta: metros del Catastro, fianza, contrato de vivienda, honorarios."
            icon={ListChecksIcon}
          />
          <Job
            href="/barrios"
            kicker="Mapa"
            title="131 barrios"
            body="Si conoces Madrid, entra por el plano. Si conoces el nombre, por la lista."
            icon={MapTrifoldIcon}
          />
          <Job
            href={user ? "/aportar" : "/registro?next=/aportar"}
            kicker="Comunidad"
            title="Deja rastro"
            body="Experiencia, incidente o aviso de abuso. Apodo en público, correo privado."
            icon={PencilSimpleIcon}
          />
        </div>
        <dl className="mt-8 grid gap-3 sm:grid-cols-4">
          <HeroStat label="Barrios" value={String(BARRIOS.length)} />
          <HeroStat label="Aportes" value={String(stats.total)} />
          <HeroStat label="Avisos de abuso" value={String(stats.abuso)} />
          <HeroStat label="Distritos" value="21" />
        </dl>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-3xl">Última memoria vecinal</h2>
          <p className="mb-5 mt-2 text-sm text-ink/60">
            Experiencias de un alquiler, incidentes de finca y avisos de abuso. Un solo texto no basta; un patrón en el
            mismo portal sí es una señal.
          </p>
          <ReportList reports={latest} />
        </div>
        <aside className="space-y-4">
          <article className="texture-ink rounded-3xl p-6 text-paper shadow-lift">
            <h3 className="font-display text-2xl text-gold">Si hay abuso ahora</h3>
            <p className="mt-3 text-sm leading-6 text-paper/80">
              El rojo se reserva para esto. Documenta, deja aviso, y si hay delito o riesgo usa 112.
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
              La ficha sale de los servicios libres del Catastro: uso, superficie, antigüedad y unidades. Si el portal
              infla metros o vende un local como piso, esa cifra es el ancla.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

function Job({
  href,
  kicker,
  title,
  body,
  icon,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
  icon: Icon;
}) {
  return (
    <Link href={href} className="card block p-5 transition hover:border-wine/40 hover:shadow-lift">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold">
        <UiIcon icon={icon} size="sm" className="text-gold" />
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{body}</p>
    </Link>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/50 px-4 py-3 shadow-rest">
      <dt className="text-xs uppercase tracking-[0.16em] text-ink/50">{label}</dt>
      <dd className="font-display text-3xl">{value}</dd>
    </div>
  );
}
