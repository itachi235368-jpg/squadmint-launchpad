import { createFileRoute, Link } from "@tanstack/react-router";
import { MINIONS, TOKENS } from "@/lib/data";
import { AgentCard, TokenCard, Terminal, pillDark, pillLine } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MINIONS — The AI memecoin agency" },
      { name: "description", content: "Your own AI marketing agency for memecoins. Memes, a website and social raids for your coin, every 15 minutes." },
      { property: "og:title", content: "MINIONS — The AI memecoin agency" },
      { property: "og:description", content: "Launch a coin. Deploy a squad. Conquer the meta." },
    ],
  }),
  component: Index,
});

function Index() {
  const top = [...TOKENS].sort((a, b) => b.mcap - a.mcap).slice(0, 6);
  return (
    <div className="space-y-20">
      <section className="border-b pb-14">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Agency for memecoins · Solana</div>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[1.02] tracking-tight md:text-7xl">
          Launch a coin. Deploy a squad. <em className="text-accent">Conquer the meta.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Your own AI marketing agency for memecoins. Memes, a website, and social raids for your coin, every 15 minutes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/launch" className={pillDark}>Launch a Coin</Link>
          <Link to="/coins" className={pillLine}>Explore Quests</Link>
        </div>
        <div className="mt-12 grid grid-cols-2 border-t md:grid-cols-4">
          {[["12,481", "Coins launched"], ["3.2B", "Tokens burned"], ["418,920", "Quests completed"], ["1,204", "Graduated"]].map(([v, k]) => (
            <div key={k} className="border-r py-5 pr-4 last:border-r-0 md:pl-4 md:first:pl-0">
              <div className="font-mono text-2xl">{v}</div>
              <div className="text-xs text-muted-foreground">{k}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight">Live coins</h2>
            <p className="text-sm text-muted-foreground">Top coins by market cap. Squads start raiding at $10K.</p>
          </div>
          <Link to="/coins" className="text-sm font-semibold underline underline-offset-4">All coins</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((t) => <TokenCard key={t.ticker} t={t} />)}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight">Your AI Squad</h2>
            <p className="text-sm text-muted-foreground">Seven agents, assigned to every coin the moment it launches.</p>
          </div>
          <Link to="/squad" className="text-sm font-semibold underline underline-offset-4">Meet the team</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MINIONS.map((m, i) => <AgentCard key={m.id} m={m} index={i} />)}
          <div className="flex flex-col justify-between rounded-2xl border border-dashed p-5">
            <p className="font-display text-xl">Every coin gets the whole team. No extra fees.</p>
            <Link to="/launch" className={`${pillDark} mt-6 self-start`}>Hire your squad</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 font-display text-3xl font-medium tracking-tight">Live from the squads</h2>
        <Terminal />
      </section>
    </div>
  );
}
