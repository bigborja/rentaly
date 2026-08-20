"use client";

import { useMemo, useState } from "react";
import { LETTERS, type LetterContext } from "@/lib/letter-templates";
import { EMERGENCY_NUMBER, SAV_MADRID, SINDICATO_INQUILINAS } from "@/lib/official";
import { CopyText } from "@/components/CopyText";
import { UiIcon } from "@/components/UiIcon";
import { ChatTeardropTextIcon, ScalesIcon, WarningIcon } from "@phosphor-icons/react/ssr";

export function ActPanel(ctx: LetterContext) {
  const [active, setActive] = useState<(typeof LETTERS)[number]["id"]>("metros");
  const letter = useMemo(() => LETTERS.find((item) => item.id === active) || LETTERS[0], [active]);
  const text = letter.build(ctx);

  return (
    <section className="mt-14 overflow-hidden rounded-3xl border border-ink/10 bg-white/80 shadow-rest">
      <div className="border-b border-ink/10 bg-mist/70 px-5 py-4">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink/50">
          <UiIcon icon={ChatTeardropTextIcon} size="sm" />
          Un acto, no más prosa
        </p>
        <h2 className="mt-1 font-display text-3xl">Pídelo por escrito y, si hace falta, cita</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Rentaly no tramita denuncias ni da asesoramiento jurídico. Copia un modelo, pégalo en correo o WhatsApp, y
          guarda la respuesta. Si el caso se sale de la ficha, SAV Madrid o el sindicato.
        </p>
      </div>
      <div className="grid gap-0 md:grid-cols-[minmax(0,14rem)_1fr]">
        <ul className="border-b border-ink/10 md:border-b-0 md:border-r">
          {LETTERS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(item.id)}
                className={`w-full px-5 py-4 text-left text-sm ${
                  active === item.id ? "bg-ink text-paper" : "text-ink/75 hover:bg-mist/80"
                }`}
              >
                <span className="block font-medium">{item.title}</span>
                <span className={`mt-1 block text-xs leading-5 ${active === item.id ? "text-paper/70" : "text-ink/50"}`}>
                  {item.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-5 py-5">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-ink/80">{text}</pre>
          <CopyText text={text} label="Copiar este texto" className="btn btn-ink mt-4" />
        </div>
      </div>
      <div className="grid gap-3 border-t border-ink/10 bg-mist/50 px-5 py-4 sm:grid-cols-3">
        <a className="rounded-2xl bg-white/80 px-4 py-3 text-sm" href={SAV_MADRID.href} target="_blank" rel="noreferrer">
          <p className="flex items-center gap-2 font-medium">
            <UiIcon icon={ScalesIcon} size="sm" />
            Cita SAV Madrid
          </p>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            {SAV_MADRID.phone} · asesoramiento gratuito. Rentaly no pide la cita.
          </p>
        </a>
        <a
          className="rounded-2xl bg-white/80 px-4 py-3 text-sm"
          href={SINDICATO_INQUILINAS.defendHref}
          target="_blank"
          rel="noreferrer"
        >
          <p className="font-medium">{SINDICATO_INQUILINAS.title}</p>
          <p className="mt-1 text-xs leading-5 text-ink/55">{SINDICATO_INQUILINAS.detail}</p>
        </a>
        <p className="rounded-2xl bg-wine px-4 py-3 text-sm text-paper">
          <span className="flex items-center gap-2 font-medium">
            <UiIcon icon={WarningIcon} size="sm" className="text-paper" />
            Urgencia
          </span>
          <span className="mt-1 block text-xs leading-5 text-paper/80">
            Delito o riesgo: {EMERGENCY_NUMBER}. Un aviso aquí no abre un procedimiento.
          </span>
        </p>
      </div>
    </section>
  );
}
