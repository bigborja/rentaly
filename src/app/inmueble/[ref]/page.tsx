import Link from "next/link";
import type { Metadata } from "next";
import { summarizeUses } from "@/lib/catastro";
import { loadFincaDossier } from "@/lib/dossier";
import { formatM2, prettyUse } from "@/lib/format";
import { ReportList } from "@/components/ReportList";
import { compactRef, isCadastralRef } from "@/lib/parse";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }): Promise<Metadata> {
  const { ref } = await params;
  return { title: `Inmueble ${compactRef(ref)}` };
}

export default async function InmueblePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref: raw } = await params;
  const ref = compactRef(raw);
  if (!isCadastralRef(ref)) notFound();

  let dossier;
  try {
    dossier = await loadFincaDossier(ref);
  } catch {
    notFound();
  }

  const { catastro: property, barrio, touristLicenses, inspections, reports } = dossier;
  const uses = summarizeUses(property);
  const units = property.units;
  const vutUnits = touristLicenses.reduce((sum, item) => sum + item.units, 0);
  const ite = inspections[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-wine">Datos catastrales no protegidos</p>
      <h1 className="mt-2 font-display text-4xl leading-tight">{property.address || property.ref}</h1>
      <p className="mt-2 font-mono text-sm text-ink/60">{property.ref}</p>
      {barrio ? (
        <p className="mt-2 text-sm">
          Barrio{" "}
          <Link className="underline decoration-gold" href={`/barrios/${barrio.slug}`}>
            {barrio.name}
          </Link>{" "}
          · {barrio.district}
        </p>
      ) : null}

      <dl className="mt-8 grid gap-3 sm:grid-cols-4">
        <Mini label="Uso" value={prettyUse(property.use)} />
        <Mini label="Superficie" value={formatM2(property.areaM2)} />
        <Mini label="Antigüedad" value={property.year ? String(property.year) : "—"} />
        <Mini label="Unidades" value={String(units.length)} />
      </dl>

      {property.parcelKind ? <p className="mt-4 text-sm text-ink/65">{property.parcelKind}</p> : null}

      <section className="mt-10">
        <h2 className="font-display text-3xl">Distribución de inmuebles</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          Resumen de usos y superficies que publica el Catastro para esta finca. Sirve para contrastar si el anuncio
          vende una vivienda, un local o un anejo, y si los metros cuadrados cuadran.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uses.map((item) => (
            <li key={item.use} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
              <p className="font-medium">{prettyUse(item.use)}</p>
              <p className="text-sm text-ink/60">
                {item.count} parte{item.count === 1 ? "" : "s"} · {formatM2(item.areaM2)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {units.length > 1 ? (
        <section className="mt-10 overflow-hidden rounded-3xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist">
              <tr>
                <th className="px-4 py-3 font-medium">Referencia</th>
                <th className="px-4 py-3 font-medium">Uso</th>
                <th className="px-4 py-3 font-medium">Planta / puerta</th>
                <th className="px-4 py-3 font-medium">m²</th>
                <th className="px-4 py-3 font-medium">Año</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.ref} className="border-t border-ink/10 bg-white/70">
                  <td className="px-4 py-2 font-mono text-xs">
                    <Link className="underline" href={`/inmueble/${unit.ref}`}>
                      {unit.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{prettyUse(unit.use)}</td>
                  <td className="px-4 py-2">{[unit.floor, unit.door].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-2">{formatM2(unit.areaM2)}</td>
                  <td className="px-4 py-2">{unit.year || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {property.constructions.length > 0 && units.length <= 1 ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad constructiva</th>
                <th className="px-4 py-3 font-medium">Tipología</th>
                <th className="px-4 py-3 font-medium">Planta</th>
                <th className="px-4 py-3 font-medium">m²</th>
              </tr>
            </thead>
            <tbody>
              {property.constructions.map((part, index) => (
                <tr key={`${part.use}-${index}`} className="border-t border-ink/10 bg-white/70">
                  <td className="px-4 py-2">{prettyUse(part.use)}</td>
                  <td className="px-4 py-2">{part.typology || "—"}</td>
                  <td className="px-4 py-2">{[part.stair, part.floor, part.door].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-2">{formatM2(part.areaM2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {property.mapUrl ? (
          <a className="rounded-full bg-ink px-4 py-2 text-paper" href={property.mapUrl} target="_blank" rel="noreferrer">
            Cartografía oficial del Catastro
          </a>
        ) : null}
        <Link
          href={`/aportar?ref=${property.ref}${barrio ? `&barrio=${barrio.id}` : ""}`}
          className="rounded-full bg-wine px-4 py-2 text-paper"
        >
          Dejar experiencia o aviso
        </Link>
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-ink/10 bg-white/70 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.14em] text-ink/50">Viviendas de uso turístico</p>
          <h2 className="mt-1 font-display text-2xl">Licencias VUT en el entorno</h2>
          {touristLicenses.length ? (
            <>
              <p className="mt-2 text-sm text-ink/65">
                {vutUnits} unidad{vutUnits === 1 ? "" : "es"} con licencia urbanística de hospedaje a menos de 60&nbsp;m
                (Geoportal del Ayuntamiento). No implica quién es el titular.
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {touristLicenses.slice(0, 6).map((license) => (
                  <li key={`${license.expedienteLu}-${license.address}-${license.floor}`}>
                    <span className="font-medium">{license.address || "Dirección no informada"}</span>
                    {license.floor ? ` · planta ${license.floor.toLowerCase()}` : ""}
                    {license.expedienteLu ? (
                      <span className="block font-mono text-xs text-ink/50">{license.expedienteLu}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink/65">
              En este radio el Geoportal no muestra licencias VUT, o el servicio municipal no ha respondido.
            </p>
          )}
          <a
            className="mt-3 inline-block text-sm underline decoration-gold"
            href="https://datos.madrid.es/dataset/300694-0-viviendas-turisticas-geoportal"
            target="_blank"
            rel="noreferrer"
          >
            Fuente: datos.madrid.es
          </a>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white/70 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.14em] text-ink/50">Conservación del edificio</p>
          <h2 className="mt-1 font-display text-2xl">ITE / IEE</h2>
          <p className="mt-2 text-sm text-ink/65">
            El Ayuntamiento no publica un volcado masivo con titulares ni inspectores. La consulta oficial es por
            dirección o expediente en el Registro de Edificios y Construcciones.
          </p>
          {ite ? (
            <a
              className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-paper"
              href={ite.consultUrl}
              target="_blank"
              rel="noreferrer"
            >
              Consultar ITE/IEE en la sede
            </a>
          ) : null}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl">Memoria de esta finca</h2>
        <p className="mb-5 mt-2 text-sm text-ink/60">
          Aportes ligados a esta parcela o a cualquiera de sus inmuebles.
        </p>
        <ReportList reports={reports} />
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</dt>
      <dd className="font-display text-2xl">{value}</dd>
    </div>
  );
}
