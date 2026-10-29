import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildTreasuryTx, treasuryState } from "@/lib/treasury.functions";
import { sendSignedTx } from "@/lib/launch.functions";
import { requireConfirmation, TREASURY_WALLET, walletAddressSchema } from "@/lib/treasury-rules";

export function TreasuryConnection({ mint: launchedMint }: { mint?: string }) {
  const [mint, setMint] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const build = useServerFn(buildTreasuryTx);
  const send = useServerFn(sendSignedTx);
  const verify = useServerFn(treasuryState);
  const coin = launchedMint ?? mint.trim();

  async function connectTreasury() {
    setError(null); setBusy(true);
    try {
      walletAddressSchema.parse(coin);
      setStatus("Checking treasury allocation…");
      if ((await verify({ data: { mint: coin } })).connected) { setConnected(true); return; }
      if (signature) throw new Error("The submitted approval is still confirming. Check the receipt, then check again.");
      const wallet = (window as unknown as { solana?: {
        connect(): Promise<{ publicKey: { toString(): string } }>;
        signTransaction<T>(tx: T): Promise<T>;
      } }).solana;
      if (!wallet) throw new Error("Connect with Phantom using the wallet that created this coin.");
      const { publicKey } = await wallet.connect();
      setStatus("Preparing treasury approval…");
      const result = await build({ data: { mint: coin, publicKey: publicKey.toString() } });
      if (result.connected) { setConnected(true); return; }
      if (!result.tx) throw new Error("Treasury approval was not prepared");
      const { VersionedTransaction } = await import("@solana/web3.js");
      const tx = VersionedTransaction.deserialize(Uint8Array.from(atob(result.tx), c => c.charCodeAt(0)));
      setStatus("Approve 100% creator fee sharing in your wallet…");
      const signed = await wallet.signTransaction(tx);
      let encoded = "";
      signed.serialize().forEach(b => { encoded += String.fromCharCode(b); });
      setStatus("Confirming treasury approval…");
      const sent = await send({ data: { tx: btoa(encoded) } });
      setSignature(sent.signature);
      requireConfirmation(sent);
      if (!(await verify({ data: { mint: coin } })).connected) throw new Error("Approval submitted, but the treasury allocation is not verified yet. Check again shortly.");
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Treasury connection failed");
    } finally { setStatus(null); setBusy(false); }
  }

  return (
    <section className="mt-6 border-t pt-6" aria-label="Treasury fee sharing">
      <h2 className="font-display text-xl">{launchedMint ? "Finish treasury connection" : "Connect an existing coin"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">100% of future creator fees go to the treasury after this separate wallet approval. This allocation is permanent. Previously accrued fees follow the old allocation; fee payouts require collection on Pump.fun.</p>
      <p className="mt-2 break-all font-mono text-xs text-muted-foreground">Treasury: {TREASURY_WALLET}</p>
      {!launchedMint && <input aria-label="Existing coin address" placeholder="Coin mint address" value={mint} disabled={busy}
        onChange={e => { setMint(e.target.value); setConnected(false); setSignature(null); setError(null); }}
        className="mt-3 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm" />}
      {connected ? <p role="status" className="mt-4 text-sm font-semibold text-success">Treasury connected · 100% creator fee allocation verified on Solana</p> : <>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={consent} disabled={busy} onChange={e => setConsent(e.target.checked)} className="mt-1 accent-primary" />
          <span>I approve permanently allocating 100% of future creator fees to this treasury.</span>
        </label>
        <Button type="button" disabled={!consent || !coin || busy} onClick={() => void connectTreasury()} className="mt-4 h-auto w-full whitespace-normal py-3">
          <Link2 />{busy ? status : signature ? "Check treasury connection" : "Approve treasury fee sharing"}
        </Button>
      </>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {signature && <a className="mt-3 inline-flex items-center gap-1 text-sm underline" href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noreferrer"><ExternalLink className="size-3" />Treasury approval receipt</a>}
    </section>
  );
}