import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fmtUsd, randomLog, squadActive, type Token, type Minion } from "@/lib/data";
import { cn } from "@/lib/utils";

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
      <div className={cn("h-full rounded-full", value > 80 ? "bg-accent" : "bg-primary")} style={{ width: `${value}%` }} />
    </div>
  );
}

export function SquadStatus({ t }: { t: Token }) {
  return squadActive(t) ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Active Raid
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">Squad waiting for $10K</span>
  );
}

export function PairBadge({ pair }: { pair: string }) {
  return <span className="rounded-full border px-2 py-0.5 font-mono text-[10px]">{pair}</span>;
}

export function TokenCard({ t }: { t: Token }) {
  return (
    <Link to="/token/$ticker" params={{ ticker: t.ticker }} className="group block rounded-2xl border bg-card p-5 transition hover:border-foreground/40">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full border bg-secondary text-xl">{t.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-medium">{t.name}</div>
          <div className="font-mono text-xs text-muted-foreground">${t.ticker} · {t.age}</div>
        </div>
        <PairBadge pair={t.pair} />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Market cap</div>
          <div className="font-mono text-lg">{fmtUsd(t.mcap)}</div>
        </div>
        <span className={cn("font-mono text-sm", t.change >= 0 ? "text-success" : "text-destructive")}>{t.change >= 0 ? "+" : ""}{t.change}%</span>
      </div>
      <div className="mt-3"><CurveBar value={t.curve} /></div>
      <div className="mt-3 flex items-center justify-between">
        <SquadStatus t={t} />
        <span className="font-mono text-[10px] text-muted-foreground">curve {t.curve}%</span>
      </div>
    </Link>
  );
}

export function Terminal({ tickers, title = "squad feed", rows = 10, only }: { tickers?: string[]; title?: string; rows?: number; only?: string }) {
  const [logs, setLogs] = useState<ReturnType<typeof randomLog>[]>([]);
  useEffect(() => {
    setLogs(Array.from({ length: 5 }, () => randomLog(tickers, only)));
    const i = setInterval(() => setLogs((l) => [randomLog(tickers), ...l].slice(0, rows)), 2000);
    return () => clearInterval(i);
  }, [tickers?.join(","), rows, only]);
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> {title}
      </div>
      <div className="h-72 space-y-2 overflow-hidden p-4 font-mono text-xs">
        {logs.map((l) => (
          <div key={l.id} className="animate-slidein">
            <span className="text-muted-foreground">{l.time}</span>{" "}
            <span className="font-semibold">{l.minion.emoji} {l.minion.name}</span>{" "}
            <span className="text-accent">${l.ticker}</span> <span className="text-muted-foreground">{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentCard({ m, index }: { m: Minion; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border bg-secondary text-2xl">{m.emoji}</div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-muted-foreground">AGENT {String(index + 1).padStart(2, "0")}</div>
          <div className="font-display text-xl font-medium">{m.name}</div>
          <div className="text-xs text-muted-foreground">{m.role} · {m.title}</div>
        </div>
      </div>
      <p className="mt-4 text-sm">{m.bio}</p>
      <button onClick={() => setOpen(!open)} className="mt-4 text-xs font-semibold underline underline-offset-4">
        {open ? "Hide live work" : "See live work →"}
      </button>
      {open && (
        <ul className="mt-3 animate-slidein space-y-1.5 border-t pt-3 font-mono text-xs text-muted-foreground">
          {m.actions.map((a) => <li key={a}>— {a}</li>)}
        </ul>
      )}
    </div>
  );
}
