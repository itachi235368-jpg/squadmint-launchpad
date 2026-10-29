import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TREASURY_SHARE_BPS, TREASURY_WALLET, walletAddressSchema } from "@/lib/treasury-rules";

export const treasuryState = createServerFn({ method: "POST" })
  .inputValidator(d => z.object({ mint: walletAddressSchema }).parse(d))
  .handler(async ({ data }) => {
    const { readTreasuryState } = await import("@/lib/treasury.server");
    return readTreasuryState(data.mint);
  });

export const buildTreasuryTx = createServerFn({ method: "POST" })
  .inputValidator(d => z.object({ mint: walletAddressSchema, publicKey: walletAddressSchema }).parse(d))
  .handler(async ({ data }) => {
    const { readTreasuryState, inspectTreasuryTransaction } = await import("@/lib/treasury.server");
    const existing = await readTreasuryState(data.mint);
    if (existing.connected) return { connected: true as const, tx: null };
    const response = await fetch("https://fun-block.pump.fun/agents/sharing-config", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mint: data.mint, user: data.publicKey,
        shareholders: [{ address: TREASURY_WALLET, bps: TREASURY_SHARE_BPS }],
        frontRunningProtection: false, tipAmount: 0, encoding: "base64" }),
    });
    if (!response.ok) {
      console.error("Pump.fun fee-sharing builder failed", response.status, await response.text());
      throw new Error("Pump.fun could not prepare fee sharing. Use the coin's creator wallet; already-finalized allocations cannot be changed.");
    }
    const result = z.object({ transaction: z.string().min(10) }).parse(await response.json());
    inspectTreasuryTransaction(result.transaction, data.publicKey, data.mint);
    return { connected: false as const, tx: result.transaction };
  });