import { CAF_MADRID, COAPI_MADRID } from "@/lib/official";

export function ColegioDisclaimer() {
  return (
    <aside className="mt-12 border-t border-ink/10 pt-6 text-xs leading-6 text-ink/55">
      <p className="uppercase tracking-[0.16em] text-ink/40">Colegios profesionales</p>
      <p className="mt-2">
        Si lo que quieres comprobar es si una persona está colegiada, el censo oficial no está aquí: está en el colegio.
        El CAF Madrid avisa de que los datos personales de ese listado no pueden reutilizarse con fines comerciales.
        Por eso Rentaly enlaza y no copia nombres, números de colegiado ni correos. Una inscripción colegial no es una
        nota de trato; la memoria vecinal de una sociedad (CIF) va aparte.
      </p>
      <ul className="mt-3 space-y-1">
        <li>
          <a className="underline decoration-gold" href={CAF_MADRID.href} target="_blank" rel="noreferrer">
            {CAF_MADRID.title}
          </a>
        </li>
        <li>
          <a className="underline decoration-gold" href={COAPI_MADRID.href} target="_blank" rel="noreferrer">
            {COAPI_MADRID.title}
          </a>
        </li>
      </ul>
    </aside>
  );
}
