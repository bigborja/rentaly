import Link from "next/link";
import { MadridMap } from "@/components/MadridMap";
import { ReportList } from "@/components/ReportList";
import { WelcomeSearch } from "@/components/WelcomeSearch";
import { FaqList } from "@/components/FaqList";
import { MadridCornice } from "@/components/illustrations";
import { UiIcon, type Icon } from "@/components/UiIcon";
import {
  BuildingsIcon,
  ChatTeardropTextIcon,
  ListChecksIcon,
  MapTrifoldIcon,
  PencilSimpleIcon,
  RulerIcon,
} from "@phosphor-icons/react/ssr";
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
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:pt-12">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="animate-rise">
            <p className="kicker">Madrid capital · inquilinas e inquilinos</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.02] sm:text-6xl">
              Alquila con los ojos abiertos.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-ink/75">
              Pega la calle del anuncio. Te devolvemos los metros oficiales del Catastro, el barrio y si alguien ya dejó
              memoria. No listamos pisos ni cobramos comisión.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#buscar" className="btn btn-primary">
                Contrastar un anuncio
              </a>
              <a href="#mapa" className="btn btn-ghost">
                Ver el mapa
              </a>
              <Link href="/checklist" className="btn btn-ghost">
                Antes de firmar
              </Link>
              <a href="#preguntas" className="inline-flex items-center text-sm text-ink/55 underline decoration-gold">
                Preguntas frecuentes
              </a>
            </div>
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
                Explorar no pide cuenta.{" "}
                <Link href="/registro" className="underline decoration-gold">
                  Crea una para publicar
                </Link>
                .
              </p>
            )}
          </div>
          <MadridCornice className="hidden w-full text-ink lg:block" />
        </div>
      </section>

      <section id="buscar" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-6">
        <WelcomeSearch />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <p className="kicker">En tres gestos</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">Qué ganas al abrir Rentaly</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Benefit
            n="1"
            icon={RulerIcon}
            title="Contrasta el anuncio"
            body="Metros, uso y unidades del Catastro. Si el portal infla la superficie o vende un local como piso, esa cifra manda."
          />
          <Benefit
            n="2"
            icon={ChatTeardropTextIcon}
            title="Lee quién ya firmó"
            body="Memoria del barrio y de la gestora (CIF). Un relato no es una sentencia; un patrón en el mismo portal sí es una señal."
          />
          <Benefit
            n="3"
            icon={PencilSimpleIcon}
            title="Firma o deja rastro"
            body="Lista corta antes de firmar. Si ya vives el contrato, un aviso con apodo ayuda a quien viene detrás."
          />
        </div>
        <p className="mt-4 text-sm text-ink/55">
          <Link href="/como-funciona" className="underline decoration-gold">
            Cómo funciona y glosario
          </Link>
          {" · "}
          Catastro, VUT, SERPAVI, IRAV, CIF.
        </p>
      </section>

      <section id="mapa" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Mapa vivo</p>
            <h2 className="mt-2 font-display text-3xl">Pulsa un barrio de Madrid</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              {BARRIOS.length} barrios oficiales. El verde se oscurece donde hay más relatos; el vino marca avisos de
              abuso. Si quieres un portal concreto, activa parcelas del Catastro: un clic abre la hoja.
            </p>
          </div>
          <Link href="/barrios" className="text-sm underline decoration-gold">
            Lista de barrios
          </Link>
        </div>
        <MadridMap statsByBarrio={stats.byBarrio} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Job
            href="/checklist"
            kicker="Tarea"
            title="Antes de firmar"
            body="Metros, fianza, contrato de vivienda, honorarios."
            icon={ListChecksIcon}
          />
          <Job
            href="/gestoras"
            kicker="Directorio"
            title="Gestoras"
            body="CIF o razón social. Memoria vecinal y RAIN. Nunca un particular."
            icon={BuildingsIcon}
          />
          <Job
            href="/barrios"
            kicker="Mapa"
            title="131 barrios"
            body="Si conoces el nombre, entra por la lista."
            icon={MapTrifoldIcon}
          />
          <Job
            href={user ? "/aportar" : "/registro?next=/aportar"}
            kicker="Comunidad"
            title="Deja rastro"
            body="Experiencia, incidente o aviso. Apodo en público."
            icon={PencilSimpleIcon}
          />
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <HeroStat label="Barrios" value={String(BARRIOS.length)} />
          <HeroStat
            label="Memoria vecinal"
            value={stats.total ? String(stats.total) : "Empieza aquí"}
          />
          <HeroStat label="Avisos de abuso" value={String(stats.abuso)} />
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
              El vino se reserva para esto. Documenta, deja aviso, y si hay delito o riesgo usa 112.
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
              La ficha sale de los servicios libres del Catastro: uso, superficie, antigüedad y unidades. Si el anuncio
              infla metros, esa cifra es el ancla.
            </p>
          </article>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <FaqList />
      </section>
    </div>
  );
}

function Benefit({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: Icon;
  title: string;
  body: string;
}) {
  return (
    <article className="card p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-paper">
          {n}
        </span>
        <UiIcon icon={icon} size="sm" className="text-gold" />
      </p>
      <h3 className="mt-3 font-display text-2xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{body}</p>
    </article>
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
