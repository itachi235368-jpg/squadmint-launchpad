import { z } from "zod";

/** Dev buy in SOL: any amount the creator can cover — no upper cap. */
export const devBuySchema = z.number().min(0);

/** Reads the dev-buy box: empty, negative or nonsense input counts as no dev buy. */
export function parseDevBuy(raw: string): number {
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? v : 0;
}
