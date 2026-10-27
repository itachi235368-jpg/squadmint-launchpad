import { curveFill } from "@/lib/launch-rules";

export type Minion = {
  id: string; name: string; role: string; title: string; emoji: string;
  color: string; bio: string; abilities: string[]; actions: string[];
  /** When this minion starts working on a coin. */
  trigger: string;
};

export const MINIONS: Minion[] = [
  { id: "bob", trigger: "Starts at launch — researches narratives right away", name: "Bob", role: "Alpha & Narrative Scout", title: "Narrative & Market Research", emoji: "🛰️", color: "text-gold",
    bio: "Scrapes X trends, monitors meme metas and uncovers viral angles and keywords for the coin.",
    abilities: ["X trend scraping", "Meme meta monitoring", "Viral angles & keywords", "Competitor & sentiment tracking"],
    actions: ["scrapes X narratives", "tracks competitor tickers", "detects sentiment surges"] },
  { id: "kevin", trigger: "Once market cap holds above $10K — builds the coin's X account", name: "Kevin", role: "Official X Creator & Socials", title: "X Account & Socials Deployment", emoji: "📣", color: "text-accent",
    bio: "Automatically creates and configures the coin's official X account, profile banners, raid tweets and automated post schedules.",
    abilities: ["Official X account creation", "Profile & banner configuration", "Raid tweets", "Automated post schedules"],
    actions: ["created @coin official account", "queued launch thread", "initiated viral raid"] },
  { id: "stuart", trigger: "When the bonding curve completes — pays for DEX Screener", name: "Stuart", role: "Bonding Curve & DEX Migration", title: "Bonding Curve & DEX Liquidity", emoji: "💧", color: "text-primary",
    bio: "Tracks graduation towards 100% bonding curve, pays for DEX Screener and seeds DEX liquidity pools on Raydium / Meteora.",
    abilities: ["Bonding curve tracking to 100%", "DEX Screener payment", "Raydium / Meteora liquidity", "DEX migration & LP burn"],
    actions: ["monitored curve to 100%", "triggered DEX graduation", "deposited liquidity & burnt LP"] },
  { id: "otto", trigger: "After graduation — runs ongoing buybacks and burns", name: "Otto", role: "Buyback & Burn Engine", title: "Fee Buyback & Token Burn", emoji: "🔥", color: "text-destructive",
    bio: "Collects platform trading fees, executes market buybacks and burns tokens on-chain with verifiable burn transaction hashes.",
    abilities: ["Trading fee collection", "Market buybacks", "On-chain token burns", "Verifiable burn tx hashes"],
    actions: ["automated buyback executed", "burned supply tokens", "updated live burn proof"] },
  { id: "dave", trigger: "Starts at launch — builds the website and keeps it updated", name: "Dave", role: "Web Builder & Operations HQ", title: "Web Builder & Ops Commander", emoji: "🏗️", color: "text-primary",
    bio: "Instantly builds, hosts and deploys the coin's live website, mini-portal and holder terminal, and handles operations.",
    abilities: ["Instant website deployment", "Mini-portal hosting", "Holder terminal & DEX charts", "CDN & operations management"],
    actions: ["deployed live website", "connected live DEX chart", "optimized CDN assets"] },
];

export type Token = {
  ticker: string; name: string; emoji: string; mcap: number; change: number;
  curve: number; level: number; pair: "SOL" | "USDC" | "USD1"; age: string; holders: number; style: string; burned: number;
  /** Real launch data, present only for coins saved from the backend. */
  image?: string; mint?: string; description?: string;
  twitter?: string | null; telegram?: string | null; website?: string | null;
};

/** A launched-coin row from the backend. */
export type CoinRow = {
  id: string; mint: string; name: string; symbol: string; uri: string; image: string;
  description: string | null; twitter: string | null; telegram: string | null; website: string | null;
  creator_wallet: string; dev_buy_sol: number | string; signature: string; created_at: string;
};

const ageOf = (iso: string) => {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${Math.max(1, mins)}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
};

/** Maps a backend launch row into the display token shape. */
export const coinToToken = (c: CoinRow): Token => ({
  ticker: c.symbol,
  name: c.name,
  emoji: "",
  image: c.image,
  mint: c.mint,
  mcap: 0,
  change: 0,
  curve: Math.round(curveFill(Number(c.dev_buy_sol)) * 100),
  level: 0,
  pair: "SOL",
  age: ageOf(c.created_at),
  holders: 0,
  style: "",
  burned: 0,
  description: c.description ?? "",
  twitter: c.twitter,
  telegram: c.telegram,
  website: c.website,
});

// No simulated coins: launched coins come from the backend once a launch flow writes them.
export const TOKENS: Token[] = [];

export const fmtUsd = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;
/** Market caps are unknown until on-chain data is wired up; an empty cap shows as a dash, never a fake number. */
export const fmtMcap = (n: number) => (n > 0 ? fmtUsd(n) : "—");
export const fmtNum = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;


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
