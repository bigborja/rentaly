import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-wine">404</p>
      <h1 className="mt-3 font-display text-4xl">No está en el mapa</h1>
      <p className="mt-3 text-ink/70">Esa finca, barrio o página no existe o el Catastro no la ha devuelto.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-wine px-4 py-2 text-paper">
        Volver al inicio
      </Link>
    </div>
  );
}
