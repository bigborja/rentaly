import Link from "next/link";
import type { ParcelPeek } from "@/domain/peek";
import { formatM2, prettyUse } from "@/lib/format";
import { serpaviAppUrl } from "@/lib/official";
import { UiIcon } from "@/components/UiIcon";
import {
  BriefcaseIcon,
  ChartBarIcon,
  ChatTeardropTextIcon,
  KeyIcon,
  RulerIcon,
  ScalesIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

function Tile({
  icon,
  label,
  value,
  hint,
  href,
  tone = "ink",
}: {
  icon: Icon;
  label: string;
  value: string;
  hint: string;
  href?: string;
  tone?: "ink" | "wine" | "sage";
}) {
  const inner = (
    <>
      <p className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] ${tone === "wine" ? "text-wine" : "text-ink/45"}`}>
        <UiIcon icon={icon} size="sm" />
        {label}
      </p>
      <p className="mt-1 font-display text-xl leading-tight">{value}</p>
      <p className="mt-1 text-xs leading-4 text-ink/55">{hint}</p>
    </>
  );
  if (href) {
    const className = "rounded-2xl border border-ink/10 bg-white/80 px-3 py-3 block transition hover:border-gold";
    if (href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-ink/10 bg-white/80 px-3 py-3">{inner}</div>;
}

export function ParcelScorecard({ peek }: { peek: ParcelPeek }) {
  const entity = peek.legalEntities[0];
  const serpaviHint = peek.serpavi.inScope
    ? "Ámbito habitual de la aplicación. El rango lo calcula el Ministerio."
    : peek.serpavi.reasons[0] || "Consulta igual el visor de sección.";

  return (
    <div className="grid grid-cols-2 gap-2">
      <Tile
        icon={RulerIcon}
        label="Catastro"
        value={formatM2(peek.areaM2)}
        hint={`${prettyUse(peek.use)}${peek.year ? ` · ${peek.year}` : ""}`}
      />
      <Tile
        icon={KeyIcon}
        label="VUT 80 m"
        value={String(peek.touristNearby)}
        hint={
          peek.touristNearby
            ? `${peek.touristUnitsNearby} ud. con licencia cerca. No es Airbnb.`
            : "Sin licencias turísticas cerca en el Geoportal."
        }
        tone={peek.touristNearby ? "sage" : "ink"}
      />
      <Tile
        icon={ChatTeardropTextIcon}
        label="Memoria"
        value={String(peek.reports)}
        hint={peek.abuse ? `${peek.abuse} aviso${peek.abuse === 1 ? "" : "s"} de abuso` : "Relatos de quien ya alquiló."}
        tone={peek.abuse ? "wine" : "ink"}
        href={`/inmueble/${peek.parcelRef}`}
      />
      <Tile
        icon={BriefcaseIcon}
        label="CIF"
        value={entity ? entity.legalName.slice(0, 22) : "Sin CIF"}
        hint={
          entity
            ? `${peek.legalEntities.length} persona${peek.legalEntities.length === 1 ? "" : "s"} jurídica${peek.legalEntities.length === 1 ? "" : "s"}. Nunca un particular.`
            : "El Catastro no publica dueños persona física."
        }
        href={entity ? `/entidad/${entity.taxId}` : undefined}
      />
      <Tile
        icon={ChartBarIcon}
        label="SERPAVI"
        value={peek.serpavi.inScope ? "Consultar rango" : "Fuera de ámbito"}
        hint={serpaviHint}
        href={serpaviAppUrl(peek.parcelRef)}
      />
      <Tile
        icon={ScalesIcon}
        label="IRAV"
        value={peek.irav ? `${peek.irav.ratePercent.toLocaleString("es-ES")} %` : "En la ficha"}
        hint={
          peek.irav
            ? `Último INE (${peek.irav.label}). Techo de subida si el contrato es posterior al 26/05/2023.`
            : "Techo de la actualización anual. El cálculo está en la ficha completa."
        }
        href={`/inmueble/${peek.parcelRef}`}
      />
    </div>
  );
}

export function ParcelScorecardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl bg-mist/80" />
      ))}
    </div>
  );
}
