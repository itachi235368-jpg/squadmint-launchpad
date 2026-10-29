import { z } from "zod";

export const TREASURY_WALLET = "5riNhBDZBkkrT4HFDDW8CrCu2Q98ak4Nv7tCdBd4sPUN";
export const TREASURY_SHARE_BPS = 10_000;
export const walletAddressSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Enter a valid Solana address");

export function requireConfirmation(result: { signature: string; confirmed: boolean }) {
  if (!result.confirmed) throw new Error("Transaction is still confirming. Check its receipt before retrying.");
  return result.signature;
}