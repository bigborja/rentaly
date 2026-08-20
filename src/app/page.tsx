import Link from "next/link";
import { SearchPanel } from "@/components/SearchPanel";
import { MadridMap } from "@/components/MadridMap";
import { ReportList } from "@/components/ReportList";
import { reportStats, listReports } from "@/lib/reports";
import { BARRIOS } from "@/lib/barrios-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await reportStats();
  const latest = (await listReports()).slice(0, 4);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10">
        <p className="text-xs uppercase tracking-[0.22em] text-wine">Madrid capital · inquilinas e inquilinos</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
          Alquila con los ojos abiertos.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-ink/75">
          Rentaly cruza el Catastro, los 131 barrios del Ayuntamiento y la memoria colectiva del alquiler para que un
          contrato no se firme a ciegas: superficie real, usos de la finca, experiencias, incidentes y avisos de abuso.
        </p>
        <div className="mt-8">
          <SearchPanel />
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
              El color marca dónde hay más memoria vecinal. Activa las parcelas del Catastro para abrir una finca.
            </p>
          </div>
          <Link href="/barrios" className="text-sm underline decoration-gold">
            Ver los 131 barrios
          </Link>
        </div>
        <MadridMap statsByBarrio={stats.byBarrio} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-3xl">Última memoria vecinal</h2>
          <p className="mb-5 mt-2 text-sm text-ink/60">
            Relatos de la comunidad. No son resoluciones judiciales ni certifican titularidad.
          </p>
          <ReportList reports={latest} />
        </div>
        <aside className="space-y-4">
          <article className="rounded-3xl bg-ink p-6 text-paper">
            <h3 className="font-display text-2xl text-gold">Cómo usarlo antes de firmar</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-paper/80">
              <li>Busca la calle y el portal. El Catastro lista cada inmueble: vivienda, local, trastero.</li>
              <li>Compara los metros y el año con el anuncio. Si no coinciden, pregunta por escrito.</li>
              <li>Lee experiencias e incidentes del barrio y de esa parcela, si las hay.</li>
              <li>Si ves fianza extra, contrato de temporada fingido u honorarios indebidos, deja un aviso.</li>
            </ol>
            <Link href="/derechos" className="mt-6 inline-flex rounded-full bg-gold px-4 py-2 text-sm text-ink">
              Derechos y recursos
            </Link>
          </article>
          <article className="rounded-3xl border border-ink/10 bg-white/60 p-6">
            <h3 className="font-display text-2xl">Datos oficiales, no de portales</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              La ficha del inmueble sale de los servicios libres de la Dirección General del Catastro: uso, superficie,
              antigüedad y distribución de unidades constructivas. No mostramos titularidad ni valor catastral protegido.
            </p>
          </article>
        </aside>
      </section>
    </div>
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
