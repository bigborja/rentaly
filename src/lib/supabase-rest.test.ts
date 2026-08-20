import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasSupabase, sbEq, sbIn } from "./supabase-rest.ts";

describe("supabase rest filters", () => {
  it("encodes emails and query URLs so they do not split the request", () => {
    assert.equal(sbEq("email", "inquilina@rentaly.madrid"), "email=eq.inquilina%40rentaly.madrid");
    assert.equal(
      sbEq("cacheKey", "https://ovc.example/x?a=1&b=2"),
      "cacheKey=eq.https%3A%2F%2Fovc.example%2Fx%3Fa%3D1%26b%3D2",
    );
    assert.equal(sbIn("id", ["a-1", "b-2"]), "id=in.(a-1,b-2)");
  });

  it("does not treat the secret as present when the env var is empty", () => {
    const previous = process.env.SUPABASE_SECRET_KEY;
    const previousService = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    try {
      assert.equal(hasSupabase(), false);
    } finally {
      if (previous !== undefined) process.env.SUPABASE_SECRET_KEY = previous;
      if (previousService !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = previousService;
    }
  });
});
