import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBarrio } from "@/lib/barrios-data";
import { listReports, reportStats } from "@/lib/reports";
import { MadridMap } from "@/components/MadridMap";
import { SearchPanel } from "@/components/SearchPanel";
import { ReportList } from "@/components/ReportList";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const barrio = getBarrio(slug);
  return { title: barrio ? `${barrio.name} · ${barrio.district}` : "Barrio" };
}

export default async function BarrioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barrio = getBarrio(slug);
  if (!barrio) notFound();
  const reports = await listReports({ barrioId: barrio.id });
  const stats = await reportStats();
  const local = stats.byBarrio[barrio.id] || { total: 0, abuso: 0, incidente: 0, experiencia: 0 };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-wine">
        Distrito {barrio.districtId} · {barrio.district}
      </p>
      <h1 className="mt-2 font-display text-5xl">{barrio.name}</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Código de barrio {barrio.id}. Los límites salen del geoportal municipal. La distribución de inmuebles de cada
        portal la da el Catastro al buscar calle y número: viviendas, locales, trasteros y metros.
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        <Mini label="Aportes" value={String(local.total)} />
        <Mini label="Experiencias" value={String(local.experiencia)} />
        <Mini label="Incidentes" value={String(local.incidente)} />
        <Mini label="Avisos de abuso" value={String(local.abuso)} />
      </dl>

      <div className="mt-8">
        <MadridMap statsByBarrio={stats.byBarrio} focus={barrio} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-2xl">Buscar un portal en este barrio</h2>
        <SearchPanel compact />
      </div>

      <div className="mt-12 flex items-end justify-between">
        <h2 className="font-display text-3xl">Memoria vecinal</h2>
        <Link href={`/aportar?barrio=${barrio.id}`} className="text-sm underline decoration-gold">
          Aportar en {barrio.name}
        </Link>
      </div>
      <div className="mt-5">
        <ReportList reports={reports} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/60 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</dt>
      <dd className="font-display text-2xl">{value}</dd>
    </div>
  );
}
