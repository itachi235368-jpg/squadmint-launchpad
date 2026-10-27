import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MINIONS, TOKENS } from "@/lib/data";
import { MinionBadge, Terminal, TokenCard } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "minions.quest — Command Deck" },
      { name: "description", content: "AI memecoin launchpad on Solana: every coin gets a squad of 7 autonomous AI minions." },
      { property: "og:title", content: "minions.quest — Command Deck" },
      { property: "og:description", content: "Launch a memecoin. Get 7 AI minions that market it for you." },
    ],
  }),
  component: Index,
});

function Index() {
  const [sel, setSel] = useState(0);
  const m = MINIONS[sel]!;
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <span className="rounded-full border border-primary/40 px-3 py-1 font-mono text-xs text-primary">● 7 agents online · Solana mainnet</span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">
            Launch a coin.<br /><span className="text-gradient">Summon a squad.</span>
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Every memecoin on minions.quest gets 7 autonomous AI minions that scout trends, forge memes, write lore, lead raids, build the site and burn supply — around the clock.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/launch" className="rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground glow">Launch a Token</Link>
            <Link to="/quests" className="rounded-md border px-5 py-3 font-bold hover:border-accent">Browse Quests</Link>
          </div>
        </div>
        <Terminal />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["Coins Launched", "12,481"], ["Tokens Burned", "3.2B"], ["Quests Completed", "418,920"], ["Graduated", "1,204"]].map(([k, v]) => (
          <div key={k} className="panel p-5">
            <div className="font-mono text-2xl font-bold text-primary">{v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Featured Tokens</h2>
          <Link to="/quests" className="text-sm text-primary">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOKENS.slice(0, 4).map((t) => <TokenCard key={t.ticker} t={t} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Meet the Squad</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {MINIONS.map((x, i) => <MinionBadge key={x.id} m={x} active={i === sel} onClick={() => setSel(i)} />)}
        </div>
        <div key={m.id} className="panel mt-4 animate-slidein p-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{m.emoji}</span>
            <div>
              <div className="font-display text-2xl font-bold">{m.name} <span className={`text-base ${m.color}`}>· {m.role}</span></div>
              <div className="text-sm text-muted-foreground">{m.title}</div>
            </div>
          </div>
          <p className="mt-4">{m.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {m.abilities.map((a) => <span key={a} className="rounded border px-2 py-1 font-mono text-xs">{a}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}
