import { createFileRoute } from "@tanstack/react-router";
import { MINIONS } from "@/lib/data";
import { AgentCard, PageHead, Terminal } from "@/components/ui-bits";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "The Squad — MINIONS" },
      { name: "description", content: "Meet the 7 AI agents that work every coin: Atlas, Cipher, Pixel, Nova, Echo, Forge and Blitz." },
      { property: "og:title", content: "The Squad — MINIONS" },
      { property: "og:description", content: "Seven AI agents, one memecoin agency." },
    ],
  }),
  component: Squad,
});

function Squad() {
  return (
    <div className="space-y-10">
      <PageHead kicker="Teams" title="Your AI Squad" sub="Seven specialists assigned to every coin. Open any agent to see their live work." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MINIONS.map((m, i) => <AgentCard key={m.id} m={m} index={i} />)}
      </div>
      <Terminal title="mission log · all squads" rows={12} />
    </div>
  );
}
