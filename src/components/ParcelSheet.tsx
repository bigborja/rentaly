"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import type { ParcelPeek } from "@/domain/peek";
import { ParcelScorecard, ParcelScorecardSkeleton } from "@/components/ParcelScorecard";
import { CopyText } from "@/components/CopyText";

export type ParcelHit = {
  parcelRef: string;
  address?: string;
};

export function ParcelSheet({
  hit,
  onClose,
}: {
  hit: ParcelHit | null;
  onClose: () => void;
}) {
  const open = Boolean(hit);
  const [peek, setPeek] = useState<ParcelPeek | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hit) {
      setPeek(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setPeek(null);
    setError(null);
    fetch(`/api/peek/${hit.parcelRef}`)
      .then(async (response) => {
        const data = (await response.json()) as ParcelPeek & { error?: string };
        if (!response.ok) throw new Error(data.error || "No se ha podido armar la ficha.");
        if (!cancelled) setPeek(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al consultar el Catastro.");
      });
    return () => {
      cancelled = true;
    };
  }, [hit]);

  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && onClose()} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[70] bg-ink/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[88vh] flex-col rounded-t-[28px] border border-ink/10 bg-paper pb-[env(safe-area-inset-bottom)] shadow-lift outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-ink/20" />
          <div className="overflow-y-auto px-4 pb-8 pt-4">
            <p className="text-xs uppercase tracking-[0.14em] text-wine">Parcela · datos no protegidos</p>
            <Drawer.Title className="mt-1 font-display text-3xl leading-tight">
              {peek?.address || hit?.address || "Finca"}
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              Metros del Catastro, licencias turísticas y memoria vecinal de esta parcela. No incluye dueños particulares.
            </Drawer.Description>
            {peek?.barrio ? (
              <Link className="mt-1 inline-block text-sm underline decoration-gold" href={`/barrios/${peek.barrio.slug}`}>
                {peek.barrio.name} · {peek.barrio.district}
              </Link>
            ) : null}
            <div className="mt-4">
              {error ? <p className="text-sm text-wine">{error}</p> : null}
              {!error && !peek ? <ParcelScorecardSkeleton /> : null}
              {peek ? <ParcelScorecard peek={peek} /> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {hit ? (
                <Link href={`/inmueble/${hit.parcelRef}`} className="btn btn-ink">
                  Ficha completa
                </Link>
              ) : null}
              {hit ? (
                <Link href={`/aportar?ref=${hit.parcelRef}`} className="btn btn-primary">
                  Dejar memoria
                </Link>
              ) : null}
              {hit ? <CopyText text={hit.parcelRef} label="Copiar RC" className="btn btn-ghost" /> : null}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
