import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-gold">Rentaly</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-paper/75">
            Transparencia para inquilinas e inquilinos de Madrid capital. Cruzamos el Catastro, los barrios
            municipales y la memoria colectiva del alquiler.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 uppercase tracking-[0.16em] text-gold/80">Fuentes</p>
          <ul className="space-y-2 text-paper/75">
            <li>Dirección General del Catastro</li>
            <li>Ayuntamiento de Madrid · límites de barrios</li>
            <li>Aportes de la comunidad, no verificados uno a uno</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 uppercase tracking-[0.16em] text-gold/80">Aviso</p>
          <p className="text-paper/75 leading-6">
            Si estás en riesgo, llama al 112. Rentaly no sustituye denuncia, asesoría jurídica ni la Sede del
            Catastro.{" "}
            <Link href="/aviso-legal" className="underline decoration-gold/60">
              Aviso legal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
