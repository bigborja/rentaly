import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { summarizeUses } from "@/lib/catastro";
import { loadFincaShell } from "@/lib/dossier";
import { listReports } from "@/lib/reports";
import { formatM2, prettyUse } from "@/lib/format";
import { ReportList } from "@/components/ReportList";
import { getCurrentUser } from "@/lib/auth";
import { compactRef, isCadastralRef } from "@/lib/parse";
import { notFound } from "next/navigation";
import { Guide } from "@/components/Guide";
import { ContextPanel, OverlayFallback, OwnershipPanel, VutPanel } from "./overlays";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }): Promise<Metadata> {
  const { ref } = await params;
  return { title: `Inmueble ${compactRef(ref)}` };
}

export default async function InmueblePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref: raw } = await params;
  const ref = compactRef(raw);
  if (!isCadastralRef(ref)) notFound();

  let shell;
  try {
    shell = await loadFincaShell(ref);
  } catch {
    notFound();
  }

  const { catastro: property, barrio } = shell;
  const user = await getCurrentUser();
  const reports = await listReports({ ref: property.parcelRef });
  const uses = summarizeUses(property);
  const units = property.units;

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

      <div className="mt-6">
        <Guide kicker="Qué estás viendo" title="Ficha de una finca, no de un anuncio">
          <p>
            Estos datos salen del Catastro: superficie, uso (vivienda, local, trastero…), año y las unidades que hay en
            el portal. No es un tasador ni dice quién es el dueño persona física. Compáralos con el anuncio antes de
            firmar o de pagar una reserva.
          </p>
          <p>
            Más abajo, si hay coordenadas, cruzamos licencias de vivienda turística, renta media de la sección censal (un
            recorte estadístico más pequeño que el barrio) y un enlace a la inspección del edificio. Los CIF los aporta
            la comunidad.
          </p>
        </Guide>
      </div>

      <div className="mt-8 rounded-3xl bg-ink px-5 py-5 text-paper">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">Contrasta el anuncio</p>
        <p className="mt-2 font-display text-4xl">{formatM2(property.areaM2)}</p>
        <p className="mt-2 max-w-xl text-sm text-paper/70">
          Superficie construida que publica el Catastro
          {property.use ? ` · uso ${prettyUse(property.use)}` : ""}
          {property.year ? ` · hacia ${property.year}` : ""}. Si el anuncio dice más metros o un uso distinto, esta cifra
          manda: pregunta por escrito antes de reservar.
        </p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        <Mini label="Uso" value={prettyUse(property.use)} />
        <Mini label="Superficie" value={formatM2(property.areaM2)} />
        <Mini label="Antigüedad" value={property.year ? String(property.year) : "—"} />
        <Mini label="Unidades" value={String(units.length)} />
      </dl>

      {property.parcelKind ? <p className="mt-4 text-sm text-ink/65">{property.parcelKind}</p> : null}

      <section className="mt-10">
        <h2 className="font-display text-3xl">Distribución de inmuebles</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          Un portal suele mezclar viviendas con locales, trasteros o plazas. Aquí ves cuántas partes hay de cada uso y
          sus metros. Si te venden como piso algo que el Catastro marca como comercial, para.
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
          <p className="bg-mist px-4 py-3 text-sm text-ink/70">
            Cada fila es un inmueble con su propia referencia de 20 caracteres (piso, local, trastero). Pulsa una para
            abrirla. La de 14 caracteres de arriba es la parcela completa.
          </p>
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
        <Suspense fallback={<OverlayFallback title="Licencias VUT" />}>
          <VutPanel parcelRef={property.parcelRef} longitude={property.longitude} latitude={property.latitude} />
        </Suspense>
        <Suspense fallback={<OverlayFallback title="Renta e ITE" />}>
          <ContextPanel longitude={property.longitude} latitude={property.latitude} address={property.address} />
        </Suspense>
      </section>

      <div className="mt-14">
        <Suspense fallback={<OverlayFallback title="Personas jurídicas" />}>
          <OwnershipPanel parcelRef={property.parcelRef} signedIn={Boolean(user)} />
        </Suspense>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl">Memoria de esta finca</h2>
        <p className="mb-5 mt-2 text-sm text-ink/60">
          Relatos ligados a esta parcela o a cualquiera de sus inmuebles. Experiencia = cómo se alquiló; incidente =
          algo de la finca (humedad, portería, ruidos); abuso = fianza, entrada, discriminación u otra irregularidad.
          Lee el patrón, no una sola frase.
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
