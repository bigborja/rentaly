"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ITEMS = [
  {
    id: "catastro",
    title: "Metros y uso del Catastro",
    body: "Busca la calle y el portal. Si el anuncio dice 78 m² y la ficha baja a 61, o el uso es comercial, para y pregunta por escrito.",
    href: "/",
  },
  {
    id: "contrato",
    title: "Contrato de vivienda, no de temporada fingida",
    body: "Si vas a vivir ahí de forma habitual, el papel no debería ser de 11 meses “por estudios” sin causa real.",
  },
  {
    id: "fianza",
    title: "Fianza de un mes",
    body: "En vivienda habitual la fianza legal es una mensualidad. Cualquier extra debe estar identificado, no escondido como reserva.",
  },
  {
    id: "honorarios",
    title: "Honorarios de quien encarga",
    body: "La intermediación de vivienda no debería cargarte a ti los honorarios de la agencia. Pídelo desglosado.",
  },
  {
    id: "memoria",
    title: "Memoria del barrio y de la finca",
    body: "Lee experiencias e incidentes. Una sola reseña no es una sentencia; un patrón sí es una señal.",
    href: "/barrios",
  },
  {
    id: "entrada",
    title: "Inventario de entrada con fotos",
    body: "Fecha, estado, lecturas. Shelter y los sindicatos coinciden: el papel de entrada es tu mejor prueba después.",
  },
  {
    id: "escrito",
    title: "Todo lo verbal, por escrito",
    body: "WhatsApp vale más que una promesa en la visita. “Ya lo arreglamos” sin fecha no existe.",
  },
  {
    id: "emergencia",
    title: "Si hay delito o riesgo",
    body: "112 y denuncia oficial. Rentaly es memoria, no juzgado.",
    href: "/derechos",
  },
];

export function Checklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rentaly-checklist");
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function toggle(id: string) {
    setDone((current) => {
      const next = { ...current, [id]: !current[id] };
      localStorage.setItem("rentaly-checklist", JSON.stringify(next));
      return next;
    });
  }

  const count = ITEMS.filter((item) => done[item.id]).length;

  return (
    <div>
      <p className="text-sm text-ink/60">
        {count} de {ITEMS.length} listas. No hace falta terminarlas todas el mismo día.
      </p>
      <ul className="mt-6 space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id} className="card p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={Boolean(done[item.id])} onChange={() => toggle(item.id)} className="mt-1.5" />
              <span>
                <span className="block font-display text-2xl">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-ink/70">{item.body}</span>
                {item.href ? (
                  <Link href={item.href} className="mt-2 inline-block text-sm underline decoration-gold">
                    Ir ahora
                  </Link>
                ) : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
