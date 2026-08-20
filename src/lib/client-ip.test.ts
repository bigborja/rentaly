import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clientIpFromRequest } from "./client-ip.ts";

describe("client IP on Vercel", () => {
  it("prefers request.ip over X-Forwarded-For", () => {
    assert.equal(
      clientIpFromRequest({
        ip: "203.0.113.10",
        forwardedFor: "198.51.100.1, 10.0.0.1",
      }),
      "203.0.113.10",
    );
  });

  it("uses the leftmost X-Forwarded-For hop when request.ip is missing", () => {
    assert.equal(
      clientIpFromRequest({
        ip: "  ",
        forwardedFor: " 198.51.100.2, 10.0.0.1, 172.16.0.1",
      }),
      "198.51.100.2",
    );
  });

  it("falls back to unknown when no address is present", () => {
    assert.equal(clientIpFromRequest({}), "unknown");
  });
});
