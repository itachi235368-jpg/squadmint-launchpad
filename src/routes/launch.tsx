import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MINIONS, isTickerTaken } from "@/lib/data";
import { PageHead, pillDark } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch a coin — MINIONS" },
      { name: "description", content: "Launch a Solana memecoin and hire a squad of 7 AI agents to market it." },
      { property: "og:title", content: "Launch a coin — MINIONS" },
      { property: "og:description", content: "Name it, pick a style, deploy a squad." },
    ],
  }),
  component: Launch,
});

const STYLES = ["Pixel Art", "Cartoon", "Anime", "3D Render", "Editorial", "Doodle"];
const PAIRS = ["SOL", "USDC", "USD1"];
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
  const [done, setDone] = useState(false);
  const taken = ticker.length > 0 && isTickerTaken(ticker);

  const pts = Array.from({ length: 41 }, (_, i) => { const x = i / 40; return `${x * 300},${150 - x * x * 140}`; }).join(" ");
  const devX = Math.min(dev / 10, 1);

  return (
    <div>
      <PageHead kicker="Launch" title="Launch a coin" sub="Four steps. Your squad of 7 agents starts working the moment it's live." />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={(e) => { e.preventDefault(); if (!taken) setDone(true); }}>
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
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImg(URL.createObjectURL(f)); }} />
            </label>
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
            <p className="mt-2 text-xs text-muted-foreground">Pixel will make every meme and banner in this style.</p>
          </Step>
          <Step n={4} title="Dev buy">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Optional</span><span className="font-mono">{dev} {pair}</span></div>
            <input type="range" min={0} max={10} step={0.1} value={dev} onChange={(e) => setDev(+e.target.value)} className="mt-2 w-full accent-[var(--primary)]" />
            <svg viewBox="0 0 300 160" className="mt-4 w-full rounded-xl border bg-card p-2">
              <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth={1.5} />
              <circle cx={devX * 300} cy={150 - devX * devX * 140} r={5} fill="var(--accent)" />
            </svg>
            <p className="mt-2 font-mono text-xs text-muted-foreground">Dev buy moves the curve to {(devX * devX * 100).toFixed(1)}% · graduates at 100%</p>
          </Step>
          <div className="pt-8">
            <button disabled={taken} className={cn(pillDark, "w-full py-3.5 disabled:opacity-40")}>Launch coin & deploy squad</button>
            {done && (
              <p className="mt-4 animate-slidein rounded-xl border border-success p-4 text-sm text-success">
                Demo launch queued for ${ticker}. Squad assembling: {MINIONS.map((m) => m.name).join(", ")}.
              </p>
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
            <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">Style: {style}<br />Squad: 7 agents · starts raiding at $10K</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
