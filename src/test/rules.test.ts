import { describe, expect, it } from "vitest";
import { TOKENS, isTickerTaken, squadActive } from "@/lib/data";

describe("launch & squad rules", () => {
  it("flags an existing ticker as taken", () => {
    expect(isTickerTaken("frogz")).toBe(true);
    expect(isTickerTaken("NEWCOIN")).toBe(false);
  });
  it("squad activates at $10K market cap", () => {
    const base = TOKENS[0]!;
    expect(squadActive({ ...base, mcap: 9999 })).toBe(false);
    expect(squadActive({ ...base, mcap: 10000 })).toBe(true);
  });
});
