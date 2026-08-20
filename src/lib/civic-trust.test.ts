import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertAllowedSourceUrl } from "./source-url.ts";
import { hashDiscardedJpeg } from "./jpeg-crop.ts";
import { trustFrom } from "./trust.ts";

describe("official source URLs", () => {
  it("accepts BOE/BORM https hosts", () => {
    assert.match(assertAllowedSourceUrl("https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-1"), /boe\.es/);
    assert.match(assertAllowedSourceUrl("https://borm.es/anuncio/1"), /borm\.es/);
  });

  it("rejects private hosts and http", () => {
    assert.throws(() => assertAllowedSourceUrl("https://evil.example/x"), /oficiales/);
    assert.throws(() => assertAllowedSourceUrl("http://boe.es/x"), /https/);
    assert.throws(() => assertAllowedSourceUrl("https://127.0.0.1/x"), /oficial/);
  });
});

describe("obfuscated JPEG evidence", () => {
  it("rejects PDFs and non-jpeg payloads", () => {
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4"), Buffer.alloc(24, 0)]);
    assert.throws(() => hashDiscardedJpeg(pdf.toString("base64")), /PDF/);
    assert.throws(() => hashDiscardedJpeg(Buffer.from("not-an-image").toString("base64")), /JPEG/);
  });

  it("hashes a minimal JPEG SOI and discards pixels", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    const result = hashDiscardedJpeg(jpeg.toString("base64"));
    assert.equal(result.sha256.length, 64);
    assert.equal(result.bytes, jpeg.length);
  });
});

describe("trust bands", () => {
  it("marks evidence higher than an account-only report", () => {
    assert.equal(trustFrom({ userId: "u1" }).trustBand, "medio");
    assert.equal(trustFrom({ userId: "u1", hasEvidence: true }).verification, "evidencia");
    assert.equal(trustFrom({}).trustBand, "bajo");
  });
});
