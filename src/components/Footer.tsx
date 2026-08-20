import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="texture-ink border-t border-gold/20 text-paper">
      <div className="folio-rule opacity-70" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <p className="font-display text-2xl text-gold">Rentaly</p>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-paper/75">
            Transparencia para inquilinas e inquilinos de Madrid capital. Cruzamos el Catastro, los 131 barrios
            municipales y la memoria colectiva del alquiler. No somos un portal de anuncios: no listamos pisos ni
            cobramos comisión.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 uppercase tracking-[0.16em] text-gold/80">Recorrido</p>
          <ul className="space-y-2 text-paper/75">
            <li>
              <Link href="/como-funciona">Cómo funciona y glosario</Link>
            </li>
            <li>
              <Link href="/checklist">Antes de firmar</Link>
            </li>
            <li>
              <Link href="/registro">Crear cuenta</Link>
            </li>
            <li>
              <Link href="/derechos">Derechos y 112</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 uppercase tracking-[0.16em] text-gold/80">Aviso</p>
          <p className="text-paper/75 leading-6">
            Si estás en riesgo, llama al 112. Rentaly no sustituye denuncia, asesoría jurídica ni la Sede del Catastro.
            Los relatos vecinales no son titularidad.{" "}
            <Link href="/aviso-legal" className="underline decoration-gold/60">
              Aviso legal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
