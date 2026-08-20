import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ASOCIACIONES,
  directorioAsociaciones,
  findAsociacionByDistrito,
  matchAsociacionByDistrito,
  normalizeDistrito,
} from "./getAsociacion.ts";

describe("findAsociacionByDistrito", () => {
  it("returns the Centro node for Centro, Arganzuela, Retiro and Chamberí", () => {
    for (const distrito of ["Centro", "Arganzuela", "Retiro", "Chamberí", "  chamberí  "]) {
      const org = findAsociacionByDistrito(distrito);
      assert.equal(org.id, "sindicato-nodo-centro");
    }
  });

  it("returns PAH Vallekas for both Vallecas districts", () => {
    assert.equal(findAsociacionByDistrito("Puente de Vallecas").id, "pah-vallekas");
    assert.equal(findAsociacionByDistrito("Villa de Vallecas").id, "pah-vallekas");
  });

  it("prefers the local Carabanchel housing assembly over the union node", () => {
    const org = findAsociacionByDistrito("Carabanchel");
    assert.equal(org.id, "asamblea-carabanchel");
  });

  it("returns barrio assemblies for Hortaleza, Tetuán, Usera and Moratalaz", () => {
    assert.equal(findAsociacionByDistrito("Hortaleza").id, "sindicato-hortaleza");
    assert.equal(findAsociacionByDistrito("Tetuán").id, "asamblea-tetuan");
    assert.equal(findAsociacionByDistrito("Usera").id, "asamblea-usera");
    assert.equal(findAsociacionByDistrito("Moratalaz").id, "sindicato-moratalaz");
  });

  it("falls back to the city-wide tenant union when no node covers the district", () => {
    const org = findAsociacionByDistrito("Barajas");
    assert.equal(org.id, "sindicato-general");
    assert.equal(org.generico, true);
  });

  it("does not let directory-only umbrellas steal a district match", () => {
    assert.equal(ASOCIACIONES.some((org) => org.solo_directorio), true);
    assert.equal(findAsociacionByDistrito("Centro").solo_directorio, undefined);
  });

  it("treats hyphen variants of municipal district names as the same", () => {
    assert.equal(normalizeDistrito("San Blas - Canillejas"), "san blas-canillejas");
    assert.equal(findAsociacionByDistrito("San Blas-Canillejas").id, "asamblea-san-blas");
    assert.equal(findAsociacionByDistrito("Fuencarral-El Pardo").generico, true);
  });

  it("throws if the catalogue has no generic row", () => {
    assert.throws(
      () =>
        matchAsociacionByDistrito(
          [{ id: "x", nombre: "X", distritos_cubiertos: ["Centro"], canal_telegram: "https://t.me/x", horario_reunion: "—" }],
          "Hortaleza",
        ),
      /genérica/,
    );
  });
});

describe("directorioAsociaciones", () => {
  it("lists more than one organisation, including FRAVM and Coordinadora", () => {
    const ids = directorioAsociaciones().flatMap((section) => section.items.map((org) => org.id));
    assert.ok(ids.length >= 12);
    assert.ok(ids.includes("fravm"));
    assert.ok(ids.includes("coordinadora-vivienda"));
    assert.ok(ids.includes("pah-vallekas"));
    assert.ok(ids.includes("asamblea-usera"));
  });
});
