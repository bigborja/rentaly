import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseRainCsv, parseRainJson } from "./rain-parse.ts";
import { matchesGestoraQuery } from "../../lib/gestoras-match.ts";
import { assertLegalPersonTaxId, tryLegalPersonTaxId } from "../../domain/ownership.ts";

const SAMPLE = `NUMERO REGISTRO RAIN;NOMBRE TITULAR;CIF/NIF/NIE
000001/18;AVANCE DESARROLLO INMOBILIARIO, S.L;B84259167
000006/18;PULIDO ALCÓN, LOURDES;***9025**
000012/18;GARCÍA GALARRAGA, ESPERANZA;***4469**
000240/18;OFICINA ORCASITAS, S.L.;B8801338
000030/18;FERNANDEZ-CABRERA SERVICIOS INMOBILIARIOS, S.L.;B85866184
X00001/18;AGENTE CON NIE;Y1234567A
`;

describe("RAIN open data", () => {
  it("keeps CIF rows and drops masked NIF/NIE and broken identifiers", () => {
    const rows = parseRainCsv(SAMPLE);
    assert.deepEqual(
      rows.map((row) => row.taxId),
      ["B84259167", "B85866184"],
    );
    assert.equal(
      rows.some((row) => /lourdes|esperanza|garcia|nie/i.test(row.legalName)),
      false,
    );
  });

  it("reads the CKAN JSON envelope the same way", () => {
    const rows = parseRainJson({
      data: [
        {
          "NUMERO REGISTRO RAIN": "000001/18",
          "NOMBRE TITULAR": "AVANCE DESARROLLO INMOBILIARIO, S.L",
          "CIF/NIF/NIE": "B84259167",
        },
        {
          "NUMERO REGISTRO RAIN": "000006/18",
          "NOMBRE TITULAR": "PULIDO ALCÓN, LOURDES",
          "CIF/NIF/NIE": "***9025**",
        },
      ],
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].taxId, "B84259167");
  });
});

describe("legal person tax id", () => {
  it("accepts AEAT company letters and rejects NIE prefixes", () => {
    assert.equal(assertLegalPersonTaxId("b84259167"), "B84259167");
    assert.equal(tryLegalPersonTaxId("Y1234567A"), null);
    assert.equal(tryLegalPersonTaxId("X1234567A"), null);
    assert.equal(tryLegalPersonTaxId("12345678Z"), null);
    assert.throws(() => assertLegalPersonTaxId("Y1234567A"), /persona jurídica/);
  });
});

describe("gestora search", () => {
  const row = { taxId: "B84259167", legalName: "Avance Desarrollo Inmobiliario, S.L." };

  it("matches CIF, accent-folded name, and ignores S.L.", () => {
    assert.equal(matchesGestoraQuery("B84259167", row), true);
    assert.equal(matchesGestoraQuery("avance desarrollo", row), true);
    assert.equal(matchesGestoraQuery("B842", row), true);
    assert.equal(matchesGestoraQuery("lourdes", row), false);
  });
});
