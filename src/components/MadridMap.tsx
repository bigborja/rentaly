"use client";

import dynamic from "next/dynamic";
import type { Barrio } from "@/lib/types";

export type MapFrame = "card" | "bleed";

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-mist text-sm text-ink/60">
      Cargando mapa de Madrid…
    </div>
  ),
});

export function MadridMap(props: {
  statsByBarrio?: Record<string, { total: number; abuso: number }>;
  focus?: Barrio;
  className?: string;
  frame?: MapFrame;
  hint?: string;
  chrome?: boolean;
}) {
  return <MapCanvas {...props} />;
}
