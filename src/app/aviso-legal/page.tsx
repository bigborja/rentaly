import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aviso legal" };

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Aviso legal y datos</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-ink/80">
        <p>
          Rentaly es una herramienta ciudadana de transparencia para el alquiler en Madrid capital. No es un portal
          inmobiliario, no intermedia contratos y no certifica la veracidad de cada relato vecinal.
        </p>
        <p>
          Los datos de inmuebles proceden de los servicios web libres de la Dirección General del Catastro (datos
          catastrales no protegidos): no se muestra titularidad ni otra información protegida. Los límites de barrio
          proceden del geoportal del Ayuntamiento de Madrid.
        </p>
        <p>
          Los aportes (experiencias, incidentes, avisos de abuso) son opiniones o relatos de usuarias y usuarios. No
          constituyen denuncias administrativas ni judiciales. Quien publique se compromete a no incluir datos personales
          de terceras personas ni contenidos ilícitos.
        </p>
        <p>
          Para ejercer derechos sobre un contenido propio, contacta a quien mantenga el repositorio. En caso de
          emergencia o delito, usa los canales oficiales (112 y fuerzas de seguridad).
        </p>
      </div>
    </div>
  );
}
