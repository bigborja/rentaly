import type { Metadata } from "next";
import { Guide } from "@/components/Guide";

export const metadata: Metadata = { title: "Aviso legal" };

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Aviso legal y datos</h1>
      <p className="mt-4 leading-7 text-ink/75">
        Texto en lenguaje llano sobre qué es Rentaly, de dónde salen los datos y qué puedes (y no puedes) publicar. No
        sustituye un contrato ni un dictamen jurídico.
      </p>
      <div className="mt-6">
        <Guide title="En resumen">
          <p>
            Consultamos datos públicos del Catastro y del Ayuntamiento. La memoria vecinal la escribís vosotras. No
            mostramos dueños particulares, no guardamos DNI ni notas simples, y un aviso aquí no es una denuncia.
          </p>
        </Guide>
      </div>
      <div className="mt-6 space-y-4 text-sm leading-7 text-ink/80">
        <p>
          Rentaly es una herramienta ciudadana de transparencia para el alquiler en Madrid capital. No es un portal
          inmobiliario, no intermedia contratos y no certifica la veracidad de cada relato vecinal.
        </p>
        <p>
          Los datos de inmuebles proceden de los servicios web libres de la Dirección General del Catastro (datos
          catastrales no protegidos): no se muestra titularidad ni otra información protegida. Los límites de barrio
          proceden del geoportal del Ayuntamiento de Madrid. Las licencias de vivienda de uso turístico salen del
          conjunto de datos municipales. La renta de sección censal es un agregado del INE, no de una finca. El
          directorio de gestoras cruza la memoria vecinal con el Registro de Agentes Inmobiliarios (RAIN) de la
          Comunidad de Madrid (CC BY): solo personas jurídicas con CIF; se descartan NIF/NIE y nombres de particulares.
          Los buscadores de colegiados del CAF Madrid y del COAPI Madrid se enlazan como fuente oficial: no copiamos
          esos censos (el CAF indica que los datos personales de su listado no pueden usarse con fines comerciales). No
          ingerimos OpenCorporates, Infocif, Idealista, Fotocasa ni Google Places. El listado de apoyo vecinal es una
          recopilación estática de asambleas públicas de Madrid capital (Coordinadora de Vivienda, sindicato de
          inquilinas, PAH, PAVPS) y un enlace al directorio de la FRAVM: no copiamos el censo de asociaciones ni
          representamos a esos colectivos.
        </p>
        <p>
          Los aportes (experiencias, incidentes, avisos de abuso) son opiniones o relatos de usuarias y usuarios. No
          constituyen denuncias administrativas ni judiciales. Quien publique se compromete a no incluir datos personales
          de terceras personas ni contenidos ilícitos. Un recorte de prueba se hashea: no almacenamos el archivo nítido
          ni el GPS.
        </p>
        <p>
          Para ejercer derechos sobre un contenido propio, contacta a quien mantenga el repositorio. En caso de
          emergencia o delito, usa los canales oficiales (112 y fuerzas de seguridad).
        </p>
      </div>
    </div>
  );
}
