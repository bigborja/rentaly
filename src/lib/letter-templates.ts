const CATASTRO_SEDE = "https://www.sedecatastro.gob.es/";
const SERPAVI_APP = "https://serpavi.mivau.gob.es/";

export type LetterContext = {
  cadastralRef: string;
  address?: string;
  areaM2?: number;
  year?: number;
  use?: string;
};

function heading(ctx: LetterContext) {
  const where = ctx.address?.trim() || "la vivienda";
  return `${where} · RC ${ctx.cadastralRef}`;
}

function facts(ctx: LetterContext) {
  const bits = [
    `referencia catastral ${ctx.cadastralRef}`,
    ctx.areaM2 != null ? `superficie construida ${Math.round(ctx.areaM2)} m²` : null,
    ctx.use ? `uso ${ctx.use}` : null,
    ctx.year ? `antigüedad hacia ${ctx.year}` : null,
  ].filter(Boolean);
  return bits.join(", ");
}

export function metersLetter(ctx: LetterContext) {
  return [
    `Hola. Estoy contrastando ${heading(ctx)} antes de reservar o firmar.`,
    `En el Catastro (datos no protegidos, ${CATASTRO_SEDE}) figura: ${facts(ctx)}.`,
    `El anuncio o la visita no coinciden con esos metros o con ese uso. ¿Podéis confirmar por escrito la superficie (construida y útil) y el uso, y enviarme el modelo de contrato, el desglose de fianza y de honorarios?`,
    `Hasta entonces no haré ninguna transferencia de reserva. Gracias.`,
  ].join("\n\n");
}

export function rentLetter(ctx: LetterContext) {
  return [
    `Hola. Antes de firmar el alquiler de ${heading(ctx)} voy a consultar el rango SERPAVI (${SERPAVI_APP}) con la referencia catastral y las características del inmueble (${facts(ctx)}).`,
    `¿Me enviáis por escrito el modelo de contrato (vivienda habitual), la renta, la cláusula de actualización, el desglose de fianza y quién asume los honorarios de intermediación?`,
    `No transferiré señal ni reserva sin ese papel. Gracias.`,
  ].join("\n\n");
}

export function accessLetter(ctx: LetterContext) {
  return [
    `Hola. Sobre ${heading(ctx)}: el piso es mi domicilio. Necesito que cualquier visita o entrada (salvo urgencia) quede acordada por escrito, con fecha y motivo.`,
    `Si hay un desacuerdo de contrato, fianza, honorarios o habitabilidad, lo dejaré también por escrito. Esto no es una denuncia: es un requerimiento previo.`,
  ].join("\n\n");
}

export const LETTERS = [
  {
    id: "metros" as const,
    title: "Metros o uso distintos del Catastro",
    hint: "Cuando el anuncio infla superficie o vende un local como piso.",
    build: metersLetter,
  },
  {
    id: "renta" as const,
    title: "Renta, fianza y honorarios por escrito",
    hint: "Antes de firmar: contrato, SERPAVI y quién paga la agencia.",
    build: rentLetter,
  },
  {
    id: "entrada" as const,
    title: "Entrada al piso o visitas",
    hint: "Si aparecen con copia de llave o sin preaviso.",
    build: accessLetter,
  },
];
