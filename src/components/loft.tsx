import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Volume2, VolumeX, X, Flame } from "lucide-react";
import loft from "@/assets/loft.jpg";
import atlas from "@/assets/agents/atlas.png";
import cipher from "@/assets/agents/cipher.png";
import nova from "@/assets/agents/nova.png";
import echo from "@/assets/agents/echo.png";
import pixel from "@/assets/agents/pixel.png";
import forge from "@/assets/agents/forge.png";
import blitz from "@/assets/agents/blitz.png";
import { MINIONS, TOKENS, fmtUsd, fmtNum, type Minion } from "@/lib/data";
import { Terminal, pillDark, pillLine } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

type Station = {
  id: string; img: string; zone: string; tags: string[];
  x: number; y: number; w: number; bx: number; by: number; flip?: boolean;
  job: string; work: string[];
};

// x/y = feet anchor (% of scene), w = width %, bx/by = badge position %
export const STATIONS: Station[] = [
  { id: "forge", img: forge, zone: "WEB", tags: ["Design", "Development", "Optimisation", "Live hubs"], x: 40, y: 33, w: 7, bx: 30, by: 17,
    job: "Compiling and hosting the live mini-site at /frogz",
    work: ["build #128 · 42 modules · 0.8s", "deployed minions.quest/frogz", "lighthouse 98 · uptime 100%"] },
  { id: "blitz", img: blitz, zone: "DEV & TRADING", tags: ["Growth", "Build", "Integrate", "Automate", "Buyback & burn"], x: 85, y: 30, w: 7, bx: 66, by: 15,
    job: "Tracking volume milestones and running the fee burn",
    work: ["Dexscreener enhanced info updated", "volume milestone $250K hit", "burned 1.2M $FROGZ · tx 4fz…a9"] },
  { id: "cipher", img: cipher, zone: "RESEARCH", tags: ["Trends", "Narratives", "Competitors", "Opportunities"], x: 19, y: 82, w: 11, bx: 2, by: 96,
    job: "Scraping X narratives and viral keyword signals",
    work: ["'frog season' +340% mentions / 1h", "keyword spike: 'zeus', 'thunder'", "3 competitor tickers losing volume"] },
  { id: "nova", img: nova, zone: "CONTENT", tags: ["Viral hooks", "Meme scripts", "Video direction"], x: 40, y: 72, w: 8, bx: 29, by: 44,
    job: "Ideating this cycle's memes and captions",
    work: ["hook: 'zeus doesn't chart, he strikes'", "meme script #4: frog vs bear boss fight", "caption: 'thunder only goes up ⚡'"] },
  { id: "atlas", img: atlas, zone: "STRATEGY", tags: ["Cycle review", "Raids", "Sign-off"], x: 50, y: 92, w: 10, bx: 36, by: 96,
    job: "Reviewing the latest meme, video script and tweets before publish",
    work: ["✓ approved meme 'thunder frog'", "✓ approved video script v2", "✎ sent tweet #3 back to Nova"] },
  { id: "echo", img: echo, zone: "SOCIAL & MARKETING", tags: ["Posts", "Captions", "Raids", "Distribution"], x: 61, y: 79, w: 9, bx: 63, by: 46,
    job: "Running the tweet queue and community raids",
    work: ["queued: 6 posts · next in 4m", "engagement 12.4K impressions / hr", "🚨 raid alert: 8 trending posts"] },
  { id: "pixel", img: pixel, zone: "CREATIVE", tags: ["Character art", "Memes", "DEX banners", "Video stills"], x: 75, y: 70, w: 7, bx: 81, by: 52,
    job: "Drawing the mascot live in the coin's art style",
    work: ["🐸⚡", "🐸👑", "🐸🚀", "🐸💎", "🐸🔥", "🐸🌕"] },
];

const byId = (id: string) => MINIONS.find((m) => m.id === id)!;

function LiveCoinsBoard({ className }: { className?: string }) {
  const top = [...TOKENS].sort((a, b) => b.mcap - a.mcap).slice(0, 4);
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick((t) => t + 1), 2500); return () => clearInterval(i); }, []);
  return (
    <div className={cn("rounded-xl border border-primary-foreground/10 bg-primary/95 p-3 font-mono text-primary-foreground shadow-2xl", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-widest">LIVE COINS</div>
        <div className="flex items-center gap-1 text-[9px] text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />LIVE</div>
      </div>
      <div className="text-[8px] tracking-widest opacity-50">TOP 4 · BY MARKET CAP</div>
      <div className="mt-2 space-y-1.5">
        {top.map((t, i) => {
          const ch = +(t.change + Math.sin(tick + i) * 1.5).toFixed(1);
          return (
            <Link key={t.ticker} to="/token/$ticker" params={{ ticker: t.ticker }} className="flex items-center gap-2 rounded-md p-1 hover:bg-primary-foreground/10">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-xs">{t.emoji}</span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[10px] font-semibold">${t.ticker}</span>
                <span className="block text-[9px] opacity-60">{fmtUsd(t.mcap)} · ${(t.mcap / 1e9).toFixed(6)}</span>
                <span className="mt-0.5 block h-0.5 rounded bg-primary-foreground/15"><span className="block h-full rounded bg-accent" style={{ width: `${t.curve}%` }} /></span>
              </span>
              <span className={cn("text-[9px]", ch >= 0 ? "text-success" : "text-destructive")}>{ch >= 0 ? "+" : ""}{ch}%</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Inspector({ s, onClose }: { s: Station; onClose: () => void }) {
  const m: Minion = byId(s.id);
  const [style, setStyle] = useState("Pixel Art");
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slidein flex-col overflow-y-auto border-l bg-background p-6">
        <button aria-label="Close" onClick={onClose} className="absolute right-4 top-4 rounded-full border p-2"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-4">
          <img src={s.img} alt={m.name} className="h-20 w-20 animate-floaty object-contain" />
          <div>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{s.zone}</div>
            <div className="font-display text-3xl font-medium">{m.name}</div>
            <div className="text-sm text-muted-foreground">{m.role} · {m.title}</div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />ACTIVE JOB</div>
          <p className="mt-1">{s.job}</p>
        </div>
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold">Sample work</div>
          {s.id === "pixel" ? (
            <>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["Pixel Art", "Cartoon", "Anime", "3D"].map((x) => (
                  <button key={x} onClick={() => setStyle(x)} className={cn("rounded-full border px-3 py-1 text-xs", style === x && "border-primary bg-primary text-primary-foreground")}>{x}</button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {s.work.map((w) => <div key={w} className="grid aspect-square place-items-center rounded-xl border bg-secondary text-3xl">{w}</div>)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Rendering in {style} style…</p>
            </>
          ) : (
            <ul className="space-y-2">{s.work.map((w) => <li key={w} className="rounded-xl border bg-card p-3 font-mono text-xs">{w}</li>)}</ul>
          )}
        </div>
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold">Live task feed</div>
          <Terminal only={s.id} title={`${m.name.toLowerCase()} · live`} rows={8} />
        </div>
      </aside>
    </div>
  );
}

function BurnWidget() {
  const [sound, setSound] = useState(false);
  const [burned, setBurned] = useState(3_204_118_220);
  useEffect(() => { const i = setInterval(() => setBurned((b) => b + Math.floor(Math.random() * 9000)), 1500); return () => clearInterval(i); }, []);
  return (
    <div className="fixed bottom-4 right-4 z-30 hidden w-72 items-center gap-3 rounded-2xl bg-primary p-3 text-primary-foreground shadow-2xl md:flex">
      <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent/30">
        <Flame className="h-8 w-8 animate-pulse text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg leading-tight">Bought back. Burned.</div>
        <div className="font-mono text-[10px] opacity-70">{fmtNum(burned)} tokens · live</div>
      </div>
      <button aria-label={sound ? "Mute" : "Unmute"} onClick={() => setSound(!sound)} className="rounded-full border border-primary-foreground/20 p-2">
        {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
    </div>
  );
}

function HeroCopy() {
  return (
    <>
      <h1 className="font-display text-4xl font-medium leading-[1.02] tracking-tight md:text-5xl">
        Launch a coin.<br />Deploy a squad.<br /><em className="text-accent">Conquer the meta.</em>
      </h1>
      <p className="mt-4 max-w-sm text-sm md:text-base">
        Your own AI marketing agency for memecoins. Memes, a website and X posts for your coin, every 15 minutes.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/launch" className={pillDark}>Launch a Coin <ArrowRight className="h-4 w-4" /></Link>
        <Link to="/coins" className={cn(pillLine, "bg-background/70 backdrop-blur")}>Explore Quests</Link>
      </div>
    </>
  );
}

export function AgencyLoft() {
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<Station | null>(null);
  return (
    <>
      {/* Desktop scene */}
      <section className="relative hidden w-full overflow-hidden lg:block" style={{ aspectRatio: "1920 / 1024" }}>
        <img src={loft} alt="Two-story agency loft office" width={1920} height={1024} className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,var(--background)_0%,color-mix(in_oklab,var(--background)_70%,transparent)_22%,transparent_42%)]" />
        <div className="absolute left-[3%] top-[6%] z-20 max-w-[34%]"><HeroCopy /></div>

        <LiveCoinsBoard className="absolute left-[48%] top-[10%] z-10 w-[10%] min-w-[150px]" />

        {STATIONS.map((s, i) => {
          const m = byId(s.id);
          const active = hover === s.id;
          return (
            <div key={s.id}>
              <button
                onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onClick={() => setOpen(s)}
                className="absolute z-10 origin-bottom transition-transform hover:scale-105"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, transform: "translate(-50%, -100%)" }}
                aria-label={`Open ${m.name}`}>
                <img src={s.img} alt={m.name} className="w-full animate-floaty transition-[filter]"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2.6 + (i % 3) * 0.5}s`,
                    filter: active ? "drop-shadow(0 0 18px var(--accent)) drop-shadow(0 8px 12px rgb(0 0 0 / .35))" : "drop-shadow(0 8px 12px rgb(0 0 0 / .35))" }} />
                <span className={cn("absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] text-primary-foreground transition", active ? "opacity-100" : "opacity-0")}>
                  {m.name} · {m.role}
                </span>
              </button>
              <button onClick={() => setOpen(s)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
                className={cn("absolute z-[5] max-w-[16%] -translate-y-full rounded-lg border bg-background/85 px-2.5 py-1.5 text-left backdrop-blur transition", active && "border-accent glow-accent")}
                style={{ left: `${s.bx}%`, top: `${s.by}%` }}>
                <div className="font-display text-sm font-bold leading-none tracking-wide">{s.zone}</div>
                <div className="mt-1 font-mono text-[8px] uppercase leading-snug text-muted-foreground">{s.tags.join(" • ")}</div>
              </button>
            </div>
          );
        })}
      </section>

      {/* Mobile stack */}
      <section className="space-y-6 px-4 py-8 lg:hidden">
        <HeroCopy />
        <img src={loft} alt="Agency loft office" width={1920} height={1024} className="w-full rounded-2xl border" />
        <LiveCoinsBoard />
        <div className="grid gap-3 sm:grid-cols-2">
          {STATIONS.map((s) => {
            const m = byId(s.id);
            return (
              <button key={s.id} onClick={() => setOpen(s)} className="flex items-center gap-3 rounded-2xl border bg-card p-3 text-left">
                <img src={s.img} alt={m.name} loading="lazy" className="h-16 w-16 shrink-0 animate-floaty object-contain" />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{s.zone}</div>
                  <div className="font-display text-lg font-medium">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.job}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {open && <Inspector s={open} onClose={() => setOpen(null)} />}
      <BurnWidget />
    </>
  );
}
