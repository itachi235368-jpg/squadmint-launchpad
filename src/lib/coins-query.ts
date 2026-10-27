import { queryOptions } from "@tanstack/react-query";
import { listCoins } from "@/lib/coins.functions";
import { coinToToken } from "@/lib/data";

/** All launched coins as display tokens; failures degrade to an empty list, never a thrown error. */
export const coinsQueryOptions = () =>
  queryOptions({
    queryKey: ["coins"],
    queryFn: async () => {
      const { coins, error } = await listCoins();
      return { coins: coins.map(coinToToken), error: error ?? null };
    },
  });

/** One launched coin by ticker, or null when it does not exist. */
export const coinByTickerOptions = (ticker: string) =>
  queryOptions({
    queryKey: ["coin", ticker.trim().toUpperCase()],
    queryFn: async () => {
      const { coin } = await getCoinByTicker({ data: { ticker } });
      return coin ? coinToToken(coin) : null;
    },
  });

import { getCoinByTicker } from "@/lib/coins.functions";
