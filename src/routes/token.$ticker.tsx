import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MINIONS, fmtMcap, fmtNum, genCandles, type Token } from "@/lib/data";
import { CurveBar, PairBadge, SquadStatus } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { coinByTickerOptions } from "@/lib/coins-query";

export const Route = createFileRoute("/token/$ticker")({
  loader: async ({ params, context }) => {
    const t = await context.queryClient.ensureQueryData(coinByTickerOptions(params.ticker));
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
          { title: `$${loaderData.ticker} HQ — MINIONS` },
          { name: "description", content: `${loaderData.name} bonding curve, squad status and links on MINIONS.` },
          { property: "og:title", content: `$${loaderData.ticker} HQ — MINIONS` },
          { property: "og:description", content: `${loaderData.name} on MINIONS` },
        ]
      : [
          { title: "Coin unavailable — MINIONS" }, { name: "robots", content: "noindex" },
          { name: "description", content: "This coin is not available in the MINIONS launch directory." },
          { property: "og:title", content: "Coin unavailable — MINIONS" },
          { property: "og:description", content: "This coin is not available in the MINIONS launch directory." },
          { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
        ],
  }),
  component: TokenHQ,
});

function Chart({ seed }: { seed: number }) {
  const [mode, setMode] = useState<"candle" | "line">("candle");
  const c = genCandles(48, seed);
  const max = Math.max(...c.map((x) => x.h)), min = Math.min(...c.map((x) => x.l));
  const y = (v: number) => 200 - ((v - min) / (max - min)) * 190;
  const w = 600 / c.length;
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-2 flex gap-2">
        {(["candle", "line"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1 font-mono text-xs", mode === m ? "bg-primary text-primary-foreground" : "border")}>{m}</button>
        ))}
      </div>
      <svg viewBox="0 0 600 210" className="w-full">
        {mode === "candle" ? c.map((k, i) => {
          const up = k.c >= k.o, col = up ? "var(--success)" : "var(--destructive)";
          return (
            <g key={i}>
              <line x1={i * w + w / 2} x2={i * w + w / 2} y1={y(k.h)} y2={y(k.l)} stroke={col} />
              <rect x={i * w + 2} width={w - 4} y={y(Math.max(k.o, k.c))} height={Math.max(1, Math.abs(y(k.o) - y(k.c)))} fill={col} />
            </g>
          );
        }) : <polyline fill="none" stroke="var(--primary)" strokeWidth={2} points={c.map((k, i) => `${i * w + w / 2},${y(k.c)}`).join(" ")} />}
      </svg>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">Sample chart — live DEX data arrives after graduation.</p>
    </div>
  );
}

function Swap({ ticker }: { ticker: string }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amt, setAmt] = useState("");
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} onClick={() => setSide(s)} className={cn("rounded-full py-2 text-sm font-bold uppercase", side === s && (s === "buy" ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"))}>{s}</button>
        ))}
      </div>
      <label className="mt-4 block text-xs text-muted-foreground">Amount ({side === "buy" ? "SOL" : ticker})
        <input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" placeholder="0.0" className="mt-1 w-full rounded-md border bg-input/40 px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-primary" />
      </label>
      <div className="mt-2 flex gap-2">{["0.1", "0.5", "1", "5"].map((v) => <button key={v} onClick={() => setAmt(v)} className="flex-1 rounded border py-1 font-mono text-xs">{v}</button>)}</div>
      <div className="mt-3 font-mono text-xs text-muted-foreground">≈ {amt ? fmtNum(Math.round(+amt * 1_250_000)) : 0} {side === "buy" ? ticker : "SOL×1e-6"}</div>
      <button className={cn("mt-4 w-full rounded-full py-3 font-bold", side === "buy" ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
        {side === "buy" ? "Buy" : "Sell"} ${ticker}
      </button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">Demo only — connect a wallet to trade</p>
    </div>
  );
}

function OnChain({ t }: { t: Token }) {
  if (!t.mint) return null;
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 font-semibold">On-chain</div>
      <p className="break-all font-mono text-xs text-muted-foreground">{t.mint}</p>
      <div className="mt-3 flex flex-col gap-2 text-sm">
        <a href={`https://pump.fun/coin/${t.mint}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">Trade on Pump.fun ↗</a>
        <a href={`https://solscan.io/token/${t.mint}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">View on Solscan ↗</a>
        <a href={`https://solscan.io/tx/${t.mint}`} target="_blank" rel="noreferrer" className="hidden" />
      </div>
      {(t.twitter || t.telegram || t.website) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3 text-xs">
          {t.twitter && <a href={t.twitter} target="_blank" rel="noreferrer" className="rounded-full border bg-secondary px-3 py-1">X ↗</a>}
          {t.telegram && <a href={t.telegram} target="_blank" rel="noreferrer" className="rounded-full border bg-secondary px-3 py-1">Telegram ↗</a>}
          {t.website && <a href={t.website} target="_blank" rel="noreferrer" className="rounded-full border bg-secondary px-3 py-1">Website ↗</a>}
        </div>
      )}
    </div>
  );
}

function TokenHQ() {
  const t = Route.useLoaderData() as Token;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 border-b pb-8">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border bg-secondary font-mono text-xl">
          {t.image ? <img src={t.image} alt="" className="h-full w-full object-cover" /> : t.ticker.charAt(0)}
        </div>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">{t.name} <span className="font-mono text-lg text-muted-foreground">${t.ticker}</span></h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-sm">
            {fmtMcap(t.mcap)}
            {t.mcap > 0 ? (
              <span className={t.change >= 0 ? "text-success" : "text-destructive"}>{t.change >= 0 ? "+" : ""}{t.change}%</span>
            ) : (
              <span className="text-accent">NEW</span>
            )}
            <span className="text-muted-foreground">launched {t.age} ago</span>
            <PairBadge pair={t.pair} /> <SquadStatus t={t} />
          </div>
        </div>
      </div>
      {t.description && <p className="max-w-2xl text-muted-foreground">{t.description}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Chart seed={t.ticker.length * 7 + t.level} />
        </div>
        <div className="space-y-6">
          <Swap ticker={t.ticker} />
          <OnChain t={t} />
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Bonding curve</span><span className="font-mono">{t.curve}%</span></div>
            <CurveBar value={t.curve} />
            <p className="mt-2 text-xs text-muted-foreground">{100 - t.curve}% to graduation · dev buy pushed the curve up</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 font-semibold">Squad</div>
            {MINIONS.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2 py-1 text-sm">
                <span>{m.emoji}</span><span className="flex-1">{m.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{(t.level * 3 + i * 5) % 40 + 4} quests</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
