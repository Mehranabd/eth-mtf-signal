import axios from "axios";
import type { Candle } from "../types";

// Map our intervals to Bybit's
const BYBIT_MAP: Record<string, string> = {
  "1m": "1",
  "3m": "3",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "2h": "120",
  "4h": "240",
  "6h": "360",
  "12h": "720",
  "1d": "D",
  "1w": "W",
  "1M": "M",
};

export async function fetchKlinesBybit(
  symbol: string, // e.g., ETHUSDT
  interval: string, // e.g., "1m", "1h", "1d"
  limit = 200,
  timeoutMs = 25000
): Promise<Candle[]> {
  const bybitInterval = BYBIT_MAP[interval];
  if (!bybitInterval)
    throw new Error(`Bybit interval not supported: ${interval}`);

  // category=linear (USDT perpetual), for spot use category=spot
  const url = `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`;
  const res = await axios.get(url, { timeout: timeoutMs });
  const list = (res.data?.result?.list || []) as any[];

  // Bybit returns newest first; reverse for oldest->newest
  const rows = [...list].reverse();

  return rows.map((r) => ({
    // r = [ start, open, high, low, close, volume, turnover ]
    openTime: Number(r[0]),
    open: parseFloat(r[1]),
    high: parseFloat(r[2]),
    low: parseFloat(r[3]),
    close: parseFloat(r[4]),
    volume: parseFloat(r[5]),
    closeTime: Number(r[0]) + 1, // not provided; approximate
  }));
}
