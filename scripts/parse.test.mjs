import test from "node:test";
import assert from "node:assert/strict";
import { asArray, compactRef, isCadastralRef, parseAddressQuery, parseCoord, parseNumber } from "./parse.mjs";

test("detects cadastral references", () => {
  assert.equal(isCadastralRef("0434301VK4703C"), true);
  assert.equal(isCadastralRef("0434301VK4703C0001MT"), true);
  assert.equal(isCadastralRef("calle pez 5"), false);
  assert.equal(compactRef("0434 301-VK4703C"), "0434301VK4703C");
});

test("parses madrid addresses", () => {
  assert.deepEqual(parseAddressQuery("Calle Embajadores 41 Madrid"), {
    kind: "address",
    sigla: "CL",
    street: "Embajadores",
    number: "41",
  });
  assert.deepEqual(parseAddressQuery("AV Alcala 1"), {
    kind: "address",
    sigla: "AV",
    street: "Alcala",
    number: "1",
  });
  assert.equal(parseAddressQuery("0434301VK4703C").kind, "ref");
  assert.equal(parseAddressQuery("Embajadores").kind, "street");
});

test("asArray wraps single objects", () => {
  assert.deepEqual(asArray("a"), ["a"]);
  assert.deepEqual(asArray(["a", "b"]), ["a", "b"]);
  assert.deepEqual(asArray(null), []);
});

test("parses catastro numbers vs coordinates", () => {
  assert.equal(parseNumber("3.276"), 3276);
  assert.equal(parseNumber("79,000000"), 79);
  assert.equal(parseCoord("-3.70216630844392"), -3.70216630844392);
  assert.equal(parseCoord("40.417249357134"), 40.417249357134);
});
