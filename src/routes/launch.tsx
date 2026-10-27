import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MINIONS, isTickerTaken } from "@/lib/data";
import { PageHead, pillDark } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { uploadMetadata, buildCreateTx, sendSignedTx, saveLaunchCoin } from "@/lib/launch.functions";
import { parseDevBuy, curveFill, CURVE_GRADUATION_SOL } from "@/lib/launch-rules";

type Phantom = { publicKey?: { toString(): string }; connect(): Promise<{ publicKey: { toString(): string } }>; signTransaction<T>(tx: T): Promise<T> };
const getPhantom = () => (window as unknown as { solana?: Phantom & { isPhantom?: boolean } }).solana;
const b64ToBytes = (b: string) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
const bytesToB64 = (u: Uint8Array) => { let s = ""; u.forEach((x) => (s += String.fromCharCode(x))); return btoa(s); };

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Launch a coin — MINIONS" },
      { name: "description", content: "Launch a Solana memecoin and hire a squad of 5 AI minions to market it." },
      { property: "og:title", content: "Launch a coin — MINIONS" },
      { property: "og:description", content: "Name it, pick a style, deploy a squad." },
    ],
  }),
  component: Launch,
});

const STYLES = ["Pixel Art", "Cartoon", "Anime", "3D Render", "Editorial", "Doodle"];
const PAIRS = ["SOL"];
const field = "w-full rounded-xl border bg-background px-4 py-2.5 outline-none focus:border-foreground/50";

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-b py-8 md:grid-cols-[200px_1fr]">
      <div>
        <div className="font-mono text-xs text-muted-foreground">STEP {String(n).padStart(2, "0")}</div>
        <div className="font-display text-xl font-medium">{title}</div>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Launch() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [style, setStyle] = useState("Pixel Art");
  const [pair, setPair] = useState("SOL");
  const [dev, setDev] = useState(0.5);
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [links, setLinks] = useState({ twitter: "", telegram: "", website: "" });
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mint: string; signature: string; confirmed: boolean } | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const upload = useServerFn(uploadMetadata);
  const build = useServerFn(buildCreateTx);
  const send = useServerFn(sendSignedTx);
  const save = useServerFn(saveLaunchCoin);

  async function connect() {
    const p = getPhantom();
    if (!p) { setError("No Solana wallet found. Install Phantom (or another Solana wallet) and refresh."); return null; }
    const r = await p.connect();
    const pk = r.publicKey.toString();
    setWallet(pk);
    return pk;
  }

  async function launch() {
    setError(null); setResult(null);
    if (!file) { setError("Please upload a mascot image."); return; }
    setBusy(true);
    try {
      const pk = wallet ?? (await connect());
      if (!pk) return;
      setStatus("Uploading image and details…");
      const fd = new FormData();
      fd.append("image", file); fd.append("name", name); fd.append("symbol", ticker); fd.append("description", desc);
      Object.entries(links).forEach(([k, v]) => v.trim() && fd.append(k, v.trim()));
      const { uri } = await upload({ data: fd });
      setStatus("Preparing launch…");
      const { Keypair, VersionedTransaction } = await import("@solana/web3.js");
      const mint = Keypair.generate();
      const { tx } = await build({ data: { publicKey: pk, mint: mint.publicKey.toBase58(), name, symbol: ticker, uri, devBuySol: dev } });
      const vtx = VersionedTransaction.deserialize(b64ToBytes(tx));
      vtx.sign([mint]);
      setStatus("Approve the launch in your wallet…");
      const signed = await getPhantom()!.signTransaction(vtx);
      setStatus("Sending to Solana…");
      const r = await send({ data: { tx: bytesToB64(signed.serialize()) } });
      setResult({ mint: mint.publicKey.toBase58(), ...r });
      setStatus(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Launch failed");
      setStatus(null);
    } finally { setBusy(false); }
  }
  const taken = ticker.length > 0 && isTickerTaken(ticker);

  const pts = Array.from({ length: 41 }, (_, i) => { const x = i / 40; return `${6 + x * 288},${150 - x * x * 140}`; }).join(" ");
  const devX = curveFill(dev);

  return (
    <div>
      <PageHead kicker="Launch" title="Launch a coin" sub="Four steps. Your squad of 5 minions starts working the moment it's live." />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={(e) => { e.preventDefault(); if (!taken && !busy) void launch(); }}>
          <Step n={1} title="Name & ticker">
            <div className="grid gap-3 sm:grid-cols-2">
              <input required className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Coin name" />
              <div>
                <input required maxLength={10} className={cn(field, "font-mono uppercase", taken && "border-destructive")} value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="TICKER" />
                {ticker && (
                  <p className={cn("mt-1.5 text-xs", taken ? "text-destructive" : "text-success")}>
                    {taken ? `$${ticker} is already taken` : `$${ticker} is available`}
                  </p>
                )}
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 text-sm">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border bg-secondary">
                {img ? <img src={img} alt="Mascot preview" className="h-full w-full object-cover" /> : "＋"}
              </span>
              <span><span className="font-semibold">Upload mascot</span><span className="block text-xs text-muted-foreground">PNG or JPG, square works best</span></span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setImg(URL.createObjectURL(f)); } }} />
            </label>
            <textarea className={cn(field, "mt-3")} rows={2} maxLength={500} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" />
            <p className="mt-3 text-xs text-muted-foreground">Links (optional)</p>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-3">
              {([["twitter", "X link"], ["telegram", "Telegram"], ["website", "Website"]] as const).map(([k, ph]) => (
                <input key={k} type="url" className={field} value={links[k]} placeholder={ph}
                  onChange={(e) => setLinks((l) => ({ ...l, [k]: e.target.value }))} />
              ))}
            </div>
          </Step>
          <Step n={2} title="Pair">
            <div className="flex flex-wrap gap-2">
              {PAIRS.map((p) => (
                <button type="button" key={p} onClick={() => setPair(p)} className={cn("rounded-full border px-5 py-2 font-mono text-sm", pair === p && "border-primary bg-primary text-primary-foreground")}>{p}</button>
              ))}
            </div>
          </Step>
          <Step n={3} title="Art style">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button type="button" key={s} onClick={() => setStyle(s)} className={cn("rounded-xl border px-3 py-3 text-sm", style === s && "border-foreground bg-secondary font-semibold")}>{s}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Kevin configures the coin's profile banners in this style.</p>
          </Step>
          <Step n={4} title="Dev buy">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Optional</span><span className="font-mono">{dev} {pair}</span></div>
            <div className="relative mt-2">
              <input type="number" inputMode="decimal" min={0} step="any" value={dev} placeholder="0"
                onChange={(e) => setDev(parseDevBuy(e.target.value))} className={cn(field, "pr-16 font-mono")} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">SOL</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Any amount you like — you only pay what you can cover.</p>
            <svg viewBox="0 0 300 160" className="mt-4 w-full rounded-xl border bg-card p-2">
              <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth={1.5} />
              <circle cx={6 + devX * 288} cy={150 - devX * devX * 140} r={5} fill="var(--accent)" />
            </svg>
            <p className="mt-2 font-mono text-xs text-muted-foreground">Curve {(devX * 100).toFixed(0)}% filled · {CURVE_GRADUATION_SOL} SOL to graduate</p>
          </Step>
          <div className="pt-8">
            <button type="button" onClick={() => void connect()} className="mb-3 w-full rounded-full border py-3 text-sm font-semibold">
              {wallet ? `Wallet connected · ${wallet.slice(0, 4)}…${wallet.slice(-4)}` : "Connect wallet"}
            </button>
            <button disabled={taken || busy} className={cn(pillDark, "w-full py-3.5 disabled:opacity-40")}>{busy ? status ?? "Working…" : "Launch coin & deploy squad"}</button>
            <p className="mt-3 text-xs text-muted-foreground">Launches on Pump.fun from your wallet. You pay the network fee plus your dev buy.</p>
            {error && <p className="mt-4 rounded-xl border border-destructive p-4 text-sm text-destructive">{error}</p>}
            {result && (
              <div className="mt-4 animate-slidein rounded-xl border border-success p-4 text-sm">
                <p className="text-success">${ticker} {result.confirmed ? "is live" : "was sent (still confirming)"}. Squad assembling: {MINIONS.map((m) => m.name).join(", ")}.</p>
                <p className="mt-2 break-all font-mono text-xs">Coin address: {result.mint}</p>
                <div className="mt-2 flex gap-4 text-xs underline">
                  <a href={`https://pump.fun/coin/${result.mint}`} target="_blank" rel="noreferrer">View on Pump.fun</a>
                  <a href={`https://solscan.io/tx/${result.signature}`} target="_blank" rel="noreferrer">View transaction</a>
                </div>
              </div>
            )}
          </div>
        </form>
        <aside className="lg:pt-8">
          <div className="sticky top-24 rounded-2xl border bg-card p-5">
            <div className="font-mono text-xs text-muted-foreground">PREVIEW</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border bg-secondary">{img ? <img src={img} alt="" className="h-full w-full object-cover" /> : "?"}</div>
              <div><div className="font-display text-lg">{name || "Your coin"}</div><div className="font-mono text-xs text-muted-foreground">${ticker || "TICKER"} · {pair}</div></div>
            </div>
            <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">Style: {style}<br />Squad: 5 minions · starts raiding at $10K</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
