import { describe, expect, it } from "vitest";
import { coinLaunchSchema } from "@/lib/coin-schema";
import { coinToToken, fmtMcap, type CoinRow } from "@/lib/data";

const MINT = "1".repeat(44); // '1' is a valid base58 character
const SIG = "1".repeat(70);
const WALLET = "1".repeat(40);

const valid = {
  mint: MINT,
  signature: SIG,
  name: "Test Coin",
  symbol: "TEST",
  uri: "https://ipfs.io/ipfs/meta",
  image: "https://ipfs.io/ipfs/img.png",
  description: "hello",
  creatorWallet: WALLET,
  devBuySol: 42.5,
};

const row: CoinRow = {
  id: "id-1",
  mint: MINT,
  name: "Test Coin",
  symbol: "TEST",
  uri: "https://ipfs.io/ipfs/meta",
  image: "https://ipfs.io/ipfs/img.png",
  description: "hello",
  twitter: "https://x.com/test",
  telegram: null,
  website: "https://minions.quest",
  creator_wallet: WALLET,
  dev_buy_sol: 42.5,
  signature: SIG,
  created_at: new Date().toISOString(),
};

describe("saved launch payload", () => {
  it("accepts a confirmed launch with wallet, mint and signature", () => {
    expect(coinLaunchSchema.parse(valid)).toMatchObject({ symbol: "TEST", devBuySol: 42.5 });
  });

  it("rejects a malformed coin address", () => {
    expect(() => coinLaunchSchema.parse({ ...valid, mint: "short" })).toThrow();
    expect(() => coinLaunchSchema.parse({ ...valid, mint: `${MINT}0` })).toThrow(); // '0' is not base58
  });

  it("rejects a missing transaction signature", () => {
    expect(() => coinLaunchSchema.parse({ ...valid, signature: "1".repeat(30) })).toThrow();
  });

  it("rejects a lowercase ticker and a negative dev buy", () => {
    expect(() => coinLaunchSchema.parse({ ...valid, symbol: "test" })).toThrow();
    expect(() => coinLaunchSchema.parse({ ...valid, devBuySol: -1 })).toThrow();
  });
});

describe("saved coin display", () => {
  it("measures the curve against the 85 SOL graduation", () => {
    const t = coinToToken(row);
    expect(t.curve).toBe(50); // 42.5 dev buy of 85 SOL
    expect(t.pair).toBe("SOL");
    expect(t.ticker).toBe("TEST");
    expect(t.image).toContain("ipfs.io");
    expect(t.twitter).toBe("https://x.com/test");
  });

  it("never shows a fake market cap before live pricing exists", () => {
    expect(coinToToken(row).mcap).toBe(0);
    expect(fmtMcap(0)).toBe("—");
    expect(fmtMcap(1500)).toBe("$1.5K");
  });
});
