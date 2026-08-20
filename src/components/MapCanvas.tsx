"use client";

import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, WMSTileLayer, useMap } from "react-leaflet";
import type { Layer } from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CATASTRO_WMS } from "@/clients/catastro/wms";
import type { Barrio } from "@/lib/types";
import { ParcelSheet, type ParcelHit } from "@/components/ParcelSheet";

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

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const refresh = () => map.invalidateSize();
    const timer = window.setTimeout(refresh, 80);
    window.addEventListener("resize", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", refresh);
    };
  }, [map]);
  return null;
}


function ClickCatastro({
  enabled,
  onSelect,
}: {
  enabled: boolean;
  onSelect: (hit: ParcelHit) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    const onClick = async (event: { latlng: { lng: number; lat: number } }) => {
      const { lng, lat } = event.latlng;
      try {
        const response = await fetch(`/api/catastro/coords?lng=${lng}&lat=${lat}`);
        const data = (await response.json()) as { parcelRef?: string; address?: string; error?: string };
        if (!response.ok || !data.parcelRef) {
          toast.error(data.error || "No hay parcela en ese punto.");
          return;
        }
        onSelect({ parcelRef: data.parcelRef, address: data.address });
      } catch {
        toast.error("No se ha podido consultar el Catastro.");
      }
    };
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [enabled, map, onSelect]);
  return null;
}

export default function MapCanvas({
  statsByBarrio = {},
  focus,
  className,
  frame = "card",
  hint,
  chrome = true,
}: {
  statsByBarrio?: Stats;
  focus?: Barrio;
  className?: string;
  frame?: "card" | "bleed";
  hint?: string;
  chrome?: boolean;
}) {
  const router = useRouter();
  const [geo, setGeo] = useState<GeoJsonObject | null>(null);
  const [catastro, setCatastro] = useState(false);
  const [hit, setHit] = useState<ParcelHit | null>(null);
  const maxTotal = useMemo(
    () => Math.max(1, ...Object.values(statsByBarrio).map((item) => item.total)),
    [statsByBarrio],
  );
  const bleed = frame === "bleed";

  useEffect(() => {
    fetch("/geo/barrios.geojson")
      .then((response) => response.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  const defaultHint = catastro
    ? "Parcelas del Catastro: pulsa un edificio. Sale una hoja; SERPAVI, IRAV y el escrito están en la ficha completa."
    : "Pulsa un barrio para entrar. Para un portal concreto, activa parcelas del Catastro.";

  return (
    <div
      className={
        bleed
          ? `relative h-full min-h-[420px] overflow-hidden ${className || ""}`
          : `relative overflow-hidden rounded-[28px] border border-ink/10 shadow-lift ${className || ""}`
      }
    >
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={12}
        minZoom={11}
        maxZoom={18}
        scrollWheelZoom
        className={bleed ? "h-full w-full min-h-[420px]" : "h-[min(62vh,560px)] w-full min-h-[420px]"}
        maxBounds={[
          [40.3, -3.9],
          [40.57, -3.5],
        ]}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap · barrios Ayuntamiento de Madrid"
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
        <InvalidateSize />
        <FitBarrio barrio={focus} />
        <ClickCatastro enabled={catastro} onSelect={setHit} />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-[400]">
        {chrome ? (
          <>
            <div className="pointer-events-auto absolute left-4 top-4 max-w-xs rounded-2xl bg-paper/95 px-3 py-2 text-xs leading-5 text-ink/80 shadow-float">
              {hint || defaultHint}
            </div>
            <div className="pointer-events-auto absolute right-4 top-4 space-y-1.5 rounded-2xl bg-paper/95 px-3 py-2 text-xs text-ink/75 shadow-float">
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sage" />
                Memoria vecinal
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-wine" />
                Avisos de abuso
              </p>
            </div>
          </>
        ) : null}
        <button
          type="button"
          aria-pressed={catastro}
          onClick={() => setCatastro((value) => !value)}
          className={`pointer-events-auto absolute bottom-4 left-4 rounded-full px-3 py-2 text-xs shadow-float transition ${
            catastro ? "bg-gold text-ink" : "bg-ink/90 text-paper"
          }`}
        >
          {catastro ? "Parcelas Catastro · activas" : "Activar parcelas del Catastro"}
        </button>
      </div>
      <ParcelSheet hit={hit} onClose={() => setHit(null)} />
    </div>
  );
}
