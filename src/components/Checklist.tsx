"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react/ssr";

const ITEMS = [
  {
    id: "catastro",
    title: "Metros y uso del Catastro",
    body: "Busca la calle y el portal arriba. Si el anuncio dice 78 m² y la ficha baja a 61, o el uso es comercial, para y pregunta por escrito. El Catastro no es un tasador, pero sí un ancla.",
    href: "/",
  },
  {
    id: "contrato",
    title: "Contrato de vivienda, no de temporada fingida",
    body: "Si vas a vivir ahí de forma habitual, el papel no debería ser de 11 meses «por estudios» o «uso distinto» sin causa real. Pide el modelo de contrato antes de transferir.",
  },
  {
    id: "fianza",
    title: "Fianza de un mes",
    body: "En vivienda habitual la fianza legal es una mensualidad. Cualquier extra (garantía, reserva, «señal») debe estar identificado por escrito, no escondido en el mismo ingreso.",
  },
  {
    id: "honorarios",
    title: "Honorarios de quien encarga",
    body: "En alquiler de vivienda, los honorarios de la agencia corresponden a quien encarga el servicio, normalmente la propiedad. Pídelo desglosado y no lo pagues en efectivo sin recibo.",
  },
  {
    id: "memoria",
    title: "Memoria del barrio y de la finca",
    body: "Lee experiencias e incidentes del barrio y, si puedes, de la finca. Una sola reseña no es una sentencia; varias sobre la misma gestora o el mismo portal sí son una señal.",
    href: "/barrios",
  },
  {
    id: "entrada",
    title: "Inventario de entrada con fotos",
    body: "Fecha, estado de cada estancia, lecturas de suministros y fotos. Ese papel es tu mejor prueba si luego discuten la fianza.",
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
        {count} de {ITEMS.length} comprobadas. Se guardan en este navegador. No hace falta terminarlas todas el mismo
        día.
      </p>
      <ul className="mt-6 space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id} className={`card p-5 ${done[item.id] ? "opacity-80" : ""}`}>
            <label className="flex cursor-pointer items-start gap-3">
              <span className="mt-1 text-ink/40">
                {done[item.id] ? (
                  <CheckCircleIcon size={20} weight="fill" className="h-5 w-5 text-sage" aria-hidden />
                ) : (
                  <CircleIcon size={20} weight="duotone" className="h-5 w-5" aria-hidden />
                )}
              </span>
              <input
                type="checkbox"
                checked={Boolean(done[item.id])}
                onChange={() => toggle(item.id)}
                className="sr-only"
              />
              <span>
                <span className={`block font-display text-2xl ${done[item.id] ? "text-ink/45 line-through" : ""}`}>
                  {item.title}
                </span>
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
