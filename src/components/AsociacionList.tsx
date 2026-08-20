import { UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { UiIcon } from "@/components/UiIcon";
import { directorioAsociaciones, labelTipoAsociacion, type Asociacion } from "@/lib/getAsociacion";

function contactLabel(org: Asociacion) {
  if (org.tipo === "federacion") return "Abrir directorio FRAVM";
  if (org.tipo === "coordinadora") return "Ver asambleas";
  if (org.canal_telegram.includes("t.me")) return "Unirse al grupo";
  return "Contactar";
}

export function AsociacionList() {
  const sections = directorioAsociaciones();

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`apoyo-${section.id}`}>
          <h3 id={`apoyo-${section.id}`} className="font-display text-2xl">
            {section.title}
          </h3>
          <ul className="mt-4 space-y-3">
            {section.items.map((org) => (
              <li key={org.id} className="card p-5">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-gold">
                  <UiIcon icon={UsersThreeIcon} size="sm" className="text-gold" />
                  {labelTipoAsociacion(org)}
                  {org.distritos_cubiertos.length > 0 ? ` · ${org.distritos_cubiertos.join(", ")}` : " · Madrid"}
                </p>
                <h4 className="mt-2 font-display text-xl leading-tight">{org.nombre}</h4>
                <p className="mt-2 text-sm leading-6 text-ink/70">{org.horario_reunion}</p>
                <a
                  className="mt-3 inline-flex text-sm font-medium underline decoration-gold"
                  href={org.canal_telegram}
                  target="_blank"
                  rel="noreferrer"
                >
                  {contactLabel(org)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
