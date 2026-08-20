import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { redactPii, sanitizeReportText } from "./privacy.ts";
import { assertLegalPersonTaxId } from "./ownership.ts";

describe("privacy", () => {
  it("redacts email, phone and DNI", () => {
    const text = redactPii("Escribe a ana@correo.es o llama al 612345678. DNI 12345678Z.");
    assert.equal(text.includes("@"), false);
    assert.equal(text.includes("612345678"), false);
    assert.equal(text.includes("12345678Z"), false);
    assert.match(text, /omitido/);
  });

  it("rejects naming a natural-person owner with a document", () => {
    assert.throws(
      () => sanitizeReportText("El propietario con DNI 12345678Z no devolvió la fianza del piso."),
      /personas físicas/,
    );
  });

  it("allows a report that talks about the landlord without identifying them", () => {
    const body = sanitizeReportText(
      "El propietario no devolvió la fianza a los treinta días de entregar las llaves. Guardé el contrato y el burofax.",
    );
    assert.match(body, /fianza/);
  });
});

describe("legal entities", () => {
  it("accepts a CIF and rejects a DNI", () => {
    assert.equal(assertLegalPersonTaxId("A28012345"), "A28012345");
    assert.throws(() => assertLegalPersonTaxId("12345678Z"), /persona jurídica/);
    assert.throws(() => assertLegalPersonTaxId("Y1234567A"), /persona jurídica/);
  });
});
