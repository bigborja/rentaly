"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { BuildingsIcon, MagnifyingGlassIcon, RulerIcon } from "@phosphor-icons/react/ssr";
import { UiIcon, type Icon } from "@/components/UiIcon";
import type { SearchResult } from "@/lib/types";
import { formatM2, prettyUse } from "@/lib/format";

export function SearchPanel({
  initialQuery = "",
  compact = false,
  overlay = false,
  quiet = false,
}: {
  initialQuery?: string;
  compact?: boolean;
  overlay?: boolean;
  quiet?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/catastro/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se ha podido buscar.");
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Error de búsqueda.");
    } finally {
      setLoading(false);
    }
  }

  const units = result?.units || result?.property?.units || [];
  const heading = useMemo(() => {
    if (!result?.property) return null;
    return result.property.address || result.property.ref;
  }, [result]);
  const open = Boolean(result?.property || result?.streets?.length || error);

  return (
    <section
      className={
        compact ? "" : overlay ? "card-lift max-h-[min(52vh,440px)] overflow-y-auto p-4 sm:p-5" : "card-lift p-5"
      }
    >
      {quiet ? null : overlay ? (
        <p className="mb-3 text-xs leading-5 text-ink/60">
          No buscamos anuncios: consultamos el Catastro. Calle y número, o la referencia de 14/20 caracteres.
        </p>
      ) : compact ? (
        <p className="mb-3 text-sm leading-6 text-ink/65">
          Escribe calle y número de Madrid capital, o pega la referencia catastral (14 o 20 caracteres). Si el Catastro
          no distingue la vía, te pedirá que elijas el tipo (calle, avenida…) y añadas el portal.
        </p>
      ) : (
        <p className="mb-3 text-sm leading-6 text-ink/65">
          No buscamos anuncios: consultamos el Catastro. Ejemplo: «Calle Embajadores 41». Si ya tienes la referencia
          catastral del contrato o del recibo, pégala aquí. Madrid capital únicamente.
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="search-q">
          Buscar inmueble
        </label>
        <div className="relative flex-1">
          <UiIcon
            icon={MagnifyingGlassIcon}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <input
            id="search-q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Calle Embajadores 41, o referencia catastral"
            className="w-full rounded-full border border-ink/15 bg-paper py-3 pl-10 pr-4 text-sm outline-none ring-wine/30 placeholder:text-ink/40 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-wine px-5 py-3 text-sm font-medium text-paper transition hover:bg-wine-dark disabled:opacity-60"
        >
          {loading ? "Consultando Catastro…" : "Buscar en Madrid"}
        </button>
      </form>
      {quiet ? null : (
        <p className={`${overlay ? "mt-2 text-[11px]" : "mt-3 text-xs"} leading-5 text-ink/50`}>
          Si ya tienes el CIF o el nombre de la agencia,{" "}
          <Link className="underline decoration-gold" href="/gestoras">
            busca la gestora
          </Link>
          : memoria vecinal más sociedades del RAIN. Nunca un DNI ni un colegiado.
        </p>
      )}
      {error ? <p className="mt-3 text-sm text-wine">{error}</p> : null}
      {result?.warning ? <p className="mt-3 text-sm text-sage">{result.warning}</p> : null}

      <AnimatePresence>
        {open ? (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
          >
            {result?.streets?.length ? (
              <ul className="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-paper">
                {result.streets.map((street) => (
                  <li key={`${street.type}-${street.name}-${street.code}`}>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-mist"
                      onClick={() => setQuery(`${street.type} ${street.name} `)}
                    >
                      <span className="font-medium">
                        {street.type} {street.name}
                      </span>
                      <span className="ml-2 text-ink/50">pulsa y añade el número de portal</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {result?.property ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-wine">
                    <UiIcon icon={BuildingsIcon} size="sm" className="text-wine" />
                    Finca catastral
                  </p>
                  <h2 className="font-display text-2xl">{heading}</h2>
                  <p className="text-sm text-ink/60">
                    Parcela {result.property.parcelRef}
                    {result.property.year ? ` · construida hacia ${result.property.year}` : ""}
                    {result.property.parcelKind ? ` · ${result.property.parcelKind}` : ""}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Inmuebles" icon={BuildingsIcon} value={String(units.length || 1)} />
                  <Stat label="Uso principal" value={prettyUse(result.property.use || units[0]?.use)} />
                  <Stat
                    label="Superficie Catastro"
                    icon={RulerIcon}
                    value={formatM2(result.property.areaM2 || units.reduce((sum, unit) => sum + (unit.areaM2 || 0), 0))}
                  />
                </div>
                <p className="text-sm leading-6 text-ink/70">
                  Superficie y uso oficiales. Si el anuncio dice más metros o vende un local como piso, fíate de esta
                  cifra: el Catastro no cuenta terraza ni trastero como vivienda.
                </p>
                {units.length > 1 ? (
                  <div className="overflow-hidden rounded-2xl border border-ink/10">
                    <table className="data-table w-full text-left text-sm">
                      <thead className="bg-mist text-ink/60">
                        <tr>
                          <th className="px-3 py-2 font-medium">Ref.</th>
                          <th className="px-3 py-2 font-medium">Uso</th>
                          <th className="px-3 py-2 font-medium">Planta</th>
                          <th className="px-3 py-2 font-medium">m²</th>
                        </tr>
                      </thead>
                      <tbody>
                        {units.slice(0, 12).map((unit) => (
                          <tr key={unit.ref} className="border-t border-ink/10">
                            <td className="px-3 py-2 font-mono text-xs">
                              <Link className="underline decoration-gold" href={`/inmueble/${unit.ref}`}>
                                {unit.ref}
                              </Link>
                            </td>
                            <td className="px-3 py-2">{prettyUse(unit.use)}</td>
                            <td className="px-3 py-2">{[unit.floor, unit.door].filter(Boolean).join(" · ") || "—"}</td>
                            <td className="px-3 py-2">{formatM2(unit.areaM2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {units.length > 12 ? (
                      <p className="bg-mist px-3 py-2 text-xs text-ink/60">Mostrando 12 de {units.length} inmuebles.</p>
                    ) : null}
                  </div>
                ) : null}
                <Link
                  href={`/inmueble/${result.property.ref}`}
                  className="inline-flex rounded-full bg-ink px-4 py-2 text-sm text-paper"
                >
                  Abrir ficha y memoria vecinal
                </Link>
              </div>
            ) : null}
          </m.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: Icon }) {
  return (
    <div className="rounded-2xl bg-mist px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-ink/50">
        {icon ? <UiIcon icon={icon} size="sm" /> : null}
        {label}
      </p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}
