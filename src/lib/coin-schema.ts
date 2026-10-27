import { z } from "zod";

const base58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
const solanaAddr = z.string().regex(base58).refine((s) => s.length >= 32 && s.length <= 44, "Invalid Solana address length");

/** Payload the launch form sends after its transaction confirms on Solana. */
export const coinLaunchSchema = z.object({
  mint: solanaAddr,
  signature: solanaAddr.refine((s) => s.length >= 64, "Invalid transaction signature"),
  name: z.string().trim().min(1).max(32),
  symbol: z.string().trim().regex(/^[A-Z0-9]{1,10}$/),
  uri: z.string().url(),
  image: z.string().url(),
  description: z.string().max(500).default(""),
  twitter: z.string().url().max(200).nullish(),
  telegram: z.string().url().max(200).nullish(),
  website: z.string().url().max(200).nullish(),
  creatorWallet: solanaAddr,
  devBuySol: z.number().min(0).finite(),
});

export type CoinLaunchInput = z.infer<typeof coinLaunchSchema>;
