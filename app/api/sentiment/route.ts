import { NextResponse } from "next/server";

// ========== 60秒缓存，避免限流 ==========
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { ts: number; payload: any }>();

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function sma(values: number[], period: number) {
  if (values.length < period) return NaN;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function returns(values: number[]) {
  const r: number[] = [];
  for (let i = 1; i < values.length; i++) r.push(values[i] / values[i - 1] - 1);
  return r;
}

function stdev(values: number[]) {
  if (values.length < 2) return NaN;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const varr =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(varr);
}

function rsi14(closes: number[]) {
  const period = 14;
  if (closes.length < period + 1) return NaN;

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += -diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

async function fetchCloses(symbol: string): Promise<number[]> {
  const key = process.env.ALPHAVANTAGE_KEY;
  if (!key) throw new Error("Missing ALPHAVANTAGE_KEY (.env.local)");

  const url =
  `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
    symbol
  )}&outputsize=compact&apikey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();

  // Alpha Vantage 常见返回：Note / Information（限流或提示）
  const note = json?.Note || json?.Information;
  if (note) throw new Error(String(note));

  const errMsg = json?.["Error Message"];
  if (errMsg) throw new Error(String(errMsg));

  const series = json["Time Series (Daily)"];
  if (!series) {
    throw new Error("No time series found. Keys: " + Object.keys(json).join(", "));
  }

  const dates = Object.keys(series).sort(); // old -> new
  const closes = dates.map((d) => Number(series[d]["4. close"])).filter((n) => Number.isFinite(n));



  return closes.slice(-260);
}

function computeScore(closes: number[]) {
  const last = closes[closes.length - 1];

  // 1) RSI(14)
  const rsi = rsi14(closes);
  const rsiScore = clamp(((rsi - 30) / 40) * 100, 0, 100); // 30->0, 70->100

  // 2) 趋势：价格 vs MA200
  const ma200 = sma(closes, 50);
  const trend = isNaN(ma200) ? 0 : last / ma200 - 1;
  const trendScore = clamp(((trend + 0.2) / 0.4) * 100, 0, 100); // -20%->0, +20%->100

  // 3) 波动率：近60日
  const vol = stdev(returns(closes.slice(-60)));
  const volScore = clamp((1 - (vol - 0.005) / 0.025) * 100, 0, 100); // 高波动更恐惧

  const score = 0.45 * rsiScore + 0.35 * trendScore + 0.2 * volScore;

  return {
    score: Math.round(clamp(score, 0, 100)),
    rsi14: Math.round(rsi * 10) / 10,
    trend_vs_ma200: Math.round(trend * 10000) / 10000,
    vol_60d: Math.round(vol * 10000) / 10000,
  };
}

function label(score: number) {
  if (score <= 25) return { mood: "FEAR", title: "EXTREME FEAR" };
  if (score <= 45) return { mood: "FEAR", title: "FEAR" };
  if (score <= 55) return { mood: "NEUTRAL", title: "NEUTRAL" };
  if (score <= 75) return { mood: "GREED", title: "GREED" };
  return { mood: "GREED", title: "EXTREME GREED" };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  // ===== 缓存命中直接返回 =====
  const hit = cache.get(symbol);
  const now = Date.now();
  if (hit && now - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ...hit.payload, cached: true });
  }

  try {
    const closes = await fetchCloses(symbol);
    const c = computeScore(closes);
    const { mood, title } = label(c.score);

    const advice =
      mood === "FEAR"
        ? "People are fearful. Consider gradual accumulation and strict risk limits."
        : mood === "GREED"
        ? "People are greedy. Consider protecting gains and reducing risk."
        : "Sentiment is neutral. Stay disciplined and avoid impulse trades.";

    const payload = {
      symbol,
      score: c.score,
      mood,
      title,
      advice,
      indicators: {
        rsi14: c.rsi14,
        trend_vs_ma200: c.trend_vs_ma200,
        vol_60d: c.vol_60d,
      },
    };

    cache.set(symbol, { ts: Date.now(), payload });
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}