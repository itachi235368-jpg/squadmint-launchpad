import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ui-bits";

export const Route = createFileRoute("/flywheel")({
  head: () => ({
    meta: [
      { title: "Flywheel — MINIONS" },
      { name: "description", content: "How trading fees fund the AI squad and buyback-and-burn." },
      { property: "og:title", content: "Flywheel — MINIONS" },
      { property: "og:description", content: "Fees → squad work → attention → volume → burns." },
    ],
  }),
  component: Flywheel,
});

const LOOP = [
  ["Trading fees", "Every trade on a coin pays a small fee."],
  ["Squad work", "Fees fund memes, posts, raids and the site."],
  ["Attention", "More content brings more eyes and holders."],
  ["Volume", "New holders trade, generating more fees."],
  ["Buyback & burn", "Blitz burns supply from the treasury share."],
];

function Flywheel() {
  return (
    <div>
      <PageHead kicker="Flywheel" title="Fees that feed the squad" sub="A simple loop that keeps your coin's agency running." />
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {LOOP.map(([t, d], i) => (
          <div key={t} className="rounded-2xl border bg-card p-5">
            <div className="font-mono text-xs text-muted-foreground">0{i + 1} →</div>
            <div className="mt-2 font-display text-xl font-medium">{t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
