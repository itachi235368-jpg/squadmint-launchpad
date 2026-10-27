import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TOKENS, MINIONS, fmtUsd, fmtNum, genCandles } from "@/lib/data";
import { CurveBar, Terminal } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/token/$ticker")({
  loader: ({ params }) => {
    const t = TOKENS.find((x) => x.ticker === params.ticker.toUpperCase());
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `$${loaderData.ticker} HQ — minions.quest` },
          { name: "description", content: `${loaderData.name} chart, swap, bonding curve and live AI squad feed.` },
          { property: "og:title", content: `$${loaderData.ticker} HQ — minions.quest` },
          { property: "og:description", content: `${loaderData.name} on minions.quest` },
        ]
      : [{ title: "Unavailable — minions.quest" }, { name: "robots", content: "noindex" }],
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
    <div className="panel p-4">
      <div className="mb-2 flex gap-2">
        {(["candle", "line"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("rounded px-2 py-1 font-mono text-xs", mode === m ? "bg-primary text-primary-foreground" : "border")}>{m}</button>
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
    </div>
  );
}

function Swap({ ticker }: { ticker: string }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amt, setAmt] = useState("");
  return (
    <div className="panel p-4">
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} onClick={() => setSide(s)} className={cn("rounded py-2 text-sm font-bold uppercase", side === s && (s === "buy" ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"))}>{s}</button>
        ))}
      </div>
      <label className="mt-4 block text-xs text-muted-foreground">Amount ({side === "buy" ? "SOL" : ticker})
        <input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" placeholder="0.0" className="mt-1 w-full rounded-md border bg-input/40 px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-primary" />
      </label>
      <div className="mt-2 flex gap-2">{["0.1", "0.5", "1", "5"].map((v) => <button key={v} onClick={() => setAmt(v)} className="flex-1 rounded border py-1 font-mono text-xs">{v}</button>)}</div>
      <div className="mt-3 font-mono text-xs text-muted-foreground">≈ {amt ? fmtNum(Math.round(+amt * 1_250_000)) : 0} {side === "buy" ? ticker : "SOL×1e-6"}</div>
      <button className={cn("mt-4 w-full rounded-md py-3 font-bold", side === "buy" ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
        {side === "buy" ? "Buy" : "Sell"} ${ticker}
      </button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">Demo only — connect a wallet to trade</p>
    </div>
  );
}

function TokenHQ() {
  const t = Route.useLoaderData();
  const memes = ["😂", "🚀", "💎", "🔥", "👑", "🌕"];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-lg bg-secondary text-4xl glow">{t.emoji}</div>
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">${t.ticker} <span className="text-lg text-muted-foreground">{t.name}</span></h1>
          <div className="font-mono text-sm">{fmtUsd(t.mcap)} <span className={t.change >= 0 ? "text-success" : "text-destructive"}>{t.change >= 0 ? "+" : ""}{t.change}%</span> · {fmtNum(t.holders)} holders · Squad LVL {t.level}</div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Chart seed={t.ticker.length * 7 + t.level} />
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Minion Live Feed</h2>
            <Terminal tickers={[t.ticker]} title={`squad://${t.ticker.toLowerCase()}`} />
          </div>
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Fresh from Pixel's forge</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {memes.map((e, i) => (
                <div key={i} className="panel grid aspect-square place-items-center text-4xl">
                  <span>{t.emoji}{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <Swap ticker={t.ticker} />
          <div className="panel p-4">
            <div className="mb-2 flex justify-between text-sm"><span className="font-display font-bold">Bonding Curve</span><span className="font-mono text-primary">{t.curve}%</span></div>
            <CurveBar value={t.curve} />
            <p className="mt-2 text-xs text-muted-foreground">{t.curve >= 100 ? "Graduated to Raydium 🎓" : `${100 - t.curve}% to graduation`}</p>
          </div>
          <div className="panel p-4">
            <div className="mb-3 font-display font-bold">Squad Status</div>
            <div className="space-y-2">
              {MINIONS.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <span>{m.emoji}</span><span className="flex-1">{m.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{(t.level * 3 + i * 5) % 40 + 4} quests</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-4">
            <div className="mb-3 font-display font-bold">🔥 Burn Receipts</div>
            {[0.42, 0.31, 0.27].map((p, i) => (
              <div key={i} className="flex justify-between border-b py-2 font-mono text-xs last:border-0">
                <span>{fmtNum(Math.round(t.burned * p))} burned</span>
                <span className="text-muted-foreground">tx 4f{t.ticker.slice(0, 2).toLowerCase()}…{i}a9</span>
              </div>
            ))}
            <div className="mt-2 text-xs text-muted-foreground">Total burned: <span className="text-destructive">{fmtNum(t.burned)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
