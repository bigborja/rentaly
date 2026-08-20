import Link from "next/link";
import type { Metadata } from "next";
import { MagnifyingGlassIcon, BuildingsIcon } from "@phosphor-icons/react/ssr";
import { Callout, Guide } from "@/components/Guide";
import { UiIcon } from "@/components/UiIcon";
import { searchGestoras, type GestoraHit } from "@/lib/gestoras";
import { DATA_SOURCES } from "@/domain/sources";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gestoras y agencias" };

export default async function GestorasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const result = await searchGestoras(q);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wine">
        <UiIcon icon={BuildingsIcon} size="sm" className="text-wine" />
        Personas jurídicas
      </p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Busca la gestora, no al particular</h1>
      <p className="mt-4 text-sm leading-7 text-ink/75">
        El ancla es el CIF: la misma memoria vecinal, agrupada, más las sociedades inscritas de forma voluntaria en el{" "}
        <a className="underline decoration-gold" href={DATA_SOURCES.madridRain.homepage} target="_blank" rel="noreferrer">
          Registro de Agentes Inmobiliarios (RAIN)
        </a>{" "}
        de la Comunidad de Madrid. No hay directorio de colegiados, ni reseñas de Google, ni scrapes de Idealista.
      </p>

      <form action="/gestoras" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="gestora-q">
          Buscar gestora o agencia
        </label>
        <div className="relative flex-1">
          <UiIcon
            icon={MagnifyingGlassIcon}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <input
            id="gestora-q"
            name="q"
            defaultValue={q}
            placeholder="CIF o razón social · nunca un DNI"
            className="w-full rounded-full border border-ink/15 bg-paper py-3 pl-10 pr-4 text-sm outline-none ring-wine/30 placeholder:text-ink/40 focus:ring-2"
          />
        </div>
        <button type="submit" className="rounded-full bg-wine px-5 py-3 text-sm font-medium text-paper">
          Buscar gestora
        </button>
      </form>

      <div className="mt-6">
        <Guide kicker="Qué entra y qué no" title="CIF público, no un censo de personas">
          <p>
            RAIN es adhesión voluntaria y cubre toda la Comunidad, no solo Madrid capital. Filtramos el volcado abierto:
            se quedan SL, SA y otras personas jurídicas; se tiran NIF, NIE y nombres de agentes particulares. CAF Madrid
            y COAPI son colegios de personas físicas: no los indexamos. CNMV, BME o BORM sirven como enlace de evidencia
            en una finca, no como directorio masivo.
          </p>
        </Guide>
      </div>

      {result.rainAvailable ? (
        <p className="mt-4 text-xs text-ink/55">
          {result.rainLegalCount} sociedades del RAIN (CIF) disponibles para cruzar. Sin búsqueda, listamos solo las que
          ya tienen memoria o cartera en Rentaly.
        </p>
      ) : (
        <p className="mt-4 text-xs text-ink/55">
          El portal de datos de la Comunidad no ha respondido ahora. Puedes buscar igual por CIF si ya hay relatos
          vecinales.
        </p>
      )}

      <Results result={result} />

      <Callout>
        Si alquilaste con una de estas sociedades, el relato (sin DNI ni nombres de particulares) es lo que abre o
        refuerza la ficha.{" "}
        <Link className="underline decoration-gold" href="/aportar">
          Aportar memoria
        </Link>
        .
      </Callout>
    </div>
  );
}

function Results({
  result,
}: {
  result: Awaited<ReturnType<typeof searchGestoras>>;
}) {
  if (!result.hits.length) {
    return (
      <p className="mt-8 text-sm leading-6 text-ink/65">
        {result.query
          ? "Ninguna persona jurídica coincide. Prueba el CIF completo (letra + 8 caracteres) o un trozo de la razón social. Si es un particular, Rentaly no lo indexa."
          : "Todavía no hay gestoras con memoria o cartera. Busca un CIF o una razón social del RAIN, o deja el primero en Aportar."}
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {result.hits.map((hit) => (
        <li key={hit.taxId}>
          <GestoraRow hit={hit} />
        </li>
      ))}
    </ul>
  );
}

function GestoraRow({ hit }: { hit: GestoraHit }) {
  return (
    <Link
      href={`/gestora/${hit.taxId}`}
      className="card block p-5 transition hover:border-wine/40 hover:shadow-lift"
    >
      <p className="font-display text-2xl leading-tight">{hit.legalName}</p>
      <p className="mt-1 font-mono text-sm text-ink/55">{hit.taxId}</p>
      <p className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
        <span className="rounded-full bg-mist px-2.5 py-1">
          {hit.reportCount} relato{hit.reportCount === 1 ? "" : "s"}
        </span>
        {hit.abuseCount ? (
          <span className="rounded-full bg-wine/10 px-2.5 py-1 text-wine">
            {hit.abuseCount} aviso{hit.abuseCount === 1 ? "" : "s"}
          </span>
        ) : null}
        {hit.parcelCount ? (
          <span className="rounded-full bg-mist px-2.5 py-1">
            {hit.parcelCount} finca{hit.parcelCount === 1 ? "" : "s"}
          </span>
        ) : null}
        {hit.inRain ? (
          <span className="rounded-full bg-sage/15 px-2.5 py-1 text-sage">
            RAIN {hit.rainNumber}
          </span>
        ) : null}
      </p>
    </Link>
  );
}
