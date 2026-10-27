import { describe, expect, it } from "vitest";
import { devBuySchema, parseDevBuy } from "@/lib/launch-rules";

describe("dev buy amount", () => {
  it("accepts any positive amount, however large", () => {
    expect(devBuySchema.parse(0)).toBe(0);
    expect(devBuySchema.parse(0.5)).toBe(0.5);
    expect(devBuySchema.parse(10)).toBe(10);
    expect(devBuySchema.parse(500)).toBe(500);
    expect(devBuySchema.parse(100000)).toBe(100000);
  });

  it("still refuses negative and non-finite amounts", () => {
    expect(() => devBuySchema.parse(-1)).toThrow();
    expect(() => devBuySchema.parse(Infinity)).toThrow();
    expect(() => devBuySchema.parse("10")).toThrow();
  });

  it("reads the typed box without capping the amount", () => {
    expect(parseDevBuy("")).toBe(0);
    expect(parseDevBuy("0")).toBe(0);
    expect(parseDevBuy("7.25")).toBe(7.25);
    expect(parseDevBuy("250")).toBe(250);
    expect(parseDevBuy("-5")).toBe(0);
    expect(parseDevBuy("abc")).toBe(0);
  });
});
