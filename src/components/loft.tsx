import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import bob from "@/assets/agents/bob.png";
import kevin from "@/assets/agents/kevin.png";
import stuart from "@/assets/agents/stuart.png";
import otto from "@/assets/agents/otto.png";
import dave from "@/assets/agents/dave.png";
import { Button } from "@/components/ui/button";
import { MINIONS, TOKENS, fmtUsd, type Minion } from "@/lib/data";
import { pillDark, pillLine } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

type Station = {
  id: string; status: string; img: string; zone: string; tags: string[];
  x: number; y: number; w: number; bx: number; by: number; flip?: boolean;
  job: string; work: string[];
};

// x/y = feet anchor (% of scene), w = width %, bx/by = badge position %
export const STATIONS: Station[] = [
  { id: "bob", status: "MONITORING", img: bob, zone: "NARRATIVE & RESEARCH", tags: ["X trends", "Meme metas", "Keywords", "Sentiment"], x: 20, y: 92, w: 11, bx: 12, by: 67,
    job: "Scraping X trends and meme metas for viral angles and coin keywords",
    work: ["scrapes X narratives · 'frog season' +340%", "tracks competitor tickers · 3 losing volume", "detects sentiment surges · keyword spike: 'zeus'"] },
  { id: "kevin", status: "POSTING", img: kevin, zone: "X ACCOUNT & SOCIALS", tags: ["Official account", "Banners", "Launch thread", "Raids"], x: 49, y: 94, w: 10, bx: 41, by: 69,
    job: "Creating and configuring the coin's official X account with profile banners, raid tweets and automated post schedules",
    work: ["created @coin official account", "queued launch thread · 6 posts scheduled", "initiated viral raid · 8 trending posts"] },
  { id: "stuart", status: "READY", img: stuart, zone: "CURVE & DEX LIQUIDITY", tags: ["100% curve", "Graduation fees", "Raydium / Meteora", "LP burn"], x: 78, y: 92, w: 10, bx: 70, by: 67,
    job: "Tracking the curve towards 100%, paying graduation fees and seeding Raydium / Meteora liquidity",
    work: ["monitored curve to 100% · graduation sample", "triggered DEX graduation · fees paid", "deposited liquidity & burnt LP · Raydium / Meteora"] },
  { id: "otto", status: "BURNING", img: otto, zone: "BUYBACK & BURN", tags: ["Trading fees", "Market buybacks", "On-chain burns", "Tx proof"], x: 87, y: 45, w: 9, bx: 79, by: 24,
    job: "Collecting platform trading fees, executing market buybacks and recording on-chain burn proof",
    work: ["automated buyback executed · 0.8 SOL", "burned supply tokens", "updated live burn proof · tx hash recorded"] },
  { id: "dave", status: "STANDBY", img: dave, zone: "WEB & OPERATIONS HQ", tags: ["Live website", "Holder terminal", "DEX charts", "CDN assets"], x: 49, y: 46, w: 9, bx: 41, by: 25,
    job: "Building, hosting and deploying the coin's live website, holder terminal and operations portal",
    work: ["deployed live website", "connected live DEX chart · holder terminal online", "optimized CDN assets · load time 0.8s"] },
];

const byId = (id: string) => {
  const m = MINIONS.find((m) => m.id === id);
  if (!m) throw new Error(`Unknown minion station: ${id}`);
  return m;
};

function Spark({ seed, up }: { seed: number; up: boolean }) {
  const pts = Array.from({ length: 14 }, (_, i) => {
    const y = 10 - (Math.sin(i * 0.9 + seed) * 3 + (up ? i * 0.35 : -i * 0.25) + 3);
    return `${i * 4},${Math.max(1, Math.min(13, y))}`;
  }).join(" ");
  return <svg viewBox="0 0 52 14" className="h-3.5 w-12"><polyline points={pts} fill="none" strokeWidth="1.25" className={up ? "stroke-success" : "stroke-destructive"} /></svg>;
}

function LiveCoinsBoard({ className }: { className?: string }) {
  const top = [...TOKENS].sort((a, b) => b.mcap - a.mcap).slice(0, 4);
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick((t) => t + 1), 2500); return () => clearInterval(i); }, []);
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-primary-foreground/10 bg-primary font-mono text-primary-foreground shadow-[0_30px_60px_-30px_oklch(0_0_0/0.5)]", className)}>
      <div className="flex items-center justify-between border-b border-primary-foreground/10 px-3 py-2">
        <div className="text-[10px] font-semibold tracking-[0.2em]">LIVE COINS</div>
        <div className="flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[8px] text-success"><span className="h-1 w-1 animate-pulse rounded-full bg-success" />LIVE</div>
      </div>
      <div className="px-3 pt-1.5 text-[8px] tracking-widest opacity-40">TOP 4 · BY MARKET CAP</div>
      <div className="space-y-0.5 p-1.5">
        {!top.length && (
          <Link to="/launch" className="block rounded-lg px-1.5 py-3 text-center transition hover:bg-primary-foreground/5">
            <span className="block text-[10px] font-semibold">No coins yet</span>
            <span className="block text-[9px] opacity-50">Launch the first one →</span>
          </Link>
        )}
        {top.map((t, i) => {
          const ch = +(t.change + Math.sin(tick + i) * 1.5).toFixed(1);
          const up = ch >= 0;
          return (
            <Link key={t.ticker} to="/token/$ticker" params={{ ticker: t.ticker }} className="block rounded-lg px-1.5 py-1.5 transition hover:bg-primary-foreground/5">
              <div key={tick} className="flex items-center gap-2 rounded animate-flash">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-xs">{t.emoji}</span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[10px] font-semibold">${t.ticker}</span>
                  <span className="block text-[9px] opacity-50">{fmtUsd(t.mcap)}</span>
                </span>
                <span className="text-right leading-tight">
                  <Spark seed={i + tick * 0.3} up={up} />
                  <span className={cn("block text-[9px]", up ? "text-success" : "text-destructive")}>{up ? "▲" : "▼"} {Math.abs(ch)}%</span>
                </span>
              </div>
              <span className="mt-1 block h-[3px] overflow-hidden rounded-full bg-primary-foreground/10"><span className="block h-full rounded-full bg-gradient-to-r from-accent/60 to-accent" style={{ width: `${t.curve}%` }} /></span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Inspector({ s, onClose }: { s: Station; onClose: () => void }) {
  const m: Minion = byId(s.id);
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
          <ul className="space-y-2">{s.work.map((w) => <li key={w} className="rounded-xl border bg-card p-3 font-mono text-xs">{w}</li>)}</ul>
        </div>
      </aside>
    </div>
  );
}

function StatusTicker() {
  const items = ["AI SQUAD V2 ONLINE", "5 AUTONOMOUS MINIONS DEPLOYED", "SOLANA DEVNET / MAINNET READY", "MEMES EVERY 15 MIN", "BUYBACK & BURN ACTIVE", "SQUADS RAID AT $10K"];
  const row = items.map((t) => <span key={t} className="flex items-center gap-3 px-6"><span className="h-1 w-1 rounded-full bg-success" />{t}</span>);
  return (
    <div className="relative z-20 overflow-hidden border-b bg-primary py-2 font-mono text-[10px] tracking-[0.2em] text-primary-foreground/80">
      <div className="flex w-max animate-marquee">{row}{row}</div>
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

// Subtle themed backdrop (no photo): soft ivory gradient, faint dot grid, hairline floor planes.
function SceneBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(120% 90% at 82% 6%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 55%)," +
          "radial-gradient(90% 80% at 6% 96%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 60%)," +
          "linear-gradient(180deg, color-mix(in oklab, var(--secondary) 70%, var(--background)) 0%, var(--background) 60%)",
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(color-mix(in oklab, var(--primary) 14%, transparent) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
        opacity: 0.5,
        maskImage: "radial-gradient(130% 110% at 50% 45%, black 20%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(130% 110% at 50% 45%, black 20%, transparent 80%)",
      }} />
      <div className="absolute inset-x-0" style={{ top: "37%" }}>
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 16%, transparent) 18%, color-mix(in oklab, var(--primary) 16%, transparent) 82%, transparent)" }} />
        <div className="h-12" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--primary) 4%, transparent), transparent)" }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[14%]" style={{ background: "linear-gradient(180deg, transparent, color-mix(in oklab, var(--secondary) 80%, var(--background)))" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 12% 20%, color-mix(in oklab, var(--background) 92%, transparent) 0%, transparent 62%)" }} />
    </div>
  );
}

export function AgencyLoft() {

  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<Station | null>(null);
  return (
    <>
      <StatusTicker />
      {/* Desktop scene */}
      <section className="relative hidden min-h-[720px] w-full overflow-hidden lg:block" style={{ aspectRatio: "1920 / 1024" }}>
        <SceneBackdrop />

        <div className="absolute left-[3%] top-[6%] z-20 max-w-[38%]"><HeroCopy /></div>

        <LiveCoinsBoard className="absolute left-[62%] top-[7%] z-10 w-[14%] min-w-[150px]" />

        {STATIONS.map((s, i) => {
          const m = byId(s.id);
          const active = hover === s.id;
          return (
            <div key={s.id}>
              <div aria-hidden className="pointer-events-none absolute z-[3] rounded-[50%] border border-foreground/10 transition duration-300" style={{
                left: `${s.x}%`, top: `${s.y}%`, width: `${s.w * 1.35}%`, aspectRatio: "4 / 1",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(ellipse at 50% 35%, color-mix(in oklab, var(--card) 95%, transparent), color-mix(in oklab, var(--secondary) 80%, transparent) 70%)",
                boxShadow: active ? "0 0 0 1px color-mix(in oklab, var(--accent) 50%, transparent), 0 0 40px 6px color-mix(in oklab, var(--accent) 35%, transparent), 0 14px 24px -10px oklch(0 0 0 / .3)" : "inset 0 1px 0 var(--card), 0 14px 24px -12px oklch(0 0 0 / .25)",
              }} />
              <div aria-hidden className="pointer-events-none absolute z-[2] animate-ring rounded-[50%]" style={{
                left: `${s.x}%`, top: `${s.y + 0.6}%`, width: `${s.w * 1.7}%`, aspectRatio: "4 / 1", transform: "translate(-50%, -50%)",
                background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent) 28%, transparent), transparent 70%)",
              }} />
              <button

                onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onClick={() => setOpen(s)}
                className="absolute z-10 origin-bottom transition-transform duration-300"
                style={{ left: `${s.x}%`, top: `${s.y - (active ? 1.2 : 0.4)}%`, width: `${s.w}%`, transform: "translate(-50%, -100%)" }}
                aria-label={`Open ${m.name}`}>
                <img src={s.img} alt={m.name} className="w-full animate-floaty transition-[filter]"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2.6 + (i % 3) * 0.5}s`,
                    filter: active ? "drop-shadow(0 0 18px var(--accent)) drop-shadow(0 8px 12px rgb(0 0 0 / .35))" : "drop-shadow(0 8px 12px rgb(0 0 0 / .35))" }} />
                <span className={cn("absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] text-primary-foreground transition", active ? "opacity-100" : "opacity-0")}>
                  {m.name} · {m.role}
                </span>
              </button>
              <button onClick={() => setOpen(s)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
                className={cn("glass absolute z-[5] max-w-[16%] -translate-y-full rounded-xl px-3 py-2 text-left transition duration-300", active && "-translate-y-[calc(100%+4px)] border-accent/50 glow-accent")}
                style={{ left: `${s.bx}%`, top: `${s.by}%` }}>
               <div className="mb-1 flex items-center gap-1.5 font-mono text-[8px] font-semibold tracking-widest text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />{s.status}</div>
                <div className="font-display text-xs font-bold leading-snug">{s.zone}</div>
                <div className="mt-1 font-mono text-[8px] uppercase leading-snug text-muted-foreground">{s.tags.join(" • ")}</div>
              </button>
            </div>
          );
        })}
      </section>

      {/* Mobile stack */}
      <section className="space-y-6 px-4 py-8 lg:hidden">
        <div className="relative overflow-hidden rounded-3xl border bg-background px-5 py-8">
          <SceneBackdrop />
          <div className="relative z-10"><HeroCopy /></div>
        </div>
        <LiveCoinsBoard />

        <div className="grid gap-3 sm:grid-cols-2">
          {STATIONS.map((s) => {
            const m = byId(s.id);
            return (
              <Button variant="ghost" key={s.id} aria-label={`Open ${m.name}`} onClick={() => setOpen(s)} className="card-premium lift h-auto justify-start whitespace-normal gap-3 rounded-2xl p-3 text-left">
                <img src={s.img} alt={m.name} loading="lazy" className="h-16 w-16 shrink-0 animate-floaty object-contain" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />{s.status}</div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{s.zone}</div>
                  <div className="font-display text-lg font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </section>

      {open && <Inspector s={open} onClose={() => setOpen(null)} />}
    </>
  );
}
