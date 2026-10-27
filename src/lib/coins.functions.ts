import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { coinLaunchSchema } from "@/lib/coin-schema";

function publishableClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public directory of every coin launched through the site, newest first. */
export const listCoins = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await publishableClient()
      .from("coins")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("listCoins failed:", error.message);
      return { coins: [], error: "Could not load coins" };
    }
    return { coins: data ?? [], error: null as string | null };
  } catch (e) {
    console.error("listCoins failed:", e);
    return { coins: [], error: "Could not load coins" };
  }
});

/** Finds a launched coin by its ticker (case-insensitive). */
export const getCoinByTicker = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ ticker: z.string().max(20) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { data: rows, error } = await publishableClient()
        .from("coins")
        .select("*")
        .eq("symbol", data.ticker.trim().toUpperCase())
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) {
        console.error("getCoinByTicker failed:", error.message);
        return { coin: null, error: "Could not load the coin" };
      }
      return { coin: rows?.[0] ?? null, error: null as string | null };
    } catch (e) {
      console.error("getCoinByTicker failed:", e);
      return { coin: null, error: "Could not load the coin" };
    }
  });

/** Saves a confirmed launch to the directory. Verifies the coin and its transaction on Solana first. */
export const saveLaunchCoin = createServerFn({ method: "POST" })
  .inputValidator((d) => coinLaunchSchema.parse(d))
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

    // The coin must exist on-chain and its launch transaction must be confirmed.
    const acct = (await call("getAccountInfo", [data.mint, { encoding: "base64" }])) as { value: unknown };
    if (!acct.value) throw new Error("Coin not found on Solana — nothing to save.");
    const st = (await call("getSignatureStatuses", [[data.signature]])) as {
      value: Array<{ confirmationStatus?: string; err: unknown } | null>;
    };
    const s = st.value[0];
    if (!s || s.err || !s.confirmationStatus) throw new Error("Launch transaction is not confirmed yet — try again in a moment.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("coins").upsert(
      {
        mint: data.mint,
        name: data.name,
        symbol: data.symbol,
        uri: data.uri,
        image: data.image,
        description: data.description ?? "",
        twitter: data.twitter ?? null,
        telegram: data.telegram ?? null,
        website: data.website ?? null,
        creator_wallet: data.creatorWallet,
        dev_buy_sol: data.devBuySol,
        signature: data.signature,
      },
      { onConflict: "mint" },
    );
    if (error) {
      console.error("saveLaunchCoin insert failed:", error.message);
      throw new Error("Could not save the coin to the quest board. It may already be listed.");
    }
    return { saved: true as const };
  });
