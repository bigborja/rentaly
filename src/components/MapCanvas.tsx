"use client";

import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, WMSTileLayer, useMap } from "react-leaflet";
import type { Layer } from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { CATASTRO_WMS } from "@/clients/catastro/wms";
import type { Barrio } from "@/lib/types";

type Stats = Record<string, { total: number; abuso: number }>;

function FitBarrio({ barrio }: { barrio?: Barrio }) {
  const map = useMap();
  useEffect(() => {
    if (!barrio) return;
    const [west, south, east, north] = barrio.bbox;
    map.fitBounds(
      [
        [south, west],
        [north, east],
      ],
      { padding: [24, 24], maxZoom: 15 },
    );
  }, [barrio, map]);
  return null;
}

function ClickCatastro({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const onClick = async (event: { latlng: { lng: number; lat: number } }) => {
      const { lng, lat } = event.latlng;
      const response = await fetch(`/api/catastro/coords?lng=${lng}&lat=${lat}`);
      const data = await response.json();
      if (data.parcelRef) {
        router.push(`/inmueble/${data.parcelRef}`);
      }
    };
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [enabled, map, router]);
  return null;
}

export default function MapCanvas({
  statsByBarrio = {},
  focus,
  className,
}: {
  statsByBarrio?: Stats;
  focus?: Barrio;
  className?: string;
}) {
  const router = useRouter();
  const [geo, setGeo] = useState<GeoJsonObject | null>(null);
  const [catastro, setCatastro] = useState(false);
  const maxTotal = useMemo(
    () => Math.max(1, ...Object.values(statsByBarrio).map((item) => item.total)),
    [statsByBarrio],
  );

  useEffect(() => {
    fetch("/geo/barrios.geojson")
      .then((response) => response.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-ink/10 shadow-lift ${className || ""}`}>
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={12}
        minZoom={11}
        maxZoom={18}
        scrollWheelZoom
        className="h-[520px] w-full"
        maxBounds={[
          [40.3, -3.9],
          [40.57, -3.5],
        ]}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap · barrios Ayuntamiento de Madrid'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {catastro ? (
          <WMSTileLayer
            url={CATASTRO_WMS.url}
            layers={CATASTRO_WMS.layers}
            format={CATASTRO_WMS.format}
            transparent
            opacity={0.55}
            attribution={CATASTRO_WMS.attribution}
          />
        ) : null}
        {geo ? (
          <GeoJSON
            key={String(catastro)}
            data={geo}
            interactive={!catastro}
            style={(feature) => {
              const id = String(feature?.id || feature?.properties?.id || "");
              const total = statsByBarrio[id]?.total || 0;
              const abuso = statsByBarrio[id]?.abuso || 0;
              const t = total / maxTotal;
              return {
                color: focus?.id === id ? "#1c1712" : "#8f1d2c",
                weight: focus?.id === id ? 2.4 : 1,
                fillColor: abuso ? "#8f1d2c" : "#3f5e54",
                fillOpacity: 0.12 + t * 0.45,
              };
            }}
            onEachFeature={(feature: Feature, layer: Layer) => {
              const props = feature.properties as { name?: string; district?: string; slug?: string; id?: string };
              layer.bindPopup(
                `<strong>${props.name}</strong><br/>${props.district}<br/>${statsByBarrio[String(feature.id || props.id)]?.total || 0} aportes`,
              );
              layer.on("click", () => {
                if (!catastro && props.slug) router.push(`/barrios/${props.slug}`);
              });
            }}
          />
        ) : null}
        <FitBarrio barrio={focus} />
        <ClickCatastro enabled={catastro} />
      </MapContainer>
      <div className="absolute top-4 left-4 z-[400] max-w-xs rounded-2xl bg-paper/95 px-3 py-2 text-xs leading-5 text-ink/80 shadow-float">
        {catastro
          ? "Parcelas del Catastro activas: pulsa un edificio para abrir su ficha (metros, uso y memoria)."
          : "Pulsa un barrio para entrar. El verde se oscurece con más relatos; el vino marca avisos de abuso."}
      </div>
      <div className="absolute bottom-4 right-4 z-[400] space-y-1.5 rounded-2xl bg-paper/95 px-3 py-2 text-xs text-ink/75 shadow-float">
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sage" />
          Memoria vecinal
        </p>
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-wine" />
          Avisos de abuso
        </p>
      </div>
      <div className="absolute bottom-4 left-4 z-[400] flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={catastro}
          onClick={() => setCatastro((value) => !value)}
          className={`rounded-full px-3 py-2 text-xs shadow-float transition ${
            catastro ? "bg-gold text-ink" : "bg-ink/90 text-paper"
          }`}
        >
          {catastro ? "Parcelas Catastro · activas" : "Activar parcelas del Catastro"}
        </button>
      </div>
    </div>
  );
}
