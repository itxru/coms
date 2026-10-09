import { describe, expect, it } from "vitest";

import { getTokenExpiration, isTokenExpired } from "../utils/token";

// Creates a mock JWT for testing the frontend utility.
// This token is NOT signed and must never be used for authentication.
function createMockToken(payload: object): string {
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `header.${encodedPayload}.signature`;
}

describe("COMS JWT expiration utility", () => {
  it("reads a valid expiration timestamp", () => {
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockToken({ exp: expiration });

    expect(getTokenExpiration(token)).toBe(expiration * 1000);
  });

  it("accepts a token that has not expired", () => {
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockToken({ exp: expiration });

    expect(isTokenExpired(token)).toBe(false);
  });

  it("detects an expired token", () => {
    const expiration = Math.floor(Date.now() / 1000) - 60;
    const token = createMockToken({ exp: expiration });

    expect(isTokenExpired(token)).toBe(true);
  });

  it("rejects a token without an expiration claim", () => {
    const token = createMockToken({ sub: "123" });

    expect(getTokenExpiration(token)).toBeNull();
    expect(isTokenExpired(token)).toBe(true);
  });

  it("rejects a token with an invalid expiration type", () => {
    const token = createMockToken({ exp: "tomorrow" });

    expect(getTokenExpiration(token)).toBeNull();
    expect(isTokenExpired(token)).toBe(true);
  });

  it("rejects a malformed JWT", () => {
    expect(getTokenExpiration("invalid-token")).toBeNull();
    expect(isTokenExpired("invalid-token")).toBe(true);
  });

  it("rejects an invalid JWT payload", () => {
    const token = "header.not-valid-json.signature";

    expect(getTokenExpiration(token)).toBeNull();
    expect(isTokenExpired(token)).toBe(true);
  });

  it("rejects a token with an infinite expiration", () => {
    const token = createMockToken({ exp: "Infinity" });

    expect(getTokenExpiration(token)).toBeNull();
    expect(isTokenExpired(token)).toBe(true);
  });
});
