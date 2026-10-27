import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const toB64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
};

async function pinataUpload(jwt: string, file: Blob, name: string) {
  const fd = new FormData();
  fd.append("network", "public");
  fd.append("file", file, name);
  const res = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: fd,
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Pinata upload failed [${res.status}]: ${body}`);
    throw new Error("Image storage upload failed. Please try again.");
  }
  const json = (await res.json()) as { data: { cid: string } };
  return `https://ipfs.io/ipfs/${json.data.cid}`;
}

/** Uploads the mascot image + token metadata to IPFS via Pinata, returns the metadata URI. */
export const uploadMetadata = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data");
    const file = data.get("image");
    if (!(file instanceof File) || file.size === 0) throw new Error("Mascot image is required");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
    const meta = z
      .object({
        name: z.string().trim().min(1).max(32),
        symbol: z.string().trim().regex(/^[A-Z0-9]{1,10}$/),
        description: z.string().max(500).default(""),
        twitter: z.string().url().max(200).optional(),
        telegram: z.string().url().max(200).optional(),
        website: z.string().url().max(200).optional(),
      })
      .parse({
        name: data.get("name"), symbol: data.get("symbol"), description: data.get("description") ?? "",
        twitter: data.get("twitter") ?? undefined, telegram: data.get("telegram") ?? undefined, website: data.get("website") ?? undefined,
      });
    return { file, ...meta };
  })
  .handler(async ({ data }) => {
    const jwt = process.env["PINATA_JWT"];
    if (!jwt) throw new Error("Image storage is not configured");
    const image = await pinataUpload(jwt, data.file, data.file.name || "mascot.png");
    const metaJson = JSON.stringify({
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      image,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website ?? "https://minions.quest",
      showName: true,
    });
    const uri = await pinataUpload(jwt, new Blob([metaJson], { type: "application/json" }), "metadata.json");
    return { uri, image };
  });

/** Builds an unsigned Pump.fun create transaction for the creator's wallet. */
export const buildCreateTx = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        publicKey: z.string().min(32).max(44),
        mint: z.string().min(32).max(44),
        name: z.string().min(1).max(32),
        symbol: z.string().regex(/^[A-Z0-9]{1,10}$/),
        uri: z.string().url(),
        devBuySol: z.number().min(0).max(10),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const res = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: data.publicKey,
        action: "create",
        tokenMetadata: { name: data.name, symbol: data.symbol, uri: data.uri },
        mint: data.mint,
        denominatedInSol: "true",
        amount: data.devBuySol,
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Create tx build failed [${res.status}]: ${body}`);
      throw new Error(`Could not prepare the launch: ${body.slice(0, 200)}`);
    }
    return { tx: toB64(await res.arrayBuffer()) };
  });

/** Sends a fully-signed transaction through Helius and waits for confirmation. */
export const sendSignedTx = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ tx: z.string().min(10).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["HELIUS_API_KEY"];
    if (!key) throw new Error("Solana connection is not configured");
    const rpc = `https://mainnet.helius-rpc.com/?api-key=${key}`;
    const call = async (method: string, params: unknown[]) => {
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      const j = (await r.json()) as { result?: unknown; error?: { message: string } };
      if (j.error) throw new Error(j.error.message);
      return j.result;
    };
    const sig = (await call("sendTransaction", [data.tx, { encoding: "base64", skipPreflight: false, maxRetries: 3 }])) as string;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const st = (await call("getSignatureStatuses", [[sig]])) as { value: Array<{ confirmationStatus?: string; err: unknown } | null> };
      const s = st.value[0];
      if (s?.err) throw new Error("The launch transaction failed on Solana.");
      if (s && (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized")) return { signature: sig, confirmed: true };
    }
    return { signature: sig, confirmed: false };
  });

export const getTreasury = createServerFn({ method: "GET" }).handler(async () => ({
  treasury: process.env["TREASURY_WALLET"] ?? "",
}));
