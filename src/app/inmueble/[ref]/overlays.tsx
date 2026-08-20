import type { ReactNode } from "react";
import Link from "next/link";
import { ChartBarIcon, BriefcaseIcon, ClipboardTextIcon, KeyIcon } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { touristLicensesOnParcel } from "@/clients/madrid/vut";
import { censusSectionAt } from "@/clients/ine/atlas-renta";
import { inspectionConsulta } from "@/clients/madrid/ite";
import { serpaviUrlForSection } from "@/clients/mitma/indice-alquiler";
import { listOwnershipClaims, parcelCountsByTaxId } from "@/lib/ownership-store";
import { OwnershipForm } from "@/components/OwnershipForm";
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
  const vutUnits = vut.onParcel.reduce((sum, item) => sum + item.units, 0);
  return (
    <OverlayCard tone="sage" icon={KeyIcon} kicker="Viviendas de uso turístico" title="Licencias VUT">
      <p className="mt-2 text-xs leading-5 text-ink/55">
        VUT es una vivienda con licencia para alquilar a turistas. Cruzamos el listado del Ayuntamiento con la
        referencia catastral de esta parcela. No implica que el piso del anuncio esté en esa lista.
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
      {vut.nearby.length ? (
        <p className="mt-3 text-xs text-ink/50">
          {vut.nearby.length} licencia{vut.nearby.length === 1 ? "" : "s"} más en 80&nbsp;m sin cruzar a esta RC.
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
    <OverlayCard tone="gold" icon={ChartBarIcon} kicker="Sección censal · renta" title="Contexto de barrio estadístico">
      <p className="mt-2 text-xs leading-5 text-ink/55">
        La sección censal es un recorte del INE más pequeño que el barrio. La renta es la media de los hogares de esa
        pieza, no de este portal. SERPAVI abre el visor estatal de precios de alquiler de la zona. ITE es la inspección
        técnica del edificio: el resultado solo lo da el Ayuntamiento.
      </p>
      {rentContext ? (
        <>
          <p className="mt-2 font-mono text-sm text-ink/60">CUSEC {rentContext.censusSectionCode}</p>
          <p className="mt-2 text-sm text-ink/65">
            Renta neta media por hogar ({rentContext.year}): <strong>{income ? `${income} €` : "no publicada"}</strong>.
            Agregado INE, no de esta finca.
          </p>
          <a
            className="mt-3 inline-block text-sm underline decoration-gold"
            href={serpaviUrlForSection(rentContext.censusSectionCode)}
            target="_blank"
            rel="noreferrer"
          >
            Consultar SERPAVI para esta sección
          </a>
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
        fondo). Un aporte vecinal queda como baja confianza hasta que haya un enlace a BOE, BORM o registradores. Si el
        mismo CIF aparece en más de una finca, es el núcleo de una cartera, no un vecino.
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
