export type Minion = {
  id: string; name: string; role: string; title: string; emoji: string;
  color: string; bio: string; abilities: string[]; actions: string[];
};

export const MINIONS: Minion[] = [
  { id: "bob", name: "Bob", role: "Alpha & Narrative Scout", title: "Narrative & Market Research", emoji: "🛰️", color: "text-gold",
    bio: "Scrapes X trends, monitors meme metas and uncovers viral angles and keywords for the coin.",
    abilities: ["X trend scraping", "Meme meta monitoring", "Viral angles & keywords", "Competitor & sentiment tracking"],
    actions: ["scrapes X narratives", "tracks competitor tickers", "detects sentiment surges"] },
  { id: "kevin", name: "Kevin", role: "Official X Creator & Socials", title: "X Account & Socials Deployment", emoji: "📣", color: "text-accent",
    bio: "Automatically creates and configures the coin's official X account, profile banners, raid tweets and automated post schedules.",
    abilities: ["Official X account creation", "Profile & banner configuration", "Raid tweets", "Automated post schedules"],
    actions: ["created @coin official account", "queued launch thread", "initiated viral raid"] },
  { id: "stuart", name: "Stuart", role: "Bonding Curve & DEX Migration", title: "Bonding Curve & DEX Liquidity", emoji: "💧", color: "text-primary",
    bio: "Tracks graduation towards 100% bonding curve, pays graduation fees and seeds DEX liquidity pools on Raydium / Meteora.",
    abilities: ["Bonding curve tracking to 100%", "Graduation fee payment", "Raydium / Meteora liquidity", "DEX migration & LP burn"],
    actions: ["monitored curve to 100%", "triggered DEX graduation", "deposited liquidity & burnt LP"] },
  { id: "otto", name: "Otto", role: "Buyback & Burn Engine", title: "Fee Buyback & Token Burn", emoji: "🔥", color: "text-destructive",
    bio: "Collects platform trading fees, executes market buybacks and burns tokens on-chain with verifiable burn transaction hashes.",
    abilities: ["Trading fee collection", "Market buybacks", "On-chain token burns", "Verifiable burn tx hashes"],
    actions: ["automated buyback executed", "burned supply tokens", "updated live burn proof"] },
  { id: "dave", name: "Dave", role: "Web Builder & Operations HQ", title: "Web Builder & Ops Commander", emoji: "🏗️", color: "text-primary",
    bio: "Instantly builds, hosts and deploys the coin's live website, mini-portal and holder terminal, and handles operations.",
    abilities: ["Instant website deployment", "Mini-portal hosting", "Holder terminal & DEX charts", "CDN & operations management"],
    actions: ["deployed live website", "connected live DEX chart", "optimized CDN assets"] },
];

export type Token = {
  ticker: string; name: string; emoji: string; mcap: number; change: number;
  curve: number; level: number; pair: "SOL" | "USDC" | "USD1"; age: string; holders: number; style: string; burned: number;
};

// No simulated coins: launched coins come from the backend once a launch flow writes them.
export const TOKENS: Token[] = [];

export const fmtUsd = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;
export const fmtNum = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

export function randomLog(tickers = TOKENS.map((t) => t.ticker), only?: string) {
  const pool = only ? MINIONS.filter((x) => x.id === only) : MINIONS;
  const m = pool[Math.floor(Math.random() * pool.length)] ?? MINIONS[0];
  if (!m) throw new Error("Minion roster is empty");
  const a = m.actions[Math.floor(Math.random() * m.actions.length)];
  const t = tickers[Math.floor(Math.random() * tickers.length)] ?? TOKENS[0]?.ticker ?? "COIN";
  return { id: Math.random().toString(36).slice(2), minion: m, ticker: t, text: a, time: new Date().toLocaleTimeString("en-GB") };
}

export function genCandles(n = 48, seed = 1) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let p = 10;
  return Array.from({ length: n }, () => {
    const o = p;
    const c = Math.max(1, o + (rnd() - 0.42) * 2);
    const h = Math.max(o, c) + rnd();
    const l = Math.max(0.5, Math.min(o, c) - rnd());
    p = c;
    return { o, c, h, l };
  });
}

export const SQUAD_THRESHOLD = 10000;
export const squadActive = (t: Token) => t.mcap >= SQUAD_THRESHOLD;
export const isTickerTaken = (ticker: string) =>
  TOKENS.some((t) => t.ticker === ticker.trim().toUpperCase().replace(/^\$/, ""));
