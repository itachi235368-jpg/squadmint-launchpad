import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TOKENS, fmtUsd } from "@/lib/data";
import { CurveBar, PageHead, PairBadge, SquadStatus } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coins")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Coins — MINIONS" },
      { name: "description", content: "Directory of every coin launched on MINIONS with market caps, bonding curves and squad status." },
      { property: "og:title", content: "Coins — MINIONS" },
      { property: "og:description", content: "All coins and their AI squads." },
    ],
  }),
  component: Coins,
});

const FILTERS = ["Trending", "Near Graduation", "Fresh Mints"] as const;

function Coins() {
  const [f, setF] = useState<(typeof FILTERS)[number]>("Trending");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    let l = TOKENS.filter((t) => (t.name + t.ticker).toLowerCase().includes(q.toLowerCase()));
    if (f === "Trending") l = [...l].sort((a, b) => b.change - a.change);
    if (f === "Near Graduation") l = l.filter((t) => t.curve >= 60).sort((a, b) => b.curve - a.curve);
    if (f === "Fresh Mints") l = l.filter((t) => t.age.endsWith("m") || t.age === "1h");
    return l;
  }, [f, q]);
  return (
    <div>
      <PageHead kicker="Quests" title="All coins" sub="Every coin, its market cap, bonding curve and what its squad is doing." />
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)}
            className={cn("rounded-full border px-4 py-1.5 text-sm", f === x ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/50")}>{x}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coins"
          className="ml-auto rounded-full border bg-card px-4 py-1.5 text-sm outline-none focus:border-foreground/50" />
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4 font-medium">Coin</th><th className="font-medium">Pair</th><th className="font-medium">Market cap</th><th className="font-medium">24h</th><th className="w-40 font-medium">Bonding curve</th><th className="p-4 font-medium">Squad</th></tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.ticker} className="border-b last:border-0 hover:bg-secondary/60">
                <td className="p-4">
                  <Link to="/token/$ticker" params={{ ticker: t.ticker }} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full border bg-secondary">{t.emoji}</span>
                    <span><span className="block font-semibold">{t.name}</span><span className="font-mono text-xs text-muted-foreground">${t.ticker}</span></span>
                  </Link>
                </td>
                <td><PairBadge pair={t.pair} /></td>
                <td className="font-mono">{fmtUsd(t.mcap)}</td>
                <td className={cn("font-mono", t.change >= 0 ? "text-success" : "text-destructive")}>{t.change >= 0 ? "+" : ""}{t.change}%</td>
                <td><CurveBar value={t.curve} /><span className="font-mono text-[10px] text-muted-foreground">{t.curve}%</span></td>
                <td className="p-4"><SquadStatus t={t} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && (
          <div className="flex flex-col items-start gap-3 p-8">
            <p className="text-muted-foreground">{TOKENS.length ? "No coins match." : "No coins launched yet."}</p>
            {!TOKENS.length && <Link to="/launch" className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">Launch the first coin</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
