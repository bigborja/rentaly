export type FaqItem = {
  question: string;
  answer: string;
  links?: { href: string; label: string }[];
};

export const PLATFORM_FAQS: FaqItem[] = [
  {
    question: "¿Qué es Rentaly y para qué existe?",
    answer:
      "Es una herramienta ciudadana para inquilinas e inquilinos de Madrid capital. El propósito es que el siguiente contrato no se negocie a ciegas: contrastar el anuncio con datos públicos y con la memoria de quien ya firmó. No intermediamos, no listamos pisos y no cobramos comisión.",
  },
  {
    question: "¿Qué gano yo al usarla?",
    answer:
      "Antes de firmar, una ficha con metros y uso oficiales, el barrio municipal, si hay viviendas turísticas cerca y si alguien dejó rastro sobre esa finca o esa gestora. Durante el contrato, un sitio para dejar hechos (sin DNI) que sirvan a quien venga detrás.",
    links: [
      { href: "/checklist", label: "Antes de firmar" },
      { href: "/aportar", label: "Aportar memoria" },
    ],
  },
  {
    question: "¿Cómo funciona, en corto?",
    answer:
      "Pegas calle y número o la referencia catastral. El Catastro devuelve el portal. En el mapa, cada polígono es un barrio oficial. Si conoces el CIF de la agencia, se agrupa la memoria de esa sociedad. Leer no pide cuenta; publicar sí, con apodo en público.",
    links: [
      { href: "/#buscar", label: "Contrastar un anuncio" },
      { href: "/como-funciona", label: "Guía y glosario" },
    ],
  },
  {
    question: "¿De dónde salen los datos?",
    answer:
      "Catastro (metros, uso, unidades; no titularidad de personas físicas). Barrios del Ayuntamiento. Licencias VUT municipales. Renta de sección censal del INE. SERPAVI e IRAV son herramientas oficiales de renta y de actualización: las enlazamos, no inventamos cifras. El RAIN de la Comunidad aporta sociedades con CIF. La memoria vecinal la escribís vosotras.",
    links: [
      { href: "/aviso-legal", label: "Aviso legal y procedencia" },
      { href: "https://www.sedecatastro.gob.es/", label: "Sede del Catastro" },
    ],
  },
  {
    question: "¿Por qué no sale el nombre del casero particular?",
    answer:
      "El Catastro abierto no publica dueños persona física y Rentaly no los inventa. Solo se anclan personas jurídicas (CIF de una SL, SOCIMI o fondo). Nunca un DNI, un NIE ni una nota simple. Los colegiados del CAF y del COAPI se consultan en la web de cada colegio, no aquí.",
    links: [
      { href: "/gestoras", label: "Directorio de gestoras" },
      { href: "https://cafmadrid.es/su-administrador-esta-colegiado/", label: "CAF Madrid" },
      { href: "https://www.coapimadrid.es/nuestros_apis.php", label: "COAPI Madrid" },
    ],
  },
  {
    question: "¿La memoria vecinal es una denuncia o un ranking?",
    answer:
      "Ni lo uno ni lo otro. Son relatos. Un texto suelto no basta; un patrón en el mismo portal o el mismo CIF sí es una señal. No certificamos cada frase. Un aviso aquí no abre un procedimiento administrativo ni judicial.",
    links: [{ href: "/aportar", label: "Cómo aportar" }],
  },
  {
    question: "¿Dónde pido ayuda de verdad?",
    answer:
      "Si hay delito o riesgo, 112. SAV Madrid (900 814 815) asesora sobre contrato y vivienda. El Sindicato de Inquilinas organiza. SERPAVI calcula un rango de alquiler; el IRAV limita la subida anual en ciertos contratos. Rentaly enlaza esas sedes: no tramitamos ayudas ni denuncias.",
    links: [
      { href: "/derechos", label: "Derechos y 112" },
      { href: "https://serpavi.mivau.gob.es/", label: "SERPAVI" },
      { href: "https://inquilinato.org/defiendete/", label: "Sindicato de Inquilinas" },
    ],
  },
];
