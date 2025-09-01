import axios from "axios";
import type { Candle } from "../types";

// Try multiple Binance hosts (some are blocked in certain regions)
const HOSTS = [
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://data-api.binance.vision",
];

export async function fetchKlinesBinance(
  symbol: string,
  interval: string,
  limit = 200,
  timeoutMs = 25000
): Promise<Candle[]> {
  const errs: any[] = [];
  for (const base of HOSTS) {
    try {
      const url = `${base}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const res = await axios.get(url, { timeout: timeoutMs });
      const rows = res.data as any[];
      return rows.map((r) => ({
        openTime: r[0],
        open: parseFloat(r[1]),
        high: parseFloat(r[2]),
        low: parseFloat(r[3]),
        close: parseFloat(r[4]),
        volume: parseFloat(r[5]),
        closeTime: r[6],
      }));
    } catch (e) {
      errs.push(`${base}: ${(e as any)?.message || e}`);
    }
  }
  throw new Error(`Binance fetch failed on all hosts:\n${errs.join("\n")}`);
}
