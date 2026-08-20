"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { BuildingsIcon, MagnifyingGlassIcon, MapTrifoldIcon } from "@phosphor-icons/react/ssr";
import { SearchPanel } from "@/components/SearchPanel";
import { UiIcon } from "@/components/UiIcon";

type Path = "direccion" | "gestora" | "mapa";

const PATHS: { id: Path; label: string; hint: string; icon: typeof MagnifyingGlassIcon }[] = [
  {
    id: "direccion",
    label: "Tengo una dirección",
    hint: "Calle y número, o la referencia catastral del contrato.",
    icon: MagnifyingGlassIcon,
  },
  {
    id: "gestora",
    label: "Busco la agencia",
    hint: "CIF o razón social. Nunca un DNI ni un colegiado.",
    icon: BuildingsIcon,
  },
  {
    id: "mapa",
    label: "Conozco el barrio",
    hint: "Pulsa el plano de Madrid: 131 barrios oficiales.",
    icon: MapTrifoldIcon,
  },
];

export function WelcomeSearch() {
  const [path, setPath] = useState<Path>("direccion");
  const active = PATHS.find((item) => item.id === path) || PATHS[0];

  return (
    <div className="card-lift p-4 sm:p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-wine">Empieza por aquí</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {PATHS.map((item) => {
          const selected = item.id === path;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setPath(item.id)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                selected ? "border-wine bg-wine text-paper shadow-rest" : "border-ink/10 bg-paper hover:border-gold"
              }`}
            >
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <UiIcon icon={item.icon} size="sm" className={selected ? "text-gold" : "text-wine"} />
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/65">{active.hint}</p>
      <AnimatePresence mode="wait">
        <m.div
          key={path}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-4"
        >
          {path === "direccion" ? <SearchPanel compact quiet /> : null}
          {path === "gestora" ? <GestoraQuickSearch /> : null}
          {path === "mapa" ? (
            <div>
              <p className="text-sm leading-6 text-ink/70">
                El plano está más abajo y no se come el scroll. Si conoces el nombre, entra por la lista; si quieres
                panear, pulsa «Usar el mapa».
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="#mapa" className="btn btn-ink">
                  Ver el mapa de Madrid
                </a>
                <Link href="/barrios" className="btn btn-ghost">
                  Lista de barrios
                </Link>
              </div>
            </div>
          ) : null}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

function GestoraQuickSearch() {
  return (
    <form action="/gestoras" method="get" className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="home-gestora-q">
        Buscar gestora
      </label>
      <div className="relative flex-1">
        <UiIcon
          icon={BuildingsIcon}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
        />
        <input
          id="home-gestora-q"
          name="q"
          placeholder="B84259167 o Avance Desarrollo…"
          className="w-full rounded-full border border-ink/15 bg-paper py-3 pl-10 pr-4 text-sm outline-none ring-wine/30 placeholder:text-ink/40 focus:ring-2"
        />
      </div>
      <button type="submit" className="rounded-full bg-wine px-5 py-3 text-sm font-medium text-paper">
        Buscar gestora
      </button>
    </form>
  );
}
