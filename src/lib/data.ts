export type Minion = {
  id: string; name: string; role: string; title: string; emoji: string;
  color: string; bio: string; abilities: string[]; actions: string[];
};

export const MINIONS: Minion[] = [
  { id: "atlas", name: "Atlas", role: "Squad Commander", title: "Strategy & Director", emoji: "🛡️", color: "text-gold",
    bio: "Sets the campaign objective, assigns quests to the squad and decides when to push or regroup.",
    abilities: ["Quest planning", "Squad orchestration", "Risk thresholds", "Milestone calls"],
    actions: ["assigned new quest to Echo", "raised campaign tempo to AGGRESSIVE", "approved 3 meme drafts", "set graduation sprint plan", "rebalanced squad priorities"] },
  { id: "cipher", name: "Cipher", role: "Scout / Recon", title: "Market Intelligence & Trends", emoji: "🛰️", color: "text-primary",
    bio: "Scans socials, on-chain flows and trending narratives to find the next wave before it breaks.",
    abilities: ["Trend radar", "Wallet tracking", "Sentiment scans", "Competitor intel"],
    actions: ["detected narrative spike: 'frog season'", "flagged 12 whale wallets accumulating", "sentiment up 34% in 1h", "mapped 5 competing tickers"] },
  { id: "pixel", name: "Pixel", role: "Alchemist", title: "Meme Art, Banners & Visuals", emoji: "🎨", color: "text-accent",
    bio: "Transmutes mascots into memes, banners, stickers and PFP sets in the coin's art style.",
    abilities: ["Meme generation", "Banner forge", "Sticker packs", "Style transfer"],
    actions: ["forged 4 new meme variants", "rendered X banner 1500x500", "minted sticker pack v2", "remixed mascot in pixel-art style"] },
  { id: "nova", name: "Nova", role: "Bard", title: "Lore, Hooks & Copywriting", emoji: "📜", color: "text-gold",
    bio: "Writes the lore, the hooks and every post that makes people care about the coin.",
    abilities: ["Lore writing", "Viral hooks", "Thread crafting", "Tagline A/B"],
    actions: ["wrote chapter 3 of the lore", "drafted 10 viral hooks", "rewrote bio for higher CTR", "composed launch thread"] },
  { id: "echo", name: "Echo", role: "Raid Leader", title: "Social & Distribution", emoji: "📣", color: "text-accent",
    bio: "Leads raids, schedules posts and spreads the word across X, Telegram and Discord.",
    abilities: ["Raid coordination", "Post scheduling", "Community replies", "KOL outreach"],
    actions: ["launched raid on 8 trending posts", "scheduled 6 posts for peak hours", "replied to 42 holders in TG", "pinged 3 KOLs"] },
  { id: "forge", name: "Forge", role: "Architect", title: "Web Portal & Live Terminal", emoji: "🏗️", color: "text-primary",
    bio: "Builds and maintains the coin's website, live terminal and holder dashboards.",
    abilities: ["Site builder", "Live terminal", "Holder dashboard", "Uptime watch"],
    actions: ["deployed portal v1.2", "added live holder map", "shipped meme gallery page", "optimized load time to 0.8s"] },
  { id: "blitz", name: "Blitz", role: "Treasurer", title: "Growth, Listings & Buyback/Burn", emoji: "🔥", color: "text-destructive",
    bio: "Manages fees, listing applications and the buyback-and-burn rituals that reward holders.",
    abilities: ["Buyback & burn", "Listing applications", "Fee routing", "Treasury reports"],
    actions: ["burned 1.2M tokens from fees", "submitted listing application", "executed 0.8 SOL buyback", "published treasury receipt"] },
];

export type Token = {
  ticker: string; name: string; emoji: string; mcap: number; change: number;
  curve: number; level: number; age: string; holders: number; style: string; burned: number;
};

export const TOKENS: Token[] = [
  { ticker: "FROGZ", name: "Frog Zeus", emoji: "🐸", mcap: 412000, change: 48.2, curve: 92, level: 14, age: "3h", holders: 2140, style: "Pixel Art", burned: 4200000 },
  { ticker: "BANANA", name: "Banana Brigade", emoji: "🍌", mcap: 188000, change: 22.1, curve: 71, level: 9, age: "6h", holders: 1022, style: "Cartoon", burned: 1800000 },
  { ticker: "GOGGLE", name: "Goggle Gang", emoji: "🥽", mcap: 96000, change: -4.3, curve: 44, level: 6, age: "1h", holders: 512, style: "3D Render", burned: 600000 },
  { ticker: "NEKO", name: "Cyber Neko", emoji: "🐱", mcap: 642000, change: 12.8, curve: 98, level: 21, age: "1d", holders: 4810, style: "Anime", burned: 9100000 },
  { ticker: "RUGNT", name: "Rug Not", emoji: "🧶", mcap: 21000, change: 140.5, curve: 12, level: 2, age: "12m", holders: 88, style: "Doodle", burned: 50000 },
  { ticker: "MOONK", name: "Moon Monk", emoji: "🧘", mcap: 305000, change: 6.4, curve: 85, level: 12, age: "9h", holders: 1760, style: "Cyberpunk", burned: 3300000 },
  { ticker: "BLOB", name: "Blobbington", emoji: "🫠", mcap: 34000, change: 31.0, curve: 19, level: 3, age: "25m", holders: 140, style: "Cartoon", burned: 90000 },
  { ticker: "DRGN", name: "Pocket Dragon", emoji: "🐉", mcap: 158000, change: -11.2, curve: 63, level: 8, age: "4h", holders: 890, style: "Pixel Art", burned: 1200000 },
];

export const fmtUsd = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;
export const fmtNum = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

export function randomLog(tickers = TOKENS.map((t) => t.ticker)) {
  const m = MINIONS[Math.floor(Math.random() * MINIONS.length)];
  const a = m.actions[Math.floor(Math.random() * m.actions.length)];
  const t = tickers[Math.floor(Math.random() * tickers.length)];
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
