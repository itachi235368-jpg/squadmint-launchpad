import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { fmtMcap, fmtUsd, squadActive, type Token, type Minion } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";

export const pill = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition";
export const pillDark = cn(pill, "bg-primary text-primary-foreground hover:opacity-90");
export const pillLine = cn(pill, "border border-foreground/80 hover:bg-foreground hover:text-background");

export function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="border-b pb-8">
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{kicker}</div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
      {sub && <p className="mt-3 max-w-2xl text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function CurveBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", value > 80 ? "from-accent/60 to-accent" : "from-primary/50 to-primary")} style={{ width: `${value}%` }} />
    </div>
  );
}

export function SquadStatus({ t }: { t: Token }) {
  return squadActive(t) ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Active Raid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" /> Squad waiting for $10K</span>
  );
}

export function PairBadge({ pair }: { pair: string }) {
  return <span className="rounded-full border bg-card px-2 py-0.5 font-mono text-[10px] font-semibold shadow-sm">{pair}</span>;
}

export function TokenCard({ t }: { t: Token }) {
  return (
    <Link to="/token/$ticker" params={{ ticker: t.ticker }} className="card-premium lift group block rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-secondary text-xl ring-1 ring-border">
          {t.image ? <img src={t.image} alt="" className="h-full w-full object-cover" /> : (t.emoji || t.ticker.charAt(0))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-medium leading-tight">{t.name}</div>
          <div className="font-mono text-xs text-muted-foreground">${t.ticker} · {t.age}</div>
        </div>
        <PairBadge pair={t.pair} />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Market cap</div>
          <div className="font-mono text-xl font-semibold tracking-tight">{fmtMcap(t.mcap)}</div>
        </div>
        {t.mcap > 0 ? (
          <span className={cn("rounded-full px-2 py-0.5 font-mono text-xs font-semibold", t.change >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>{t.change >= 0 ? "▲" : "▼"} {Math.abs(t.change)}%</span>
        ) : (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent">NEW</span>
        )}
      </div>
      {t.mcap > 0 && (
        <div className="mt-3 flex gap-1.5 font-mono text-[10px]">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-muted-foreground">VOL <span className="text-foreground">{fmtUsd(t.mcap * 0.38)}</span></span>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-muted-foreground">LIQ <span className="text-foreground">{fmtUsd(t.mcap * 0.12)}</span></span>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-muted-foreground"><span>Bonding curve</span><span className="text-foreground">{t.curve}%</span></div>
      <div className="mt-1.5"><CurveBar value={t.curve} /></div>
      <div className="mt-4 border-t pt-3"><SquadStatus t={t} /></div>
    </Link>
  );
}


export function AgentCard({ m, index }: { m: Minion; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-premium lift flex flex-col rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-card text-2xl ring-1 ring-border">
          {AVATARS[m.id] ? <img src={AVATARS[m.id]} alt={m.name} loading="lazy" className="h-full w-full object-contain p-1" /> : m.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">AGENT {String(index + 1).padStart(2, "0")}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-success"><span className="h-1 w-1 animate-pulse rounded-full bg-success" />ONLINE</span>
          </div>
          <div className="font-display text-xl font-medium">{m.name}</div>
          <div className="text-xs text-muted-foreground">{m.role}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.abilities.map((a) => <span key={a} className="rounded-full border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium">{a}</span>)}
      </div>
      <button onClick={() => setOpen(!open)} className="mt-auto pt-4 text-left text-xs font-semibold underline-offset-4 hover:underline">
        {open ? "Hide action history" : "Action history →"}
      </button>
      {open && (
        <ol className="mt-3 animate-slidein space-y-2 border-t pt-3">
          {m.actions.map((a, i) => (
            <li key={a} className="flex items-center gap-2 font-mono text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /><span className="flex-1">{a}</span><span className="text-muted-foreground">{(i + 1) * 4}m ago</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
