"use client";
import { useState } from "react";

type ApiData = {
  symbol: string;
  score: number;
  mood: "FEAR" | "NEUTRAL" | "GREED";
  title: string;
  advice: string;
  indicators?: {
    rsi14: number;
    trend_vs_ma200: number;
    vol_60d: number;
  };
  error?: string;
};

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [showTip, setShowTip] = useState(false);

  async function check() {
    try {
      setLoading(true);
      setErr("");
      setData(null);

      const res = await fetch(`/api/sentiment?symbol=${encodeURIComponent(symbol.trim())}`);
      const json = (await res.json()) as ApiData;

      if (!res.ok) {
        setErr(json?.error || "API error");
        return;
      }
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const cardBg =
    !data ? "#111827" :
    data.mood === "FEAR" ? "#991b1b" :
    data.mood === "GREED" ? "#065f46" :
    "#374151";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 820 }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: 0.5 }}>AntiFOMO</h1>

        <p style={{ color: "#9ca3af", marginTop: 10, fontSize: 18, lineHeight: 1.5 }}>
          When people fear, we prepare.
          <br />
          When people get greedy, we protect.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Try: SPY, QQQ, AAPL"
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #333",
              background: "#0b0f19",
              color: "white",
              fontSize: 18,
            }}
          />
          <button
            onClick={check}
            disabled={loading}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "white",
              color: "black",
              fontWeight: 800,
              fontSize: 18,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              minWidth: 120,
            }}
          >
            {loading ? "..." : "Check"}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 14, color: "#f87171" }}>
            {err}
          </div>
        )}

        {data && (
          <div
            style={{
              marginTop: 24,
              padding: 22,
              borderRadius: 22,
              background: cardBg,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>INDEX</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{data.symbol}</div>
              </div>

              {/* Score + tooltip */}
              <div style={{ textAlign: "right", position: "relative" }}>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>SCORE</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{data.score}/100</div>

                  <span
                    onMouseEnter={() => setShowTip(true)}
                    onMouseLeave={() => setShowTip(false)}
                    style={{
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.9)",
                      color: "black",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: 12,
                      fontWeight: 900,
                      userSelect: "none",
                    }}
                    title=""
                  >
                    i
                  </span>
                </div>

                {showTip && (
                  <div
                    style={{
                      position: "absolute",
                      top: 44,
                      right: 0,
                      width: 320,
                      background: "#0b0f19",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 14,
                      padding: 12,
                      fontSize: 13,
                      lineHeight: 1.45,
                      zIndex: 10,
                      boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>
                      Fear & Greed 分数怎么算？
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.85)" }}>
                      这个分数是一个 0–100 的“情绪代理指标”，来自三项加权：
                      <br />1) <b>RSI(14)</b>：超买/超卖
                      <br />2) <b>趋势</b>：价格相对 <b>200日均线</b>
                      <br />3) <b>波动率</b>：近 <b>60日</b> 日收益波动
                      <br /><br />
                      直觉：RSI高 + 趋势强 + 波动低 → 更偏“贪婪”；反之更偏“恐惧”。
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 42, fontWeight: 950, letterSpacing: 1 }}>
              PEOPLE ARE {(data.title ?? data.mood ?? "UNKNOWN").toUpperCase()}
            </div>

            <div style={{ marginTop: 10, fontSize: 18 }}>
              {data.advice}
            </div>

            {data.indicators && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,0.10)",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>RSI(14)</div>
                  <div style={{ fontWeight: 800 }}>{data.indicators.rsi14}</div>
                </div>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>Trend vs MA200</div>
                  <div style={{ fontWeight: 800 }}>{data.indicators.trend_vs_ma200}</div>
                </div>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>Vol(60d)</div>
                  <div style={{ fontWeight: 800 }}>{data.indicators.vol_60d}</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 14, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
              Educational only. Not financial advice.
            </div>
            <div style={{ marginTop: 6, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
  Data timeliness: uses Daily (end-of-day) market data. To reduce API limits, results may be cached up to 60 seconds.
</div>
<div style={{ marginTop: 6, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
  数据实时性：使用日线（Daily）数据计算，并为避免接口限流对相同标的缓存最多 60 秒。
</div>
          </div>
        )}
      </div>
    </main>
  );
}