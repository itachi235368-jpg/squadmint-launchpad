import { createFileRoute, Link } from "@tanstack/react-router";
import { MINIONS, TOKENS } from "@/lib/data";
import { AgentCard, TokenCard, pillDark } from "@/components/ui-bits";
import { AgencyLoft } from "@/components/loft";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "MINIONS — The AI memecoin agency" },
      { name: "description", content: "Your own AI marketing agency for memecoins. Memes, a website and X posts for your coin, every 15 minutes." },
      { property: "og:title", content: "MINIONS — The AI memecoin agency" },
      { property: "og:description", content: "Launch a coin. Deploy a squad. Conquer the meta." },
    ],
  }),
  component: Index,
});

function Index() {
  const top = [...TOKENS].sort((a, b) => b.mcap - a.mcap).slice(0, 6);
  return (
    <div>
      <AgencyLoft />
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 md:px-8">
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight">Live coins</h2>
            <p className="text-sm text-muted-foreground">Top coins by market cap. Squads start raiding at $10K.</p>
          </div>
          <Link to="/coins" className="text-sm font-semibold underline underline-offset-4">All coins</Link>
        </div>
        {top.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((t) => <TokenCard key={t.ticker} t={t} />)}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed p-8">
            <p className="font-display text-xl">No coins yet. Be the first to launch one and hire the squad.</p>
            <Link to="/launch" className={pillDark}>Launch a Coin</Link>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <h2 className="font-display text-3xl font-medium tracking-tight">How the squad works</h2>
          <p className="text-sm text-muted-foreground">Each minion steps in at the right moment in your coin's life.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MINIONS.map((m, i) => (
            <li key={m.id} className="card-premium rounded-2xl p-5">
              <div className="font-mono text-[10px] tracking-widest text-accent">STEP {String(i + 1).padStart(2, "0")}</div>
              <div className="mt-1 font-display text-xl font-medium">{m.name}</div>
              <p className="mt-2 text-sm text-muted-foreground">{m.trigger}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight">Your AI Squad</h2>
            <p className="text-sm text-muted-foreground">Five minions, assigned to every coin the moment it launches.</p>
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
      </div>
    </div>
  );
}
