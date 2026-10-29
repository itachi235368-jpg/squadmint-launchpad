import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { TREASURY_SHARE_BPS, TREASURY_WALLET } from "@/lib/treasury-rules";

const FEES = "pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ";
const PUMP = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const AMM = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";
const UPDATE = [111, 251, 49, 6, 78, 78, 106, 18];
const CREATE = [195, 78, 86, 76, 111, 52, 251, 213];
const CONFIG = [216, 74, 9, 0, 56, 140, 93, 75];
const matches = (data: Uint8Array, prefix: number[]) => prefix.every((b, i) => data[i] === b);
const decode = (encoded: string) => Uint8Array.from(atob(encoded), c => c.charCodeAt(0));

export async function solanaCall<T>(method: string, params: unknown[]): Promise<T> {
  const key = process.env["HELIUS_API_KEY"];
  if (!key) throw new Error("Solana connection is not configured");
  const r = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!r.ok) throw new Error("Solana connection is temporarily unavailable");
  const j = await r.json() as { result: T; error?: { message: string } };
  if (j.error) throw new Error("Solana could not verify the treasury transaction");
  return j.result;
}

function configAddress(mint: string) {
  return PublicKey.findProgramAddressSync([new TextEncoder().encode("sharing-config"), new PublicKey(mint).toBytes()], new PublicKey(FEES))[0];
}

type ConfigAccount = { owner: string; data: [string, string] };

function isTreasuryConfig(account: ConfigAccount | null, mint: string) {
  if (!account) return false;
  const data = decode(account.data[0]);
  if (account.owner !== FEES || data.length < 80 || !matches(data, CONFIG)) throw new Error("Unexpected fee-sharing account");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  // Official Pump Fees IDL: bump, version, status, mint, admin, revoked, Vec<Shareholder>.
  return data.length >= 114 && data[10] === 1 && new PublicKey(data.slice(11, 43)).toBase58() === mint
    && data[75] === 1 && view.getUint32(76, true) === 1
    && new PublicKey(data.slice(80, 112)).toBase58() === TREASURY_WALLET
    && view.getUint16(112, true) === TREASURY_SHARE_BPS;
}

export async function readTreasuryState(mint: string) {
  const address = configAddress(mint).toBase58();
  const result = await solanaCall<{ value: ConfigAccount | null }>("getAccountInfo", [address, { encoding: "base64", commitment: "confirmed" }]);
  return { connected: isTreasuryConfig(result.value, mint), address };
}

export async function simulateTreasuryTransaction(tx: string, mint: string) {
  const result = await solanaCall<{ value: { err: unknown; accounts?: Array<ConfigAccount | null> } }>("simulateTransaction", [tx, {
    encoding: "base64", sigVerify: false, replaceRecentBlockhash: true, commitment: "confirmed",
    accounts: { encoding: "base64", addresses: [configAddress(mint).toBase58()] },
  }]);
  if (result.value.err || !isTreasuryConfig(result.value.accounts?.[0] ?? null, mint)) {
    throw new Error("Treasury approval did not pass Solana's checks. Make sure this is the creator wallet and the allocation is still editable.");
  }
}

/** Reject unrelated programs, transfers, extra signers and a different final fee allocation. */
export function inspectTreasuryTransaction(encoded: string, user: string, mint: string) {
  const tx = VersionedTransaction.deserialize(decode(encoded));
  const msg = tx.message;
  if (msg.addressTableLookups.length) throw new Error("Fee-sharing approval uses unsupported address lookups");
  const keys = msg.staticAccountKeys;
  if (keys[0]?.toBase58() !== user || msg.header.numRequiredSignatures !== 1) throw new Error("Unexpected fee-sharing signer");
  let updateCount = 0;
  for (const ix of msg.compiledInstructions) {
    const program = keys[ix.programIdIndex]?.toBase58();
    const data = ix.data;
    if (program === "ComputeBudget111111111111111111111111111111") {
      const v = new DataView(data.buffer, data.byteOffset, data.byteLength);
      if (data[0] === 2 && data.length === 5 && v.getUint32(1, true) <= 1_400_000) continue;
      if (data[0] === 3 && data.length === 9 && v.getBigUint64(1, true) <= 1_000_000n) continue;
      throw new Error("Unexpected fee-sharing network fee");
    }
    if (program === FEES && (matches(data, CREATE) || matches(data, UPDATE))) {
      if (matches(data, CREATE) && data.length !== 8) throw new Error("Unexpected fee-sharing creation arguments");
      if (keys[ix.accountKeyIndexes[2] ?? -1]?.toBase58() !== user
        || keys[ix.accountKeyIndexes[4] ?? -1]?.toBase58() !== mint
        || keys[ix.accountKeyIndexes[5] ?? -1]?.toBase58() !== configAddress(mint).toBase58()) throw new Error("Fee-sharing coin or authority mismatch");
      if (matches(data, UPDATE)) {
        const v = new DataView(data.buffer, data.byteOffset, data.byteLength);
        if (data.length !== 46 || v.getUint32(8, true) !== 1
          || new PublicKey(data.slice(12, 44)).toBase58() !== TREASURY_WALLET
          || v.getUint16(44, true) !== TREASURY_SHARE_BPS) throw new Error("Treasury allocation mismatch");
        updateCount++;
      }
      continue;
    }
    const sweep = [32, 246, 191, 52, 8, 201, 73, 186];
    const allowed = program === PUMP
      ? [sweep, [255, 203, 19, 79, 244, 68, 8, 159], [165, 114, 103, 0, 121, 206, 247, 81]]
      : program === AMM ? [sweep, [1, 33, 78, 185, 33, 67, 44, 92], [139, 52, 134, 85, 228, 229, 108, 241]] : [];
    if (!allowed.some(prefix => matches(data, prefix))) throw new Error("Unexpected operation in treasury approval");
  }
  if (updateCount !== 1) throw new Error("Treasury approval is missing its final fee allocation");
}