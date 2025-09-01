import axios from "axios";
import type { Candle } from "../types";

// days = number of days to fetch (up to 365 for 1 year)
export async function fetchDailyOHLC(
  symbol: string,
  currency = "usd",
  days = 30
): Promise<Candle[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=${currency}&days=${days}`;
  const res = await axios.get(url, { timeout: 20000 });
  const rows = res.data as any[];

  // CoinGecko returns [timestamp, open, high, low, close]
  return rows.map((r) => ({
    openTime: r[0],
    open: r[1],
    high: r[2],
    low: r[3],
    close: r[4],
    volume: 0, // not provided
    closeTime: r[0], // same as openTime
  }));
}
