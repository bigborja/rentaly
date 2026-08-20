import Link from "next/link";
import type { Metadata } from "next";
import { summarizeUses } from "@/lib/catastro";
import { loadFincaDossier } from "@/lib/dossier";
import { formatM2, prettyUse } from "@/lib/format";
import { ReportList } from "@/components/ReportList";
import { OwnershipForm } from "@/components/OwnershipForm";
import { getCurrentUser } from "@/lib/auth";
import { serpaviUrlForSection } from "@/clients/mitma/indice-alquiler";
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

  const { catastro: property, barrio, touristLicenses, inspections, reports, rentContext, ownershipClaims } = dossier;
  const user = await getCurrentUser();
  const uses = summarizeUses(property);
  const units = property.units;
  const onParcelVut = touristLicenses.filter((item) => item.onParcel);
  const nearbyVut = touristLicenses.filter((item) => !item.onParcel);
  const vutUnits = onParcelVut.reduce((sum, item) => sum + item.units, 0);
  const ite = inspections[0];
  const income = rentContext?.meanHouseholdIncomeEuros
    ? Math.round(rentContext.meanHouseholdIncomeEuros).toLocaleString("es-ES")
    : null;

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
          <h2 className="mt-1 font-display text-2xl">Licencias VUT</h2>
          {onParcelVut.length ? (
            <p className="mt-2 text-sm text-ink/65">
              {vutUnits} unidad{vutUnits === 1 ? "" : "es"} con licencia urbanística de hospedaje en{" "}
              <strong>esta parcela</strong> (dirección del Geoportal cruzada con el callejero catastral).
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink/65">
              Ninguna licencia VUT del Geoportal ha coincidido con esta referencia catastral. Puede haber hospedaje
              sin licencia o un desfase en la dirección.
            </p>
          )}
          {onParcelVut.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {onParcelVut.slice(0, 6).map((license) => (
                <li key={`${license.expedienteLu}-${license.address}-${license.floor}`}>
                  <span className="font-medium">{license.address || "Dirección no informada"}</span>
                  {license.floor ? ` · planta ${license.floor.toLowerCase()}` : ""}
                  {license.expedienteLu ? (
                    <span className="block font-mono text-xs text-ink/50">{license.expedienteLu}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {nearbyVut.length ? (
            <p className="mt-3 text-xs text-ink/50">
              {nearbyVut.length} licencia{nearbyVut.length === 1 ? "" : "s"} más en el entorno (80&nbsp;m) sin cruzar a
              esta RC.
            </p>
          ) : null}
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
          <p className="text-xs uppercase tracking-[0.14em] text-ink/50">Sección censal · renta</p>
          <h2 className="mt-1 font-display text-2xl">Contexto de barrio estadístico</h2>
          {rentContext ? (
            <>
              <p className="mt-2 font-mono text-sm text-ink/60">CUSEC {rentContext.censusSectionCode}</p>
              <p className="mt-2 text-sm text-ink/65">
                Renta neta media por hogar ({rentContext.year}):{" "}
                <strong>{income ? `${income} €` : "no publicada"}</strong>. Es un agregado INE, no la renta de esta
                finca.
              </p>
              <a
                className="mt-3 inline-block text-sm underline decoration-gold"
                href={serpaviUrlForSection(rentContext.censusSectionCode)}
                target="_blank"
                rel="noreferrer"
              >
                Consultar el índice estatal de alquiler (SERPAVI) para esta sección
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink/65">
              Sin coordenadas catastrales no se puede asignar sección censal. El visor SERPAVI del Ministerio cubre el
              alquiler de referencia.
            </p>
          )}
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

      <section className="mt-14 rounded-3xl border border-ink/10 bg-white/70 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.14em] text-ink/50">Titularidad</p>
        <h2 className="mt-1 font-display text-2xl">Personas jurídicas en esta finca</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          El Catastro no publica propietarios personas físicas. Aquí solo hay CIF (SOCIMI, fondos, SL…) aportados con
          enlace a BORM o registro, o como aviso vecinal de baja confianza.
        </p>
        {ownershipClaims.length ? (
          <ul className="mt-4 space-y-2 text-sm">
            {ownershipClaims.map((claim) => (
              <li key={claim.id}>
                <Link className="font-medium underline decoration-gold" href={`/entidad/${claim.legalEntity?.taxId}`}>
                  {claim.legalEntity?.legalName}
                </Link>{" "}
                <span className="font-mono text-xs text-ink/50">{claim.legalEntity?.taxId}</span>
                {claim.largeHolderCandidate ? " · gran tenedor (forma jurídica)" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink/55">Nadie ha vinculado todavía una persona jurídica a esta parcela.</p>
        )}
        {user ? <OwnershipForm parcelRef={property.parcelRef} /> : (
          <p className="mt-4 text-sm">
            <Link className="underline" href="/entrar">
              Entra
            </Link>{" "}
            para aportar un CIF. No se aceptan notas simples ni DNI.
          </p>
        )}
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
