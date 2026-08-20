import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Glossary, Guide, Steps } from "@/components/Guide";
import { CadastralStamp } from "@/components/illustrations";

export const metadata: Metadata = { title: "Cómo funciona" };

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="kicker">Guía de uso</p>
          <h1 className="mt-2 font-display text-5xl">Cómo usar Rentaly si es la primera vez</h1>
        </div>
        <CadastralStamp className="hidden w-28 shrink-0 text-ink sm:block" />
      </div>
      <p className="mt-4 leading-7 text-ink/75">
        Rentaly no anuncia pisos ni intermedia contratos. Sirve para contrastar un anuncio de Madrid capital con datos
        públicos (Catastro, barrios, licencias turísticas) y con relatos de quien ya alquiló. Puedes leerlo todo sin
        cuenta. Solo hace falta registrarse para publicar.
      </p>

      <div className="mt-8">
        <Guide title="En tres pasos">
          <Steps
            items={[
              {
                title: "Busca la dirección o la referencia catastral",
                body: "En la portada o en un barrio, escribe calle y número (por ejemplo, Calle Embajadores 41) o pega la referencia de 14 o 20 caracteres si ya la tienes. El Catastro responde con metros, uso y unidades de esa finca.",
              },
              {
                title: "Compara con el anuncio y lee el barrio",
                body: "Si el portal dice más metros o un uso distinto (vivienda frente a local), para y pregunta por escrito. En la ficha verás también VUT, renta de la sección censal y memoria vecinal.",
              },
              {
                title: "Deja rastro si ya has vivido el contrato",
                body: "Experiencia, incidente o aviso de abuso. En público solo se ve tu apodo. Si hay delito o riesgo, llama al 112: esto no es una denuncia.",
              },
            ]}
          />
        </Guide>
      </div>

      <ol className="mt-10 space-y-6">
        <Step n="01" title="Antes de firmar">
          Abre{" "}
          <Link className="underline decoration-gold" href="/checklist">
            Antes de firmar
          </Link>
          . Contrasta metros y uso, revisa fianza, honorarios y si el papel es de vivienda habitual o de temporada
          fingida. La lista se guarda en este teléfono; no hace falta cuenta.
        </Step>
        <Step n="02" title="Durante el contrato">
          Humedad, calefacción cortada o una visita sin aviso van como incidente de finca. Fianza extra, entrada sin
          permiso o discriminación van como aviso de abuso (el vino del diseño se reserva para eso). Un relato no es una
          sentencia: un patrón en el mismo portal sí es una señal.
        </Step>
        <Step n="03" title="Para quien viene detrás">
          ¿Se lo recomendarías a una amiga? El correo queda en la cuenta por si hay que verificar un hecho. Nunca se
          publica junto al aviso. No escribas DNI, cuentas ni nombres de terceras personas.
        </Step>
      </ol>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Qué verás en una ficha de inmueble</h2>
        <p className="mt-3 text-sm leading-6 text-ink/75">
          Cada finca tiene una referencia catastral. Al abrirla, la página carga primero lo que publica el Catastro
          (metros, uso, año, viviendas, locales, trasteros). Después, si hay coordenadas, aparecen capas extra: licencias
          VUT, renta media de la sección censal e ITE. Los CIF los aporta la comunidad, no el Catastro.
        </p>
        <Callout>
          El Catastro no dice quién es el dueño persona física y Rentaly tampoco. Solo se pueden vincular personas
          jurídicas (CIF de una SL, SOCIMI o fondo) con una fuente o como aporte vecinal de baja confianza.
        </Callout>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Palabras que salen en la herramienta</h2>
        <p className="mt-3 mb-6 text-sm text-ink/70">
          No hace falta ser técnica. Estos son los términos que verás en las fichas.
        </p>
        <Glossary
          terms={[
            {
              term: "Catastro",
              meaning:
                "Registro administrativo de inmuebles. Publica datos no protegidos: dirección, uso, superficie, año y unidades. No publica el nombre de propietarios personas físicas.",
            },
            {
              term: "Referencia catastral (RC)",
              meaning:
                "Código de 14 caracteres para la parcela (el portal) o de 20 para un inmueble concreto (piso, local, trastero). Es el ancla de la ficha.",
            },
            {
              term: "Finca / parcela",
              meaning:
                "El edificio o solar. Dentro puede haber muchas unidades: viviendas, locales, plazas y trasteros, cada una con su RC de 20 caracteres.",
            },
            {
              term: "VUT",
              meaning:
                "Vivienda de uso turístico con licencia urbanística de hospedaje en Madrid. Si hay licencias en la misma parcela, la ficha lo indica. No implica que tu piso concreto esté alquilado por noches.",
            },
            {
              term: "Gestora / CIF",
              meaning:
                "Identificador fiscal de una empresa o entidad (empieza por letra, no por número de DNI). La ficha de gestora agrupa relatos que citan ese CIF; la de entidad, las parcelas. Nunca DNI ni notas simples.",
            },
            {
              term: "ITE / IEE",
              meaning:
                "Inspección técnica o informe de evaluación del edificio. Rentaly no inventa el resultado: te enlaza a la sede del Ayuntamiento para consultarlo.",
            },
            {
              term: "SERPAVI",
              meaning:
                "Aplicación del Ministerio de Vivienda: rango orientativo de renta para una vivienda a partir de su referencia catastral, superficie y extras. No es el precio de un anuncio. En la ficha de Rentaly te preparamos la RC; el rango lo calcula SERPAVI.",
            },
            {
              term: "IRAV",
              meaning:
                "Índice del INE que limita la actualización anual de la renta en contratos de vivienda habitual posteriores al 26 de mayo de 2023. Distinto de SERPAVI: uno es «cuánto podría costar este piso», el otro es «cuánto puede subir el que ya tienes».",
            },
            {
              term: "Sección censal",
              meaning:
                "Pieza estadística del INE, más pequeña que un barrio. La renta media de esa pieza no es la de tu portal. SERPAVI también la usa para localizar la vivienda.",
            },
            {
              term: "Gran tenedor",
              meaning:
                "En Rentaly es una etiqueta de forma jurídica (SOCIMI, fondo) o de cartera (el mismo CIF en más de una finca). No es un censo oficial de viviendas de esa entidad.",
            },
          ]}
        />
      </section>

      <div className="card mt-12 bg-ink p-6 text-paper">
        <h2 className="font-display text-2xl text-gold">Lo que no hacemos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-paper/75">
          <li>No listamos pisos ni cobramos comisión.</li>
          <li>No mostramos titularidad de personas físicas ni almacenamos DNI.</li>
          <li>No sustituimos denuncia, sindicato ni asesoría jurídica.</li>
          <li>Los relatos vecinales son opiniones: no certificamos cada frase.</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Buscar una dirección
        </Link>
        <Link href="/checklist" className="btn btn-ghost">
          Abrir la lista de firma
        </Link>
        <Link href="/registro" className="btn btn-ghost">
          Crear cuenta
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
