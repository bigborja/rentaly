import Link from "next/link";
import { EmptyStamp } from "@/components/illustrations";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <EmptyStamp className="mx-auto w-28 text-wine/70" />
      <p className="mt-5 text-xs uppercase tracking-[0.18em] text-wine">404</p>
      <h1 className="mt-3 font-display text-4xl">No está en el mapa</h1>
      <p className="mt-3 text-ink/70">
        Esa finca, barrio o página no existe, la dirección está mal escrita o el Catastro no ha devuelto nada. Prueba
        calle y número en la portada, o entra en un barrio y busca desde ahí. Rentaly cubre Madrid capital.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex rounded-full bg-wine px-4 py-2 text-paper shadow-lift">
          Buscar una dirección
        </Link>
        <Link href="/barrios" className="inline-flex rounded-full border border-ink/15 px-4 py-2">
          Ver barrios
        </Link>
        <Link href="/como-funciona" className="inline-flex rounded-full border border-ink/15 px-4 py-2">
          Cómo funciona
        </Link>
      </div>
    </div>
  );
}
