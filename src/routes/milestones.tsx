import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ui-bits";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Milestones — MINIONS" },
      { name: "description", content: "What each coin's squad unlocks as market cap grows." },
      { property: "og:title", content: "Milestones — MINIONS" },
      { property: "og:description", content: "Squad unlocks by market cap." },
    ],
  }),
  component: Milestones,
});

const STEPS = [
  ["$10K", "Squad activates", "Bob scouts narratives and Kevin deploys X posts and raids every 15 minutes."],
  ["$25K", "Website goes live", "Dave ships the coin's site and live terminal."],
  ["$50K", "Narrative & social momentum", "Bob detects viral angles and sentiment surges; Kevin queues launch threads and raids."],
  ["$69K", "Graduation", "Stuart tracks the curve to 100%, pays for DEX Screener and seeds Raydium / Meteora liquidity."],
  ["$100K", "Live operations", "Dave connects the live DEX chart and optimizes CDN assets."],
  ["$250K", "Burn rituals", "Otto executes buybacks and on-chain burns from collected fees with verifiable tx hashes."],
];

function Milestones() {
  return (
    <div>
      <PageHead kicker="Milestones" title="What your squad unlocks" sub="The bigger the coin, the more the team does. Illustrative thresholds." />
      <ol className="mt-4">
        {STEPS.map(([mc, t, d], i) => (
          <li key={mc} className="grid grid-cols-[80px_1fr] gap-6 border-b py-6 md:grid-cols-[140px_1fr]">
            <div className="font-mono text-xl">{mc}</div>
            <div><div className="font-mono text-[10px] text-muted-foreground">0{i + 1}</div><div className="font-display text-2xl font-medium">{t}</div><p className="text-muted-foreground">{d}</p></div>
          </li>
        ))}
      </ol>
    </div>
  );
}
