import { z } from "zod";

/** Dev buy in SOL: any amount the creator can cover — no upper cap. */
export const devBuySchema = z.number().min(0).finite();

/** Reads the dev-buy box: empty, negative or nonsense input counts as no dev buy. */
export function parseDevBuy(raw: string): number {
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/** SOL needed to fill the bonding curve and graduate the coin. */
export const CURVE_GRADUATION_SOL = 85;

/** How far a dev buy pushes the curve: 0 = empty, 1 = full (graduated). */
export const curveFill = (devBuySol: number) => Math.min(devBuySol / CURVE_GRADUATION_SOL, 1);
