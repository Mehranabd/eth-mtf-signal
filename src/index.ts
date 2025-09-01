import { fetchKlinesBinance } from "./exchanges/binance";
import { fetchKlinesBybit } from "./exchanges/bybit";
import { fetchDailyOHLC } from "./exchanges/coingecko";

const SYMBOL_BINANCE = "ETHUSDT";
const SYMBOL_GECKO = "ethereum";

function ts(x: number) {
  const d = new Date(x);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

async function getKlines(symbol: string, interval: string, limit: number) {
  try {
    return await fetchKlinesBinance(symbol, interval, limit);
  } catch {
    try {
      return await fetchKlinesBybit(symbol, interval, limit);
    } catch {
      if (interval === "1d") {
        console.warn("Binance+Bybit failed, falling back to CoinGecko…");
        return await fetchDailyOHLC(SYMBOL_GECKO, "usd", 30);
      }
      throw new Error("No data source available for " + interval);
    }
  }
}

async function main() {
  console.log("\nFetching ETH candles with multiple fallbacks…\n");

  const m1 = await getKlines(SYMBOL_BINANCE, "1m", 60).catch(() => []);
  const d1 = await getKlines(SYMBOL_BINANCE, "1d", 30);

  if (m1.length) {
    const lastM1 = m1[m1.length - 1];
    console.log("Latest 1m candle:");
    console.table([
      {
        Time: ts(lastM1.openTime),
        Open: lastM1.open.toFixed(2),
        High: lastM1.high.toFixed(2),
        Low: lastM1.low.toFixed(2),
        Close: lastM1.close.toFixed(2),
        Vol: lastM1.volume.toFixed(2),
      },
    ]);
  } else {
    console.log("1m candles not available (needs Binance/Bybit).");
  }

  const lastD1 = d1[d1.length - 1];
  console.log("\nLatest 1d candle:");
  console.table([
    {
      Time: ts(lastD1.openTime),
      Open: lastD1.open.toFixed(2),
      High: lastD1.high.toFixed(2),
      Low: lastD1.low.toFixed(2),
      Close: lastD1.close.toFixed(2),
    },
  ]);

  console.log("\nDone.\n");
}

main().catch((e) => {
  console.error("Error:", e?.message || e);
  process.exit(1);
});
