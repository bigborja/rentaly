"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { formatM2, prettyUse } from "@/lib/format";

export function SearchPanel({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
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

  return (
    <section className={compact ? "" : "card p-5"}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="search-q">
          Buscar inmueble
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
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
      {error ? <p className="mt-3 text-sm text-wine">{error}</p> : null}
      {result?.warning ? <p className="mt-3 text-sm text-sage">{result.warning}</p> : null}

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
                <span className="ml-2 text-ink/50">añade el número de portal</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {result?.property ? (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-wine">Finca catastral</p>
            <h2 className="font-display text-2xl">{heading}</h2>
            <p className="text-sm text-ink/60">
              Parcela {result.property.parcelRef}
              {result.property.year ? ` · construida hacia ${result.property.year}` : ""}
              {result.property.parcelKind ? ` · ${result.property.parcelKind}` : ""}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Inmuebles" value={String(units.length || 1)} />
            <Stat label="Uso principal" value={prettyUse(result.property.use || units[0]?.use)} />
            <Stat
              label="Superficie"
              value={formatM2(result.property.areaM2 || units.reduce((sum, unit) => sum + (unit.areaM2 || 0), 0))}
            />
          </div>
          {units.length > 1 ? (
            <div className="overflow-hidden rounded-2xl border border-ink/10">
              <table className="w-full text-left text-sm">
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
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}
