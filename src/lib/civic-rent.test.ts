import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseIravTable, applyIrav } from "./irav.ts";
import { serpaviScope } from "./official.ts";
import { metersLetter, rentLetter, accessLetter } from "./letter-templates.ts";

describe("SERPAVI scope", () => {
  it("keeps a typical Madrid flat in range", () => {
    const scope = serpaviScope({ areaM2: 68, year: 1965, use: "Vivienda" });
    assert.equal(scope.inScope, true);
    assert.equal(scope.reasons.length, 0);
  });

  it("flags dwellings the official app does not price", () => {
    assert.match(serpaviScope({ areaM2: 22, year: 1980, use: "Vivienda" }).reasons.join(" "), /30/);
    assert.match(serpaviScope({ areaM2: 180, year: 1970, use: "Vivienda" }).reasons.join(" "), /150/);
    assert.match(serpaviScope({ areaM2: 70, year: new Date().getFullYear() - 2, use: "Vivienda" }).reasons.join(" "), /cinco/);
    assert.match(serpaviScope({ areaM2: 90, year: 1990, use: "Comercial" }).reasons.join(" "), /residencial/);
  });
});

describe("IRAV table", () => {
  it("reads the latest INE variation", () => {
    const point = parseIravTable([
      {
        COD: "IRAV1",
        Data: [
          { Anyo: 2026, FK_Periodo: 7, Valor: 2.49 },
          { Anyo: 2026, FK_Periodo: 6, Valor: 2.44 },
        ],
      },
    ]);
    assert.equal(point?.ratePercent, 2.49);
    assert.equal(point?.month, 7);
    assert.match(point?.label || "", /julio de 2026/);
  });

  it("applies the cap as a percentage of current rent", () => {
    const result = applyIrav(1200, 2.5);
    assert.equal(result?.next, 1230);
    assert.equal(result?.delta, 30);
  });
});

describe("written models", () => {
  const ctx = {
    cadastralRef: "1234567VK47100",
    address: "Calle de ejemplo 12",
    areaM2: 61,
    year: 1958,
    use: "Vivienda",
  };

  it("anchors every letter to the cadastral reference", () => {
    for (const body of [metersLetter(ctx), rentLetter(ctx), accessLetter(ctx)]) {
      assert.match(body, /1234567VK47100/);
      assert.doesNotMatch(body, /DNI|nota simple/i);
    }
  });

  it("asks for written confirmation instead of filing a case", () => {
    assert.match(metersLetter(ctx), /por escrito/);
    assert.match(rentLetter(ctx), /SERPAVI/);
    assert.match(accessLetter(ctx), /no es una denuncia/i);
  });
});
