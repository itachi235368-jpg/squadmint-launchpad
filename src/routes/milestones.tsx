import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ui-bits";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: "Milestones — MINIONS" },
      { name: "description", content: "What each coin's squad unlocks as market cap grows." },
      { property: "og:title", content: "Milestones — MINIONS" },
      { property: "og:description", content: "Squad unlocks by market cap." },
    ],
  }),
  component: Milestones,
});

const STEPS = [
  ["$10K", "Squad activates", "Atlas sets the plan. Memes, posts and raids start every 15 minutes."],
  ["$25K", "Website goes live", "Forge ships the coin's site and live terminal."],
  ["$50K", "Lore & sticker packs", "Nova writes the lore, Pixel releases sticker packs."],
  ["$69K", "Graduation", "Bonding curve completes and liquidity migrates."],
  ["$100K", "Listings push", "Blitz applies to trackers and listing sites."],
  ["$250K", "Burn rituals", "Weekly buyback & burn from collected fees."],
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
