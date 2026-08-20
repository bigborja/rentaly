import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cómo funciona" };

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="kicker">Identidad</p>
      <h1 className="mt-2 font-display text-5xl">No somos un portal de pisos.</h1>
      <p className="mt-4 leading-7 text-ink/75">
        Idealista y Fotocasa venden inventario. Rentaly ilumina el contrato. La propuesta de valor es la de Reviu en
        Catalunya y de JustFix en Nueva York: menos asimetría, más datos públicos, más memoria de quien habita.
      </p>

      <ol className="mt-10 space-y-6">
        <Step n="01" title="Antes de firmar">
          Buscas la dirección en el Catastro, comparas metros y uso con el anuncio, y lees el barrio. Hay una lista
          corta, al estilo de las herramientas de JustFix: una tarea, no un feed infinito.
        </Step>
        <Step n="02" title="Durante el contrato">
          Si hay humedad, calefacción cortada o una visita sin aviso, lo dejas como incidente. Si hay abuso, como aviso.
          El vino del diseño se reserva para eso: Shelter aprendió que pintar toda la web de alarma solo estresa.
        </Step>
        <Step n="03" title="Para quien viene detrás">
          Como Reviu: ¿se lo recomendarías a una amiga? El relato es anónimo en público. La cuenta existe para poder
          verificar, no para exhibirte.
        </Step>
      </ol>

      <div className="card mt-10 bg-ink p-6 text-paper">
        <h2 className="font-display text-2xl text-gold">De dónde sale el diseño</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-paper/75">
          <li>
            <strong>Reviu (IDRA, Barcelona):</strong> búsqueda por dirección + Catastro, reseña estructurada, apodo
            público y correo privado.
          </li>
          <li>
            <strong>JustFix / Who Owns What:</strong> herramientas con un trabajo claro, datos oficiales, “no es
            asesoramiento jurídico”.
          </li>
          <li>
            <strong>Shelter (UK):</strong> tono calmado, rojo solo en lo urgente, frases cortas, mobile first.
          </li>
          <li>
            <strong>Sindicato de Inquilinas de Madrid:</strong> el aviso no sustituye organizarse ni denunciar.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/registro" className="btn btn-primary">
          Crear cuenta
        </Link>
        <Link href="/checklist" className="btn btn-ghost">
          Empezar la lista
        </Link>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="card p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">{n}</p>
      <h2 className="mt-1 font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/75">{children}</p>
    </li>
  );
}
