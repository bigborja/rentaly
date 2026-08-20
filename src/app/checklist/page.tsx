import type { Metadata } from "next";
import { Checklist } from "@/components/Checklist";
import { SearchPanel } from "@/components/SearchPanel";
import { Guide, Steps } from "@/components/Guide";
import { UiIcon } from "@/components/UiIcon";
import { ListChecks } from "lucide-react";

export const metadata: Metadata = { title: "Antes de firmar" };

export default function ChecklistPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="kicker flex items-center gap-2">
        <UiIcon icon={ListChecks} size="sm" className="text-wine" />
        Antes de firmar el contrato
      </p>
      <h1 className="mt-2 font-display text-5xl">Antes de firmar</h1>
      <p className="mt-4 leading-7 text-ink/75">
        Una lista breve para no pagar por metros inflados, un contrato de temporada disfrazado o una fianza que no es
        fianza. Márcala en el teléfono mientras ves el anuncio. Se guarda aquí, no en tu cuenta.
      </p>
      <div className="mt-6">
        <Guide title="Cómo usarla con un anuncio abierto">
          <Steps
            items={[
              {
                title: "Busca la dirección en el Catastro",
                body: "Compara metros y uso con lo que dice el portal. Si no coinciden, pregunta por escrito antes de reservar.",
              },
              {
                title: "Tacha cada punto de la lista",
                body: "Fianza de un mes en vivienda habitual, honorarios de quien encarga, contrato de vivienda (no de 11 meses fingidos), inventario de entrada.",
              },
              {
                title: "Si algo no encaja, no firmes el mismo día",
                body: "WhatsApp vale más que una promesa en la visita. Si hay delito o riesgo, 112. Rentaly no es un juzgado.",
              },
            ]}
          />
        </Guide>
      </div>
      <div className="mt-8">
        <h2 className="mb-3 font-display text-2xl">1. Contrasta la dirección</h2>
        <p className="mb-3 text-sm text-ink/65">
          Calle y número de Madrid capital, o la referencia catastral si ya la tienes.
        </p>
        <SearchPanel />
      </div>
      <div className="mt-10">
        <h2 className="mb-3 font-display text-2xl">2. Marca lo que ya has comprobado</h2>
        <Checklist />
      </div>
    </div>
  );
}
