import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MINIONS } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch a Token — minions.quest" },
      { name: "description", content: "Launch a Solana memecoin and deploy a squad of 7 AI minions to grow it." },
      { property: "og:title", content: "Launch a Token — minions.quest" },
      { property: "og:description", content: "Name it, upload a mascot, pick a style. The squad does the rest." },
    ],
  }),
  component: Launch,
});

const STYLES = ["Pixel Art", "Cartoon", "Anime", "3D Render", "Cyberpunk", "Doodle"];
const field = "w-full rounded-md border bg-input/40 px-3 py-2 outline-none focus:border-primary";

function Launch() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [style, setStyle] = useState(STYLES[0]);
  const [pair, setPair] = useState("SOL");
  const [slip, setSlip] = useState(1);
  const [dev, setDev] = useState(0.5);
  const [done, setDone] = useState(false);

  const pts = Array.from({ length: 41 }, (_, i) => { const x = i / 40; return [x * 300, 150 - Math.pow(x, 2) * 140]; });
  const devX = Math.min(dev / 10, 1);
  const devPct = (Math.pow(devX, 2) * 100).toFixed(1);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form className="panel space-y-5 p-6" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
        <h1 className="font-display text-3xl font-medium tracking-tight">Token Launch Portal</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Token name<input required className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Frog Zeus" /></label>
          <label className="space-y-1 text-sm">Ticker<input required maxLength={8} className={cn(field, "font-mono uppercase")} value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="FROGZ" /></label>
        </div>
        <label className="block space-y-1 text-sm">Mascot
          <div className="flex items-center gap-4 rounded-md border border-dashed p-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-md bg-secondary text-2xl">
              {img ? <img src={img} alt="Mascot preview" className="h-full w-full object-cover" /> : "🖼️"}
            </div>
            <input type="file" accept="image/*" className="text-xs" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImg(URL.createObjectURL(f)); }} />
          </div>
        </label>
        <div className="space-y-2 text-sm">Art style
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map((s) => (
              <button type="button" key={s} onClick={() => setStyle(s)} className={cn("rounded-md border px-2 py-2 text-xs", style === s && "border-accent text-accent glow-accent")}>{s}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-sm">Pair
            <div className="flex gap-2">{["SOL", "USDC"].map((p) => (
              <button type="button" key={p} onClick={() => setPair(p)} className={cn("flex-1 rounded-md border py-2 font-mono", pair === p && "border-primary text-primary")}>{p}</button>
            ))}</div>
          </div>
          <label className="space-y-2 text-sm">Slippage: <span className="font-mono text-primary">{slip}%</span>
            <input type="range" min={0.5} max={10} step={0.5} value={slip} onChange={(e) => setSlip(+e.target.value)} className="w-full accent-primary" />
          </label>
        </div>
        <label className="block space-y-2 text-sm">Optional dev buy: <span className="font-mono text-primary">{dev} {pair}</span>
          <input type="range" min={0} max={10} step={0.1} value={dev} onChange={(e) => setDev(+e.target.value)} className="w-full accent-primary" />
        </label>
        <button className="w-full rounded-md bg-primary py-3 font-bold text-primary-foreground glow">Launch & Summon Squad</button>
        {done && (
          <div className="animate-slidein rounded-md border border-success p-4 font-mono text-sm text-success">
            ✓ Demo launch queued for ${ticker || "TICKER"}. Squad assembling: {MINIONS.map((m) => m.emoji).join(" ")}
          </div>
        )}
      </form>

      <aside className="space-y-4">
        <div className="panel p-5">
          <div className="mb-2 font-display font-bold">Bonding Curve Preview</div>
          <svg viewBox="0 0 300 160" className="w-full">
            <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2} />
            <circle cx={devX * 300} cy={150 - devX * devX * 140} r={5} fill="var(--accent)" />
          </svg>
          <div className="mt-2 font-mono text-xs text-muted-foreground">Dev buy moves curve to <span className="text-accent">{devPct}%</span> · graduates at 100%</div>
        </div>
        <div className="panel p-5">
          <div className="mb-3 font-display font-bold">Preview</div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-md bg-secondary">{img ? <img src={img} alt="" className="h-full w-full object-cover" /> : "🐸"}</div>
            <div><div className="font-display font-bold">${ticker || "TICKER"}</div><div className="text-xs text-muted-foreground">{name || "Token name"} · {style} · {pair}</div></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
