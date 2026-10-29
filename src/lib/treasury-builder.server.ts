import { Buffer } from "buffer";
import { PublicKey, TransactionMessage, VersionedTransaction, ComputeBudgetProgram, type TransactionInstruction } from "@solana/web3.js";
import { PUMP_SDK, bondingCurvePda, canonicalPumpPoolPda, feeSharingConfigPda } from "@pump-fun/pump-sdk";
import { solanaCall } from "@/lib/treasury.server";
import { TREASURY_WALLET, TREASURY_SHARE_BPS } from "@/lib/treasury-rules";

const NATIVE = new PublicKey("So11111111111111111111111111111111111111112");
const TOKEN = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
type RpcAccount = { data: [string, string]; owner: string; lamports: number; executable: boolean; rentEpoch: number };
const accountInfo = (a: RpcAccount) => ({ ...a, data: Buffer.from(a.data[0], "base64"), owner: new PublicKey(a.owner) });

/** Builds locally with the official SDK; no hosted builder or treasury key required. */
export async function buildDirectTreasuryTransaction(mintAddress: string, userAddress: string) {
  const mint = new PublicKey(mintAddress), user = new PublicKey(userAddress);
  const configPda = feeSharingConfigPda(mint);
  const accounts = await solanaCall<{ value: Array<RpcAccount | null> }>("getMultipleAccounts", [
    [bondingCurvePda(mint).toBase58(), configPda.toBase58(), canonicalPumpPoolPda(mint).toBase58()],
    { encoding: "base64", commitment: "confirmed" },
  ]);
  const curveInfo = accounts.value[0], configInfo = accounts.value[1], poolInfo = accounts.value[2];
  if (!curveInfo || curveInfo.owner !== "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P") throw new Error("Pump.fun bonding curve not found for this coin");
  const curve = PUMP_SDK.decodeBondingCurve(accountInfo(curveInfo));
  if (curve.quoteMint && !curve.quoteMint.equals(PublicKey.default) && !curve.quoteMint.equals(NATIVE)) throw new Error("Treasury setup currently supports SOL-paired coins only");
  if (configInfo && configInfo.owner !== "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ") throw new Error("Unexpected fee-sharing account owner");
  const config = configInfo ? PUMP_SDK.decodeSharingConfig(accountInfo(configInfo)) : null;
  if (config ? config.adminRevoked || !config.admin.equals(user) : !curve.creator.equals(user)) {
    throw new Error("Use the coin's creator wallet. A finalized fee allocation cannot be changed.");
  }
  const instructions: TransactionInstruction[] = [ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })];
  // Only sweep nonempty buckets, avoiding rent/ATA setup on legacy empty curves.
  if (!curve.creatorFee.isZero()) instructions.push(await PUMP_SDK.sweepCreatorFeeInstruction({
    payer: user, mint, creator: curve.creator, quoteMint: NATIVE, quoteTokenProgram: TOKEN,
  }));
  if (poolInfo) {
    if (poolInfo.owner !== "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA") throw new Error("Unexpected Pump.fun pool owner");
    const poolData = Buffer.from(poolInfo.data[0], "base64");
    if (poolData.length >= 287 && poolData.readBigUInt64LE(279) > 0n) instructions.push(await PUMP_SDK.sweepPoolCreatorFeeInstruction({
      payer: user, mint, coinCreator: new PublicKey(poolData.subarray(211, 243)), quoteMint: NATIVE, quoteTokenProgram: TOKEN,
    }));
  }
  if (!config) instructions.push(await PUMP_SDK.createFeeSharingConfig({ creator: user, mint, pool: poolInfo ? canonicalPumpPoolPda(mint) : null }));
  instructions.push(await PUMP_SDK.updateFeeSharesV2({ authority: user, mint,
    currentShareholders: config ? config.shareholders.map(s => s.address) : [user],
    newShareholders: [{ address: new PublicKey(TREASURY_WALLET), shareBps: TREASURY_SHARE_BPS }],
    quoteMint: NATIVE, quoteTokenProgram: TOKEN, bondingCurveComplete: curve.complete,
  }));
  const blockhash = await solanaCall<{ value: { blockhash: string } }>("getLatestBlockhash", [{ commitment: "confirmed" }]);
  const transaction = new VersionedTransaction(new TransactionMessage({ payerKey: user, recentBlockhash: blockhash.value.blockhash, instructions }).compileToV0Message());
  return Buffer.from(transaction.serialize()).toString("base64");
}