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
    const { readTreasuryState, inspectTreasuryTransaction, simulateTreasuryTransaction } = await import("@/lib/treasury.server");
    const existing = await readTreasuryState(data.mint);
    if (existing.connected) return { connected: true as const, tx: null };
    const { buildDirectTreasuryTransaction } = await import("@/lib/treasury-builder.server");
    const tx = await buildDirectTreasuryTransaction(data.mint, data.publicKey);
    inspectTreasuryTransaction(tx, data.publicKey, data.mint);
    await simulateTreasuryTransaction(tx, data.mint);
    return { connected: false as const, tx };
  });