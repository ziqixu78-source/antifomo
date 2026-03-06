import { NextResponse } from "next/server";

// 5分钟缓存：减少外部请求
const CACHE_TTL_MS = 300_000;
const cache = new Map<string, { ts: number; payload: any }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const from = (searchParams.get("from") || "USD").toUpperCase().trim();
  const to = (searchParams.get("to") || "CNY").toUpperCase().trim();
  const amount = Number(searchParams.get("amount") || 1);

  if (!from || !to) return NextResponse.json({ error: "Missing from/to" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const key = `${from}_${to}`;
  const hit = cache.get(key);
  const now = Date.now();

  if (hit && now - hit.ts < CACHE_TTL_MS) {
    const rate = hit.payload.rate as number;
    return NextResponse.json({
      ...hit.payload,
      amount,
      converted: Number((amount * rate).toFixed(6)),
      cached: true,
      cacheSeconds: Math.floor(CACHE_TTL_MS / 1000),
    });
  }

  try {
    // Frankfurter（ECB）免费汇率：通常工作日/日更，并非秒级
    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    const rate = Number(json?.rates?.[to]);
    if (!Number.isFinite(rate)) throw new Error("FX rate not available for this pair.");

    const payload = {
      provider: "Frankfurter (ECB)",
      from,
      to,
      rate,
      date: json?.date || null,
      timelinessNote:
        "FX rates are not real-time tick data (often updated daily on business days). This tool caches results up to 5 minutes.",
    };

    cache.set(key, { ts: Date.now(), payload });

    return NextResponse.json({
      ...payload,
      amount,
      converted: Number((amount * rate).toFixed(6)),
      cached: false,
      cacheSeconds: Math.floor(CACHE_TTL_MS / 1000),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}