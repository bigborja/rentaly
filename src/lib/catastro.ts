import type {
  ConstructionPart,
  PropertyRecord,
  PropertyUnit,
  SearchResult,
  StreetCandidate,
} from "./types";
import { asArray, compactRef, formatRef, parseAddressQuery, parseCoord, parseNumber } from "./parse";

const CALLEJERO =
  "https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json";
const COORDENADAS =
  "https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCoordenadas.svc/json";

const HEADERS = {
  "User-Agent": "Rentaly/0.1 (tenant-transparency; https://github.com/bigborja/rentaly)",
  Accept: "application/json",
};

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {};
}

function pick(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Json)[key];
  }
  return current;
}

function controlError(result: unknown): string | undefined {
  const control = asRecord(pick(result, ["control"]));
  if (String(control.cuerr || "") === "1" || Number(control.cuerr) === 1) {
    const err = asArray(pick(result, ["lerr"])).map(asRecord)[0];
    return String(err?.des || "El Catastro no ha podido resolver la consulta.");
  }
  return undefined;
}

async function catastroGet(url: string): Promise<Json> {
  const response = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 60 * 30 },
  });
  if (!response.ok) {
    throw new Error(`Catastro HTTP ${response.status}`);
  }
  return (await response.json()) as Json;
}

function locFrom(dt: unknown) {
  const lourb = asRecord(pick(dt, ["locs", "lous", "lourb"]));
  const dir = asRecord(lourb.dir);
  const loint = asRecord(lourb.loint);
  const tv = String(dir.tv || "");
  const nv = String(dir.nv || "");
  const pnp = dir.pnp != null ? String(dir.pnp) : "";
  const address = [tv, nv, pnp].filter(Boolean).join(" ").trim() || undefined;
  return {
    address,
    postalCode: lourb.dp ? String(lourb.dp) : undefined,
    districtCode: lourb.dm ? String(lourb.dm) : undefined,
    block: loint.bl ? String(loint.bl) : undefined,
    stair: loint.es ? String(loint.es) : undefined,
    floor: loint.pt ? String(loint.pt) : undefined,
    door: loint.pu ? String(loint.pu) : undefined,
  };
}

function unitFromRcdnp(item: unknown): PropertyUnit {
  const rec = asRecord(item);
  const rc = asRecord(rec.rc);
  const debi = asRecord(rec.debi);
  const loc = locFrom(rec.dt);
  const ref = formatRef({
    pc1: String(rc.pc1 || ""),
    pc2: String(rc.pc2 || ""),
    car: rc.car ? String(rc.car) : undefined,
    cc1: rc.cc1 ? String(rc.cc1) : undefined,
    cc2: rc.cc2 ? String(rc.cc2) : undefined,
  });
  return {
    ref,
    parcelRef: `${rc.pc1 || ""}${rc.pc2 || ""}`,
    use: debi.luso ? String(debi.luso) : undefined,
    areaM2: parseNumber(debi.sfc),
    year: parseNumber(debi.ant),
    participation: parseNumber(debi.cpt),
    ...loc,
  };
}

function constructionsFrom(lcons: unknown): ConstructionPart[] {
  return asArray(lcons).map((item) => {
    const rec = asRecord(item);
    const loint = asRecord(pick(rec, ["dt", "lourb", "loint"]));
    const df = asRecord(rec.dfcons);
    const dv = asRecord(rec.dvcons);
    return {
      use: rec.lcd ? String(rec.lcd) : undefined,
      typology: dv.dtip ? String(dv.dtip) : undefined,
      floor: loint.pt ? String(loint.pt) : undefined,
      door: loint.pu ? String(loint.pu) : undefined,
      stair: loint.es ? String(loint.es) : undefined,
      areaM2: parseNumber(df.stl),
    };
  });
}

function propertyFromBico(bico: unknown): PropertyRecord {
  const root = asRecord(bico);
  const bi = asRecord(root.bi);
  const idbi = asRecord(bi.idbi);
  const rc = asRecord(idbi.rc);
  const debi = asRecord(bi.debi);
  const finca = asRecord(root.finca);
  const loc = locFrom(bi.dt);
  const ref = formatRef({
    pc1: String(rc.pc1 || ""),
    pc2: String(rc.pc2 || ""),
    car: rc.car ? String(rc.car) : undefined,
    cc1: rc.cc1 ? String(rc.cc1) : undefined,
    cc2: rc.cc2 ? String(rc.cc2) : undefined,
  });
  const parcelRef = `${rc.pc1 || ""}${rc.pc2 || ""}`;
  const constructions = constructionsFrom(root.lcons);
  const unit: PropertyUnit = {
    ref,
    parcelRef,
    class: idbi.cn ? String(idbi.cn) : undefined,
    use: debi.luso ? String(debi.luso) : undefined,
    areaM2: parseNumber(debi.sfc),
    year: parseNumber(debi.ant),
    participation: parseNumber(debi.cpt),
    address: loc.address || (finca.ldt ? String(finca.ldt) : undefined),
    postalCode: loc.postalCode,
    block: loc.block,
    stair: loc.stair,
    floor: loc.floor,
    door: loc.door,
  };

  return {
    ref,
    parcelRef,
    class: unit.class,
    use: unit.use,
    areaM2: unit.areaM2,
    year: unit.year,
    participation: unit.participation,
    address: bi.ldt ? String(bi.ldt) : unit.address,
    postalCode: unit.postalCode,
    districtCode: loc.districtCode,
    parcelKind: finca.ltp ? String(finca.ltp) : undefined,
    parcelAreaM2: parseNumber(pick(finca, ["dff", "ss"])),
    mapUrl: pick(finca, ["infgraf", "igraf"])
      ? String(pick(finca, ["infgraf", "igraf"]))
      : `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${parcelRef}`,
    units: [unit],
    constructions,
  };
}

function propertyFromUnits(units: PropertyUnit[]): PropertyRecord {
  const first = units[0];
  const uses = new Map<string, { count: number; area: number }>();
  for (const unit of units) {
    const key = unit.use || "Sin uso";
    const current = uses.get(key) || { count: 0, area: 0 };
    current.count += 1;
    current.area += unit.areaM2 || 0;
    uses.set(key, current);
  }
  const constructions: ConstructionPart[] = [...uses.entries()].map(([use, stats]) => ({
    use,
    typology: `${stats.count} inmueble${stats.count === 1 ? "" : "s"}`,
    areaM2: Math.round(stats.area),
  }));

  return {
    ref: first.parcelRef,
    parcelRef: first.parcelRef,
    address: first.address,
    postalCode: first.postalCode,
    mapUrl: `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${first.parcelRef}`,
    units,
    constructions,
  };
}

export function summarizeUses(record: PropertyRecord): { use: string; count: number; areaM2: number }[] {
  const map = new Map<string, { count: number; areaM2: number }>();
  const source =
    record.units.length > 1
      ? record.units.map((unit) => ({ use: unit.use || "Sin uso", area: unit.areaM2 || 0 }))
      : record.constructions.map((part) => ({
          use: part.use || part.typology || "Sin uso",
          area: part.areaM2 || 0,
        }));
  for (const item of source) {
    const current = map.get(item.use) || { count: 0, areaM2: 0 };
    current.count += 1;
    current.areaM2 += item.area;
    map.set(item.use, current);
  }
  return [...map.entries()]
    .map(([use, stats]) => ({ use, ...stats }))
    .sort((a, b) => b.areaM2 - a.areaM2 || b.count - a.count);
}

export async function lookupByRef(ref: string): Promise<PropertyRecord> {
  const compact = compactRef(ref);
  const params = new URLSearchParams({
    Provincia: "Madrid",
    Municipio: "Madrid",
    RefCat: compact,
  });
  const json = await catastroGet(`${CALLEJERO}/Consulta_DNPRC?${params.toString()}`);
  const result = asRecord(json.consulta_dnprcResult);
  const error = controlError(result);
  if (error) throw new Error(error);
  if (result.bico) {
    const property = propertyFromBico(result.bico);
    return withCoordinates(property);
  }
  const units = asArray(pick(result, ["lrcdnp", "rcdnp"])).map(unitFromRcdnp);
  if (!units.length) {
    throw new Error("No hay datos catastrales no protegidos para esa referencia.");
  }
  return withCoordinates(propertyFromUnits(units));
}

export async function lookupByCoordinates(lng: number, lat: number): Promise<{
  parcelRef: string;
  address?: string;
  longitude: number;
  latitude: number;
}> {
  const params = new URLSearchParams({
    SRS: "EPSG:4326",
    CoorX: String(lng),
    CoorY: String(lat),
  });
  const json = await catastroGet(`${COORDENADAS}/Consulta_RCCOOR?${params.toString()}`);
  const result = asRecord(json.Consulta_RCCOORResult);
  const error = controlError(result);
  if (error) throw new Error(error);
  const coord = asArray(pick(result, ["coordenadas", "coord"])).map(asRecord)[0];
  if (!coord) throw new Error("No hay parcela catastral en ese punto.");
  const pc = asRecord(coord.pc);
  const geo = asRecord(coord.geo);
  return {
    parcelRef: `${pc.pc1 || ""}${pc.pc2 || ""}`,
    address: coord.ldt ? String(coord.ldt) : undefined,
    longitude: parseCoord(geo.xcen) ?? lng,
    latitude: parseCoord(geo.ycen) ?? lat,
  };
}

async function lookupCoordinates(parcelRef: string): Promise<{ longitude: number; latitude: number } | undefined> {
  const params = new URLSearchParams({
    Provincia: "Madrid",
    Municipio: "Madrid",
    SRS: "EPSG:4326",
    RefCat: parcelRef,
  });
  const json = await catastroGet(`${COORDENADAS}/Consulta_CPMRC?${params.toString()}`);
  const result = asRecord(json.Consulta_CPMRCResult);
  if (controlError(result)) return undefined;
  const coord = asArray(pick(result, ["coordenadas", "coord"])).map(asRecord)[0];
  const geo = asRecord(coord?.geo);
  const longitude = parseCoord(geo.xcen);
  const latitude = parseCoord(geo.ycen);
  if (longitude == null || latitude == null) return undefined;
  return { longitude, latitude };
}

async function withCoordinates(property: PropertyRecord): Promise<PropertyRecord> {
  try {
    const coords = await lookupCoordinates(property.parcelRef);
    return coords ? { ...property, ...coords } : property;
  } catch {
    return property;
  }
}

async function searchStreets(street: string, sigla?: string): Promise<StreetCandidate[]> {
  const params = new URLSearchParams({
    Provincia: "Madrid",
    Municipio: "Madrid",
    NomVia: street,
  });
  if (sigla) params.set("TipoVia", sigla);
  const json = await catastroGet(`${CALLEJERO}/ObtenerCallejero?${params.toString()}`);
  const result = asRecord(json.consulta_callejeroResult);
  const error = controlError(result);
  if (error) throw new Error(error);
  return asArray(pick(result, ["callejero", "calle"]))
    .map((item) => {
      const dir = asRecord(pick(item, ["dir"]));
      return {
        type: String(dir.tv || ""),
        name: String(dir.nv || ""),
        code: dir.cv ? String(dir.cv) : undefined,
      };
    })
    .filter((item) => item.name);
}

async function lookupAddress(sigla: string | undefined, street: string, number: string): Promise<SearchResult> {
  const trySiglas = sigla ? [sigla] : ["CL", "AV", "PZ", "PS", "RD", "GL", "TR", "CJ"];
  let lastError = "No se ha encontrado ese portal en el callejero catastral de Madrid.";
  for (const type of trySiglas) {
    const params = new URLSearchParams({
      Provincia: "Madrid",
      Municipio: "Madrid",
      Sigla: type,
      Calle: street,
      Numero: number,
    });
    const json = await catastroGet(`${CALLEJERO}/Consulta_DNPLOC?${params.toString()}`);
    const result = asRecord(json.consulta_dnplocResult);
    const error = controlError(result);
    if (error) {
      lastError = error;
      continue;
    }
    if (result.bico) {
      const property = await withCoordinates(propertyFromBico(result.bico));
      return {
        query: `${type} ${street} ${number}`,
        mode: "address",
        property,
        units: property.units,
      };
    }
    const units = asArray(pick(result, ["lrcdnp", "rcdnp"])).map(unitFromRcdnp);
    if (units.length) {
      const property = await withCoordinates(propertyFromUnits(units));
      return {
        query: `${type} ${street} ${number}`,
        mode: "address",
        property,
        units,
      };
    }
  }
  throw new Error(lastError);
}

export async function searchMadrid(query: string): Promise<SearchResult> {
  const parsed = parseAddressQuery(query);
  if (!parsed) {
    throw new Error("Escribe una dirección de Madrid, un número de portal o una referencia catastral.");
  }
  if (parsed.kind === "ref") {
    const property = await lookupByRef(parsed.ref);
    return {
      query,
      mode: "ref",
      property,
      units: property.units.length > 1 ? property.units : undefined,
    };
  }
  if (parsed.kind === "street") {
    const streets = await searchStreets(parsed.street, parsed.sigla);
    return {
      query,
      mode: "street",
      streets,
      warning: streets.length
        ? "Añade el número de portal para ver la distribución de inmuebles."
        : "No hay vías con ese nombre en el callejero catastral de Madrid capital.",
    };
  }
  return lookupAddress(parsed.sigla, parsed.street, parsed.number);
}
