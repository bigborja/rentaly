import type { Metadata } from "next";
import { officialLinks } from "@/lib/format";
import { Guide, Steps } from "@/components/Guide";
import { UiIcon } from "@/components/UiIcon";
import { ScalesIcon } from "@phosphor-icons/react/ssr";

export const metadata: Metadata = { title: "Derechos y recursos" };

const points = [
  {
    title: "Contrato de vivienda habitual",
    body: "La Ley de Arrendamientos Urbanos (LAU) es el marco del alquiler de vivienda. Desconfía si el anuncio es de vivienda y el papel que te ponen es de temporada, plaza turística o 'uso distinto' sin causa real.",
  },
  {
    title: "Fianza",
    body: "En vivienda habitual la fianza legal es una mensualidad (dos en uso distinto). Cualquier cantidad extra debería estar identificada (garantía adicional) y no confundirse con la fianza que se deposita en el organismo autonómico.",
  },
  {
    title: "Honorarios de intermediación",
    body: "La Ley 12/2023 de vivienda atribuye, en los alquileres de vivienda, los honorarios de gestión inmobiliaria a la parte que encarga el servicio, normalmente la propiedad. Si te los cargan a ti, pídelo por escrito y consulta antes de pagar.",
  },
  {
    title: "Entrada a la vivienda",
    body: "El piso es tu domicilio. La propiedad no puede entrar con copia de llave 'a ver cómo está' sin consentimiento, salvo urgencia. Exígelo por escrito.",
  },
  {
    title: "Metros y uso",
    body: "El Catastro no es un tasador, pero sí un ancla: uso (vivienda, comercio, oficina), superficie y año. Si el anuncio infla metros o vende un local como piso, salta la alarma.",
  },
  {
    title: "Actualización de renta",
    body: "La cláusula de subida no puede ser un porcentaje caprichoso al margen de la normativa vigente. Conserva el contrato y los recibos.",
  },
];

export default function DerechosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wine">
        <UiIcon icon={ScalesIcon} size="sm" className="text-wine" />
        No es asesoramiento jurídico
      </p>
      <h1 className="mt-2 font-display text-5xl">Derechos para no firmar a ciegas</h1>
      <p className="mt-4 leading-7 text-ink/75">
        Rentaly resume puntos que suelen aparecer en abusos de alquiler en Madrid. No es un despacho ni sustituye el
        BOE, la Oficina de Vivienda, un sindicato o un abogado. Úsalo para saber qué preguntar por escrito antes de
        firmar o de pagar. En emergencia, 112.
      </p>
      <div className="mt-6">
        <Guide title="Si algo del contrato no te encaja">
          <Steps
            items={[
              {
                title: "No firmes el mismo día",
                body: "Pide el modelo de contrato, el desglose de fianza y honorarios, y las cláusulas de actualización por escrito (correo o WhatsApp valen).",
              },
              {
                title: "Contrasta metros y uso",
                body: "Abre la dirección en Rentaly o en la sede del Catastro. Si el anuncio infla metros o vende un local como piso, esa es una señal de alarma.",
              },
              {
                title: "Si hay riesgo o delito, canales oficiales",
                body: "112 y denuncia. Un aviso en esta web no abre un procedimiento. El listado de abajo enlaza oficinas y normas.",
              },
            ]}
          />
        </Guide>
      </div>
      <div className="mt-10 space-y-5">
        {points.map((point) => (
          <article key={point.title} className="rounded-3xl border border-ink/10 bg-white/70 p-5">
            <h2 className="font-display text-2xl">{point.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/75">{point.body}</p>
          </article>
        ))}
      </div>
      <h2 className="mt-12 font-display text-3xl">Canales oficiales</h2>
      <p className="mt-2 text-sm text-ink/65">
        Estas sedes son la fuente. Rentaly solo las enlaza; no tramitamos ayudas ni denuncias.
      </p>
      <ul className="mt-4 space-y-3">
        {officialLinks().map((link) => (
          <li key={link.href} className="rounded-2xl bg-mist px-4 py-3">
            <a className="font-medium underline decoration-gold" href={link.href} target="_blank" rel="noreferrer">
              {link.title}
            </a>
            <p className="text-sm text-ink/65">{link.detail}</p>
          </li>
        ))}
        <li className="rounded-2xl bg-ink px-4 py-3 text-paper">
          <p className="font-medium text-gold">Urgencias y delito</p>
          <p className="text-sm text-paper/75">112 · Policía Nacional · Guardia Civil · juzgado de guardia</p>
        </li>
      </ul>
    </div>
  );
}
