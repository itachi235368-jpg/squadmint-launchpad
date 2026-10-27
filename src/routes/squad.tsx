import { createFileRoute } from "@tanstack/react-router";
import { MINIONS } from "@/lib/data";
import { Terminal } from "@/components/ui-bits";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "The Squad — minions.quest" },
      { name: "description", content: "Meet the 7 AI minions that run every coin: Atlas, Cipher, Pixel, Nova, Echo, Forge and Blitz." },
      { property: "og:title", content: "The Squad — minions.quest" },
      { property: "og:description", content: "Abilities and live mission logs of the 7 AI minions." },
    ],
  }),
  component: Squad,
});

function Squad() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">Agent Roster</h1>
        <p className="mt-1 text-muted-foreground">Seven specialists. One mission: send your coin to the moon.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {MINIONS.map((m, i) => (
          <div key={m.id} className="panel p-6 transition hover:glow">
            <div className="flex items-center gap-4">
              <span className="animate-floaty text-5xl" style={{ animationDelay: `${i * 0.3}s` }}>{m.emoji}</span>
              <div>
                <div className="font-mono text-xs text-muted-foreground">#{String(i + 1).padStart(2, "0")}</div>
                <div className="font-display text-2xl font-medium tracking-tight">{m.name}</div>
                <div className={`text-sm ${m.color}`}>{m.role} · {m.title}</div>
              </div>
              <span className="ml-auto flex items-center gap-1 font-mono text-xs text-success"><span className="h-2 w-2 animate-pulse rounded-full bg-success" />ACTIVE</span>
            </div>
            <p className="mt-4 text-sm">{m.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.abilities.map((a) => <span key={a} className="rounded border px-2 py-1 font-mono text-xs">{a}</span>)}
            </div>
            <div className="mt-4 space-y-1 border-t pt-3 font-mono text-xs text-muted-foreground">
              {m.actions.slice(0, 3).map((a) => <div key={a}>› {a}</div>)}
            </div>
          </div>
        ))}
      </div>
      <Terminal title="minion://mission-log (all squads)" rows={14} />
    </div>
  );
}
