"use client";

import dynamic from "next/dynamic";
import type { Barrio } from "@/lib/types";

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-[28px] bg-mist text-sm text-ink/60">
      Cargando mapa de barrios…
    </div>
  ),
});

export function MadridMap(props: {
  statsByBarrio?: Record<string, { total: number; abuso: number }>;
  focus?: Barrio;
  className?: string;
}) {
  return <MapCanvas {...props} />;
}
