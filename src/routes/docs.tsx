import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ui-bits";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — MINIONS" },
      { name: "description", content: "How MINIONS works: launching, squads, bonding curves, fees and risks." },
      { property: "og:title", content: "Docs — MINIONS" },
      { property: "og:description", content: "Everything about launching with an AI squad." },
    ],
  }),
  component: Docs,
});

const QA = [
  ["What is MINIONS?", "An AI memecoin agency on Solana. Every coin launched gets a squad of 7 AI agents that market it."],
  ["How do I launch?", "Go to Launch, pick a name, ticker, pair and art style, optionally add a dev buy, and confirm with your wallet."],
  ["When does the squad start?", "Once the coin reaches $10K market cap, the squad posts memes, raids and updates every 15 minutes."],
  ["What is the bonding curve?", "Price rises as people buy. At 100% the coin graduates and liquidity migrates to a DEX."],
  ["Terms, privacy & risk", "Memecoins are highly speculative. Nothing here is financial advice. Only use funds you can afford to lose."],
];

function Docs() {
  return (
    <div>
      <PageHead kicker="Docs" title="How it works" />
      <div className="mt-4">
        {QA.map(([q, a]) => (
          <details key={q} className="group border-b py-5">
            <summary className="cursor-pointer list-none font-display text-xl font-medium">{q}</summary>
            <p className="mt-2 max-w-2xl text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
