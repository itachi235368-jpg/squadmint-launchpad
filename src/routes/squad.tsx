import { createFileRoute } from "@tanstack/react-router";
import { MINIONS } from "@/lib/data";
import { AgentCard, PageHead, Terminal } from "@/components/ui-bits";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "The Squad — MINIONS" },
      { name: "description", content: "Meet the 5 AI minions that work every coin: Bob, Kevin, Stuart, Otto and Dave." },
      { property: "og:title", content: "The Squad — MINIONS" },
      { property: "og:description", content: "Five AI minions, one memecoin agency." },
    ],
  }),
  component: Squad,
});

function Squad() {
  return (
    <div className="space-y-10">
      <PageHead kicker="Teams" title="Your AI Squad" sub="Five specialists assigned to every coin. Open any agent to see their live work." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MINIONS.map((m, i) => <AgentCard key={m.id} m={m} index={i} />)}
      </div>
      <Terminal title="mission log · all squads" rows={12} />
    </div>
  );
}
