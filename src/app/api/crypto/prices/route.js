import { NextResponse } from "next/server";

const COINS = "bitcoin,ethereum,tether,binancecoin,solana,ripple,usd-coin,cardano,dogecoin,tron,avalanche-2,chainlink,polkadot,matic-network,litecoin,shiba-inu,bitcoin-cash,uniswap,stellar,near";

const symbolMap = {
  bitcoin: "BTC",
  ethereum: "ETH",
  tether: "USDT",
  binancecoin: "BNB",
  solana: "SOL",
  ripple: "XRP",
  "usd-coin": "USDC",
  cardano: "ADA",
  dogecoin: "DOGE",
  tron: "TRX",
  "avalanche-2": "AVAX",
  chainlink: "LINK",
  polkadot: "DOT",
  "matic-network": "MATIC",
  litecoin: "LTC",
  "shiba-inu": "SHIB",
  "bitcoin-cash": "BCH",
  uniswap: "UNI",
  stellar: "XLM",
  near: "NEAR",
};

const nameMap = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  tether: "Tether",
  binancecoin: "BNB",
  solana: "Solana",
  ripple: "XRP",
  "usd-coin": "USD Coin",
  cardano: "Cardano",
  dogecoin: "Dogecoin",
  tron: "TRON",
  "avalanche-2": "Avalanche",
  chainlink: "Chainlink",
  polkadot: "Polkadot",
  "matic-network": "Polygon",
  litecoin: "Litecoin",
  "shiba-inu": "Shiba Inu",
  "bitcoin-cash": "Bitcoin Cash",
  uniswap: "Uniswap",
  stellar: "Stellar",
  near: "NEAR Protocol",
};

// Module-level in-memory cache — shared across all requests to this server instance
let cachedPrices = null;
let cachedAt = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds

export async function GET() {
  const now = Date.now();

  // Serve from cache if still fresh — avoids hitting CoinGecko on every user's request
  if (cachedPrices && now - cachedAt < CACHE_DURATION_MS) {
    return NextResponse.json(
      { prices: cachedPrices, cached: true },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } }
    );
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINS}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko request failed with status ${res.status}`);
    }

    const data = await res.json();

    const prices = Object.entries(data).map(([id, val]) => ({
      id,
      symbol: symbolMap[id] || id.toUpperCase(),
      name: nameMap[id] || id,
      price: val.usd,
      change24h: val.usd_24h_change || 0,
    }));

    cachedPrices = prices;
    cachedAt = now;

    return NextResponse.json(
      { prices, cached: false },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("Crypto price fetch error:", error);

    // If CoinGecko fails but we have a stale cache, serve that rather than erroring out entirely
    if (cachedPrices) {
      return NextResponse.json(
        { prices: cachedPrices, cached: true, stale: true },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 502 });
  }
}