import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findAsociacionByDistrito, matchAsociacionByDistrito, normalizeDistrito } from "./getAsociacion.ts";

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

  it("returns the Carabanchel housing assembly, not a generic union card", () => {
    const org = findAsociacionByDistrito("Carabanchel");
    assert.equal(org.id, "asamblea-carabanchel");
    assert.match(org.nombre, /Carabanchel/i);
  });

  it("falls back to the city-wide tenant union when no node covers the district", () => {
    const org = findAsociacionByDistrito("Hortaleza");
    assert.equal(org.id, "sindicato-general");
    assert.equal(org.generico, true);
    assert.equal(org.nombre, "Sindicato de Inquilinas de Madrid");
  });

  it("treats hyphen variants of municipal district names as the same", () => {
    assert.equal(normalizeDistrito("Fuencarral - El Pardo"), "fuencarral-el pardo");
    assert.equal(normalizeDistrito("Fuencarral-El Pardo"), "fuencarral-el pardo");
    assert.equal(findAsociacionByDistrito("Fuencarral-El Pardo").generico, true);
  });

  it("throws if the catalogue has no generic row", () => {
    assert.throws(
      () => matchAsociacionByDistrito([{ id: "x", nombre: "X", distritos_cubiertos: ["Centro"], canal_telegram: "https://t.me/x", horario_reunion: "—" }], "Hortaleza"),
      /genérica/,
    );
  });
});
