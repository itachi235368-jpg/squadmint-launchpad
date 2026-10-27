import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fmtUsd, randomLog, type Token, type Minion } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CurveBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", value > 80 ? "bg-gold" : "bg-primary")} style={{ width: `${value}%` }} />
    </div>
  );
}

export function TokenCard({ t }: { t: Token }) {
  return (
    <Link to="/token/$ticker" params={{ ticker: t.ticker }} className="panel block p-4 transition hover:-translate-y-1 hover:glow">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-md bg-secondary text-2xl">{t.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold">${t.ticker}</div>
          <div className="truncate text-xs text-muted-foreground">{t.name} · {t.age}</div>
        </div>
        <span className="rounded border border-gold/50 px-1.5 py-0.5 font-mono text-[10px] text-gold">LVL {t.level}</span>
      </div>
      <div className="mt-4 flex items-end justify-between font-mono text-sm">
        <span>{fmtUsd(t.mcap)}</span>
        <span className={t.change >= 0 ? "text-success" : "text-destructive"}>{t.change >= 0 ? "+" : ""}{t.change}%</span>
      </div>
      <div className="mt-2"><CurveBar value={t.curve} /></div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>bonding curve</span><span>{t.curve}%</span>
      </div>
    </Link>
  );
}

export function Terminal({ tickers, title = "minion://live-ops", rows = 10 }: { tickers?: string[]; title?: string; rows?: number }) {
  const [logs, setLogs] = useState<ReturnType<typeof randomLog>[]>([]);
  useEffect(() => {
    setLogs(Array.from({ length: 5 }, () => randomLog(tickers)));
    const i = setInterval(() => setLogs((l) => [randomLog(tickers), ...l].slice(0, rows)), 1800);
    return () => clearInterval(i);
  }, [tickers?.join(","), rows]);
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-2 font-mono text-xs text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> {title}
      </div>
      <div className="h-80 space-y-1.5 overflow-hidden p-4 font-mono text-xs">
        {logs.map((l) => (
          <div key={l.id} className="animate-slidein">
            <span className="text-muted-foreground">[{l.time}]</span>{" "}
            <span className={l.minion.color}>{l.minion.emoji} {l.minion.name}</span>{" "}
            <span className="text-accent">${l.ticker}</span> <span>{l.text}</span>
          </div>
        ))}
        <span className="animate-blink text-primary">█</span>
      </div>
    </div>
  );
}

export function MinionBadge({ m, active, onClick }: { m: Minion; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("panel flex flex-col items-center gap-1 p-3 text-center transition hover:glow", active && "border-primary glow")}>
      <span className="animate-floaty text-3xl">{m.emoji}</span>
      <span className="font-display text-sm font-bold">{m.name}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.role}</span>
    </button>
  );
}
