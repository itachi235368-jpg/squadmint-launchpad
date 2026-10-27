import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TOKENS } from "@/lib/data";
import { TokenCard } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Quest Board — minions.quest" },
      { name: "description", content: "Browse every memecoin launched on minions.quest: trending, near graduation and fresh mints." },
      { property: "og:title", content: "Quest Board — minions.quest" },
      { property: "og:description", content: "Live directory of Solana memecoins and their AI squads." },
    ],
  }),
  component: Quests,
});

const FILTERS = ["Trending", "Near Graduation", "Fresh Mints"] as const;

function Quests() {
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
      <h1 className="font-display text-4xl font-bold">Live Quest Board</h1>
      <p className="mt-1 text-muted-foreground">Every token, its squad level and how close it is to graduating.</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)}
            className={cn("rounded-md border px-3 py-1.5 text-sm", f === x ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}>{x}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ticker…"
          className="ml-auto rounded-md border bg-input/40 px-3 py-1.5 font-mono text-sm outline-none focus:border-primary" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((t) => <TokenCard key={t.ticker} t={t} />)}
        {!list.length && <p className="text-muted-foreground">No quests match.</p>}
      </div>
    </div>
  );
}
