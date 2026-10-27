import { describe, expect, it } from "vitest";
import { MINIONS, TOKENS, isTickerTaken, randomLog, squadActive, type Token } from "@/lib/data";
import { STATIONS } from "@/components/loft";

describe("launch & squad rules", () => {
  it("ships with no simulated coins", () => {
    expect(TOKENS).toEqual([]);
    expect(isTickerTaken("FROGZ")).toBe(false);
  });
  it("squad activates at $10K market cap", () => {
    const base: Token = { ticker: "TEST", name: "Test", emoji: "🧪", mcap: 0, change: 0, curve: 0, level: 1, pair: "SOL", age: "1m", holders: 0, style: "Cartoon", burned: 0 };
    expect(squadActive({ ...base, mcap: 9999 })).toBe(false);
    expect(squadActive({ ...base, mcap: 10000 })).toBe(true);
  });
});

describe("five-minion roster", () => {
  it("contains exactly Bob, Kevin, Stuart, Otto and Dave in order", () => {
    expect(MINIONS.map((m) => m.name)).toEqual(["Bob", "Kevin", "Stuart", "Otto", "Dave"]);
    expect(STATIONS.map((s) => s.id)).toEqual(["bob", "kevin", "stuart", "otto", "dave"]);
  });
  it.each([
    ["bob", "Alpha & Narrative Scout", ["scrapes X narratives", "tracks competitor tickers", "detects sentiment surges"]],
    ["kevin", "Official X Creator & Socials", ["created @coin official account", "queued launch thread", "initiated viral raid"]],
    ["stuart", "Bonding Curve & DEX Migration", ["monitored curve to 100%", "triggered DEX graduation", "deposited liquidity & burnt LP"]],
    ["otto", "Buyback & Burn Engine", ["automated buyback executed", "burned supply tokens", "updated live burn proof"]],
    ["dave", "Web Builder & Operations HQ", ["deployed live website", "connected live DEX chart", "optimized CDN assets"]],
  ])("assigns %s its exact role and task actions", (id, role, actions) => {
    const minion = MINIONS.find((m) => m.id === id);
    expect(minion?.role).toBe(role);
    expect(minion?.actions).toEqual(actions);
    expect(randomLog(["FROGZ"], id).minion.id).toBe(id);
  });
  it("includes Stuart's 100% graduation, fees and both liquidity destinations", () => {
    const stuart = MINIONS.find((m) => m.id === "stuart");
    expect(stuart?.bio).toContain("100%");
    expect(stuart?.bio).toContain("pays graduation fees");
    expect(stuart?.bio).toContain("Raydium / Meteora");
  });
  it("limits the shared feed to the five current minions", () => {
    for (let i = 0; i < 50; i++) {
      expect(["bob", "kevin", "stuart", "otto", "dave"]).toContain(randomLog().minion.id);
    }
  });
});
