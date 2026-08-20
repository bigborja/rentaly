import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  BriefcaseIcon,
  ClipboardTextIcon,
  KeyIcon,
  ScalesIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { touristLicensesNear, touristLicensesOnParcel } from "@/clients/madrid/vut";
import { censusSectionAt } from "@/clients/ine/atlas-renta";
import { latestIrav } from "@/clients/ine/irav";
import { inspectionConsulta } from "@/clients/madrid/ite";
import { serpaviAppUrl, serpaviUrlForSection } from "@/clients/mitma/indice-alquiler";
import { listOwnershipClaims, parcelCountsByTaxId } from "@/lib/ownership-store";
import { formatM2, prettyUse } from "@/lib/format";
import { SERPAVI_FAQS, SERPAVI_INFO, serpaviScope } from "@/lib/official";
import { OwnershipForm } from "@/components/OwnershipForm";
import { IravCalculator } from "@/components/IravCalculator";
import { CopyText } from "@/components/CopyText";
import { UiIcon } from "@/components/UiIcon";

const TONE = {
  sage: "border-l-sage",
  gold: "border-l-gold",
  ink: "border-l-ink",
} as const;

function OverlayCard({
  tone,
  icon,
  kicker,
  title,
  children,
}: {
  tone: keyof typeof TONE;
  icon: Icon;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`animate-rise rounded-3xl border border-ink/10 border-l-[5px] ${TONE[tone]} bg-white/80 px-5 py-5 shadow-rest`}
    >
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink/50">
        <UiIcon icon={icon} size="sm" />
        {kicker}
      </p>
      <h2 className="mt-1 font-display text-2xl">{title}</h2>
      {children}
    </div>
  );
}

export function OverlayFallback({ title }: { title: string }) {
  return (
    <div className="animate-pulse rounded-3xl border border-ink/10 bg-white/50 px-5 py-5">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/40">Cargando</p>
      <p className="mt-2 font-display text-2xl text-ink/30">{title}</p>
      <p className="mt-2 text-xs text-ink/40">Consultando fuentes públicas. Tarda unos segundos.</p>
      <p className="mt-2 h-12 rounded-xl bg-mist/80" />
    </div>
  );
}

export async function VutPanel({
  parcelRef,
  longitude,
  latitude,
}: {
  parcelRef: string;
  longitude?: number;
  latitude?: number;
}) {
  const vut =
    longitude != null && latitude != null
      ? await touristLicensesOnParcel(parcelRef, longitude, latitude)
      : { onParcel: [], nearby: [] };
  const block =
    longitude != null && latitude != null ? await touristLicensesNear(longitude, latitude, 250) : [];
  const vutUnits = vut.onParcel.reduce((sum, item) => sum + item.units, 0);
  const nearbyUnits = vut.nearby.reduce((sum, item) => sum + item.units, 0);
  const blockUnits = block.reduce((sum, item) => sum + item.units, 0);
  return (
    <OverlayCard tone="sage" icon={KeyIcon} kicker="Viviendas de uso turístico" title="Licencias VUT">
      <p className="mt-2 text-xs leading-5 text-ink/55">
        VUT es una vivienda con licencia para alquilar a turistas. Cruzamos el listado del Ayuntamiento con la
        referencia catastral de esta parcela. No implica que el piso del anuncio esté en esa lista. La presión de
        manzana cuenta licencias en 80&nbsp;m y 250&nbsp;m, no anuncios de Airbnb.
      </p>
      {vut.onParcel.length ? (
        <p className="mt-2 text-sm text-ink/65">
          {vutUnits} unidad{vutUnits === 1 ? "" : "es"} con licencia urbanística de hospedaje en{" "}
          <strong>esta parcela</strong>.
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink/65">
          Ninguna licencia VUT del Geoportal ha coincidido con esta referencia catastral.
        </p>
      )}
      {vut.onParcel.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {vut.onParcel.slice(0, 6).map((license) => (
            <li key={`${license.expedienteLu}-${license.address}-${license.floor}`}>
              <span className="font-medium">{license.address || "Dirección no informada"}</span>
              {license.floor ? ` · planta ${license.floor.toLowerCase()}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {longitude != null ? (
        <p className="mt-3 text-sm text-ink/65">
          Presión alrededor: {vut.nearby.length} licencia{vut.nearby.length === 1 ? "" : "s"}
          {nearbyUnits ? ` (${nearbyUnits} ud.)` : ""} en 80&nbsp;m sin cruzar a esta RC
          {block.length ? ` · ${block.length} en 250 m (${blockUnits} ud.)` : ""}.
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
    </OverlayCard>
  );
}

export async function SerpaviPanel({
  cadastralRef,
  longitude,
  latitude,
  areaM2,
  year,
  use,
}: {
  cadastralRef: string;
  longitude?: number;
  latitude?: number;
  areaM2?: number;
  year?: number;
  use?: string;
}) {
  const rentContext =
    longitude != null && latitude != null ? await censusSectionAt(longitude, latitude) : null;
  const scope = serpaviScope({ areaM2, year, use });
  return (
    <OverlayCard tone="gold" icon={ChartBarIcon} kicker="SERPAVI · MIVAU" title="Rango oficial de este alquiler">
      <p className="mt-2 text-xs leading-5 text-ink/55">
        SERPAVI calcula un rango de renta para <strong>esta vivienda</strong> (localización, m² y extras). No es el
        precio de un anuncio ni la subida anual del contrato: eso es el IRAV, al lado. Rentaly no inventa el rango: abre
        la aplicación del Ministerio con la referencia catastral.
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-mist/80 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Catastro</dt>
          <dd className="font-mono text-xs">{cadastralRef}</dd>
        </div>
        <div className="rounded-2xl bg-mist/80 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Superficie</dt>
          <dd>{formatM2(areaM2)}</dd>
        </div>
        <div className="rounded-2xl bg-mist/80 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-ink/45">Uso / año</dt>
          <dd>
            {prettyUse(use)}
            {year ? ` · ${year}` : ""}
          </dd>
        </div>
      </dl>
      {rentContext ? (
        <p className="mt-3 text-sm text-ink/65">
          Sección censal <span className="font-mono">{rentContext.censusSectionCode}</span>. SERPAVI también te dirá si
          esa sección está en zona tensionada; Rentaly no lo afirma por su cuenta.
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink/65">Sin coordenadas no asignamos sección censal; la RC basta en SERPAVI.</p>
      )}
      {scope.inScope ? (
        <p className="mt-2 text-xs text-ink/50">
          Esta ficha entra en el ámbito habitual de la aplicación (vivienda colectiva, 30–150 m², más de cinco años). El
          Ministerio confirma el rango al pegar la RC.
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink/55">
          Puede quedar fuera del rango individualizado ({scope.reasons.join("; ")}). Igual conviene abrir SERPAVI: el
          visor de sección sigue siendo útil.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm text-paper"
          href={serpaviAppUrl(cadastralRef)}
          target="_blank"
          rel="noreferrer"
        >
          Abrir SERPAVI con esta RC
        </a>
        <CopyText text={cadastralRef} label="Copiar RC" className="rounded-full border border-ink/15 px-4 py-2 text-sm" />
        {rentContext ? (
          <a
            className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm"
            href={serpaviUrlForSection(rentContext.censusSectionCode)}
            target="_blank"
            rel="noreferrer"
          >
            Visor de la sección
          </a>
        ) : (
          <a
            className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm"
            href={SERPAVI_INFO}
            target="_blank"
            rel="noreferrer"
          >
            Qué es SERPAVI
          </a>
        )}
      </div>
      <p className="mt-3 text-xs text-ink/45">
        <a className="underline decoration-gold" href={SERPAVI_FAQS} target="_blank" rel="noreferrer">
          Preguntas frecuentes del Ministerio
        </a>
        . Pega la RC si la aplicación no la rellena sola.
      </p>
    </OverlayCard>
  );
}

export async function IravPanel() {
  const latest = await latestIrav();
  return (
    <OverlayCard tone="sage" icon={ScalesIcon} kicker="IRAV · INE" title="Techo de la subida anual">
      <p className="mt-2 text-xs leading-5 text-ink/55">
        El IRAV limita cuánto puede subir la renta de un contrato de vivienda habitual firmado desde el 26 de mayo de
        2023, si hay cláusula de revisión. No dice cuánto debería costar el piso (eso es SERPAVI) ni sustituye lo
        pactado en contratos anteriores.
      </p>
      {latest ? (
        <p className="mt-3 text-sm text-ink/70">
          Último dato INE ({latest.label}): <strong>{latest.ratePercent.toLocaleString("es-ES")} %</strong>. Contrástalo
          en la tabla oficial antes de aceptarlo.
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink/65">
          No hemos podido leer el INE ahora. Usa la tabla o la calculadora del Ministerio; no inventamos el porcentaje.
        </p>
      )}
      <IravCalculator latest={latest} />
    </OverlayCard>
  );
}

export async function ContextPanel({
  longitude,
  latitude,
  address,
}: {
  longitude?: number;
  latitude?: number;
  address?: string;
}) {
  const rentContext =
    longitude != null && latitude != null ? await censusSectionAt(longitude, latitude) : null;
  const income = rentContext?.meanHouseholdIncomeEuros
    ? Math.round(rentContext.meanHouseholdIncomeEuros).toLocaleString("es-ES")
    : null;
  const ite = inspectionConsulta(address);
  return (
    <OverlayCard tone="gold" icon={ClipboardTextIcon} kicker="INE · ITE" title="Renta de la sección e inspección">
      <p className="mt-2 text-xs leading-5 text-ink/55">
        La renta del INE es la media de los hogares de la sección censal, no de este portal. ITE/IEE es la inspección
        técnica del edificio: el resultado solo lo da el Ayuntamiento.
      </p>
      {rentContext ? (
        <>
          <p className="mt-2 font-mono text-sm text-ink/60">CUSEC {rentContext.censusSectionCode}</p>
          <p className="mt-2 text-sm text-ink/65">
            Renta neta media por hogar ({rentContext.year}): <strong>{income ? `${income} €` : "no publicada"}</strong>.
            Agregado INE, no de esta finca.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink/65">Sin coordenadas no se asigna sección censal.</p>
      )}
      <a
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper"
        href={ite.consultUrl}
        target="_blank"
        rel="noreferrer"
      >
        <UiIcon icon={ClipboardTextIcon} size="sm" className="text-paper" />
        Consultar ITE/IEE en la sede
      </a>
      <p className="mt-2 text-xs text-ink/50">No inventamos el resultado de la inspección.</p>
    </OverlayCard>
  );
}

export async function OwnershipPanel({
  parcelRef,
  signedIn,
}: {
  parcelRef: string;
  signedIn: boolean;
}) {
  const ownershipClaims = await listOwnershipClaims(parcelRef).catch(() => []);
  const taxIds = ownershipClaims.map((claim) => claim.legalEntity?.taxId).filter(Boolean) as string[];
  const counts = taxIds.length ? await parcelCountsByTaxId(taxIds) : {};
  return (
    <OverlayCard tone="ink" icon={BriefcaseIcon} kicker="Titularidad" title="Personas jurídicas en esta finca">
      <p className="mt-2 max-w-2xl text-sm text-ink/65">
        El Catastro no publica el nombre de dueños particulares y aquí tampoco. Solo se vincula un CIF (empresa, SOCIMI,
        fondo o gestora). Un aporte vecinal queda como baja confianza hasta que haya un enlace a BOE, BORM o
        registradores. La cartera de parcelas está en la entidad; las experiencias de quien gestiona el alquiler, en la
        ficha de gestora.
      </p>
      {ownershipClaims.length ? (
        <ul className="mt-4 space-y-2 text-sm">
          {ownershipClaims.map((claim) => {
            const taxId = claim.legalEntity?.taxId || "";
            const n = counts[taxId] || 1;
            return (
              <li key={claim.id}>
                <Link className="font-medium underline decoration-gold" href={`/entidad/${taxId}`}>
                  {claim.legalEntity?.legalName}
                </Link>{" "}
                <span className="font-mono text-xs text-ink/50">{taxId}</span>
                <span className="text-ink/55">
                  {" "}
                  · {claim.confidence === "high" ? "fuente oficial" : "aporte vecinal"}
                  {n > 1 ? ` · ${n} fincas con este CIF` : ""}
                  {claim.largeHolderCandidate || n > 1 ? " · gran tenedor (forma o cartera)" : ""}
                </span>
                {taxId ? (
                  <>
                    {" · "}
                    <Link className="underline decoration-gold" href={`/gestora/${taxId}`}>
                      memoria de gestora
                    </Link>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink/55">Nadie ha vinculado todavía una persona jurídica a esta parcela.</p>
      )}
      {signedIn ? (
        <OwnershipForm parcelRef={parcelRef} />
      ) : (
        <p className="mt-4 text-sm">
          <Link className="underline" href="/entrar">
            Entra
          </Link>{" "}
          para aportar un CIF si conoces la gestora. No se aceptan notas simples, DNI ni nombres de personas físicas.
        </p>
      )}
    </OverlayCard>
  );
}
