import { describe, expect, it } from "vitest";
import { TREASURY_SHARE_BPS, TREASURY_WALLET, requireConfirmation, walletAddressSchema } from "@/lib/treasury-rules";

describe("treasury fee sharing", () => {
  it("routes 100% of creator fees to the requested treasury", () => {
    expect(TREASURY_SHARE_BPS).toBe(10000);
    expect(TREASURY_WALLET).toBe("5riNhBDZBkkrT4HFDDW8CrCu2Q98ak4Nv7tCdBd4sPUN");
    expect(walletAddressSchema.parse(TREASURY_WALLET)).toBe(TREASURY_WALLET);
  });

  it("never treats a submitted but unconfirmed transaction as connected", () => {
    expect(() => requireConfirmation({ signature: "pending", confirmed: false })).toThrow();
    expect(requireConfirmation({ signature: "confirmed", confirmed: true })).toBe("confirmed");
  });
});