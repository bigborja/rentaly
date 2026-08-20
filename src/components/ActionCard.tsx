import { MegaphoneIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { UiIcon } from "@/components/UiIcon";
import { findAsociacionByDistrito, type Asociacion } from "@/lib/getAsociacion";

export function ActionCard({
  distrito,
  asociacion,
}: {
  distrito: string;
  asociacion?: Asociacion;
}) {
  const org = asociacion ?? findAsociacionByDistrito(distrito);
  const telegram = org.canal_telegram.includes("t.me");

  return (
    <article className="card-lift overflow-hidden">
      <div className="grid sm:grid-cols-[minmax(0,11rem)_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 bg-sage/15 px-6 py-7 text-sage">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-rest">
            <UiIcon icon={MegaphoneIcon} size="lg" weight="duotone" className="text-sage" />
          </span>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em]">
            <UiIcon icon={UsersThreeIcon} size="sm" className="text-sage" />
            Apoyo vecinal
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="kicker">No estás sola</p>
          <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{org.nombre}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink/75">
            Si tienes problemas con tu alquiler en {distrito}, tus vecinos pueden ayudarte.
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/60">{org.horario_reunion}</p>
          <a
            className="btn btn-primary mt-5"
            href={org.canal_telegram}
            target="_blank"
            rel="noreferrer"
          >
            Contactar / Unirse al grupo
          </a>
          <p className="mt-3 text-xs leading-5 text-ink/50">
            Rentaly no gestiona ese grupo ni toma el caso. {telegram ? "El enlace abre Telegram." : "El enlace abre su página de contacto."} Horarios y local pueden cambiar: confírmalos ahí.
          </p>
        </div>
      </div>
    </article>
  );
}
