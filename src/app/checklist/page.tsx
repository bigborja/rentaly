import type { Metadata } from "next";
import { Checklist } from "@/components/Checklist";
import { SearchPanel } from "@/components/SearchPanel";

export const metadata: Metadata = { title: "Antes de firmar" };

export default function ChecklistPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="kicker">Tarea · como JustFix parte de un trabajo concreto</p>
      <h1 className="mt-2 font-display text-5xl">Antes de firmar</h1>
      <p className="mt-4 leading-7 text-ink/75">
        Una lista breve para no pagar por metros inflados, un contrato de temporada disfrazado o una fianza que no es
        fianza. Márcala en el teléfono mientras ves el anuncio.
      </p>
      <div className="mt-8">
        <SearchPanel />
      </div>
      <div className="mt-10">
        <Checklist />
      </div>
    </div>
  );
}
