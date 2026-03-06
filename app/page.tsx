"use client";

import { useState } from "react";
import { t, type Lang } from "../lib/copy";

type ApiData = {
symbol: string;
score: number;
mood: "FEAR" | "NEUTRAL" | "GREED";
title?: string;
indicators?: {
rsi14: number;
trend_vs_ma200: number;
vol_60d: number;
};
cached?: boolean;
cacheSeconds?: number;
error?: string;
};

export default function Home() {
const [symbol, setSymbol] = useState("");
const [data, setData] = useState<ApiData | null>(null);
const [loading, setLoading] = useState(false);
const [err, setErr] = useState<string>("");
const [showTip, setShowTip] = useState(false);

const [lang, setLang] = useState<Lang>("en");
const C = t(lang);

// FX tool state
const [fxFrom, setFxFrom] = useState("USD");
const [fxTo, setFxTo] = useState("CNY");
const [fxAmount, setFxAmount] = useState("100");
const [fxLoading, setFxLoading] = useState(false);
const [fxErr, setFxErr] = useState("");
const [fxData, setFxData] = useState<any>(null);
const [showFxTip, setShowFxTip] = useState(false);

const moodLabel =
data?.mood === "FEAR"
? C.result.fearful
: data?.mood === "GREED"
? C.result.greedy
: C.result.neutral;

async function check() {
try {
setLoading(true);
setErr("");
setData(null);

const s = symbol.trim();
if (!s) {
setErr(C.input.errorNoData);
return;
}

const res = await fetch(`/api/sentiment?symbol=${encodeURIComponent(s)}`);
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

async function fxConvert() {
try {
setFxLoading(true);
setFxErr("");
setFxData(null);

const amt = Number(fxAmount);
if (!Number.isFinite(amt) || amt <= 0) {
setFxErr(lang === "zh" ? "请输入正确金额（大于 0）" : "Please enter a valid amount (> 0).");
return;
}

const res = await fetch(
`/api/fx?from=${encodeURIComponent(fxFrom)}&to=${encodeURIComponent(fxTo)}&amount=${encodeURIComponent(
String(amt)
)}`
);
const json = await res.json();
if (!res.ok) {
setFxErr(json?.error || "FX error");
return;
}
setFxData(json);
} catch (e: any) {
setFxErr(e?.message || "Network error");
} finally {
setFxLoading(false);
}
}

const cardBg =
!data ? "#111827" : data.mood === "FEAR" ? "#991b1b" : data.mood === "GREED" ? "#065f46" : "#374151";

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
position: "relative",
}}
>
{/* 🌍 Language Switch */}
<div style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 8 }}>
<button
onClick={() => setLang("en")}
style={{
padding: "8px 10px",
borderRadius: 999,
border: "1px solid rgba(255,255,255,0.18)",
background: lang === "en" ? "white" : "rgba(255,255,255,0.08)",
color: lang === "en" ? "black" : "white",
fontWeight: 900,
cursor: "pointer",
}}
>
{C.lang.en}
</button>

<button
onClick={() => setLang("zh")}
style={{
padding: "8px 10px",
borderRadius: 999,
border: "1px solid rgba(255,255,255,0.18)",
background: lang === "zh" ? "white" : "rgba(255,255,255,0.08)",
color: lang === "zh" ? "black" : "white",
fontWeight: 900,
cursor: "pointer",
}}
>
{C.lang.zh}
</button>
</div>

<div style={{ width: "100%", maxWidth: 820 }}>
<h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: 0.5 }}>{C.brand.name}</h1>

<p style={{ color: "#9ca3af", marginTop: 10, fontSize: 18, lineHeight: 1.5 }}>
{C.brand.tagline1}
<br />
{C.brand.tagline2}
</p>

<div style={{ display: "flex", gap: 12, marginTop: 26 }}>
  <input
    value={symbol}
    onChange={(e) => setSymbol(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !loading) {
        e.preventDefault();
        check();
      }
    }}
    placeholder="Try: SPY, QQQ, AAPL"
    autoComplete="off"
    spellCheck={false}
    inputMode="text"
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
{loading ? C.input.loading : C.input.check}
</button>
</div>

{err && <div style={{ marginTop: 14, color: "#f87171" }}>{err}</div>}

{/* Result */}
{data && (
<div style={{ marginTop: 18 }}>
<div style={{ fontSize: 42, fontWeight: 950, letterSpacing: 1 }}>
{C.result.peopleAre} {moodLabel}
</div>

<div
style={{
marginTop: 16,
padding: 22,
borderRadius: 22,
background: cardBg,
position: "relative",
border: "1px solid rgba(255,255,255,0.08)",
}}
>
<div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
<div>
<div style={{ color: "rgba(255,255,255,0.7)" }}>{C.result.index}</div>
<div style={{ fontSize: 22, fontWeight: 800 }}>{data.symbol}</div>
</div>

{/* Score + tooltip */}
<div style={{ textAlign: "right", position: "relative" }}>
<div style={{ color: "rgba(255,255,255,0.7)" }}>{C.result.score}</div>
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
width: 360,
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
<div style={{ fontWeight: 900, marginBottom: 6 }}>{C.tooltip.howTitle}</div>
<div style={{ color: "rgba(255,255,255,0.85)" }}>
{C.tooltip.howBodyIntro}
<br />1) <b>{C.tooltip.how1}</b>
<br />2) <b>{C.tooltip.how2}</b>
<br />3) <b>{C.tooltip.how3}</b>
<br />
<br />
{C.tooltip.intuition}
<br />
<br />
<span style={{ color: "rgba(255,255,255,0.7)" }}>{C.tooltip.timelinessBody}</span>
</div>
</div>
)}
</div>
</div>

<div style={{ marginTop: 10, fontSize: 18 }}>
{data.mood === "FEAR" ? C.advice.fear : data.mood === "GREED" ? C.advice.greed : C.advice.neutral}
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
{C.result.educationOnly}
</div>
<div style={{ marginTop: 6, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
{C.result.timeliness}
{data.cached ? ` • ${C.result.cachedBadge}` : ""}
</div>
</div>
</div>
)}

{/* FX Tool */}
<div
style={{
marginTop: 22,
padding: 18,
borderRadius: 18,
border: "1px solid rgba(255,255,255,0.10)",
background: "#0b0f19",
}}
>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ fontSize: 18, fontWeight: 950 }}>{C.fx.title}</div>

<div style={{ position: "relative" }}>
<span
onMouseEnter={() => setShowFxTip(true)}
onMouseLeave={() => setShowFxTip(false)}
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
>
i
</span>

{showFxTip && (
<div
style={{
position: "absolute",
right: 0,
top: 28,
width: 380,
background: "#111827",
border: "1px solid rgba(255,255,255,0.14)",
borderRadius: 14,
padding: 12,
fontSize: 13,
lineHeight: 1.45,
zIndex: 10,
boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
}}
>
<div style={{ fontWeight: 950, marginBottom: 6 }}>{C.fx.tipTitle}</div>
<div style={{ color: "rgba(255,255,255,0.85)" }}>{C.fx.tipBody}</div>
</div>
)}
</div>
</div>

<div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr auto", gap: 10 }}>
<select
value={fxFrom}
onChange={(e) => setFxFrom(e.target.value)}
style={{
padding: 12,
borderRadius: 12,
border: "1px solid rgba(255,255,255,0.15)",
background: "#000",
color: "white",
}}
>
<option>USD</option>
<option>CNY</option>
<option>EUR</option>
<option>JPY</option>
<option>HKD</option>
<option>GBP</option>
</select>

<select
value={fxTo}
onChange={(e) => setFxTo(e.target.value)}
style={{
padding: 12,
borderRadius: 12,
border: "1px solid rgba(255,255,255,0.15)",
background: "#000",
color: "white",
}}
>
<option>CNY</option>
<option>USD</option>
<option>EUR</option>
<option>JPY</option>
<option>HKD</option>
<option>GBP</option>
</select>
<input
  value={fxAmount}
  inputMode="decimal"
  placeholder={C.fx.amount}
  onChange={(e) => setFxAmount(e.target.value)}
  style={{
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#000",
    color: "white",
  }}
/>

<button
onClick={fxConvert}
disabled={fxLoading}
style={{
padding: "12px 14px",
borderRadius: 12,
background: "white",
color: "black",
fontWeight: 950,
cursor: fxLoading ? "not-allowed" : "pointer",
opacity: fxLoading ? 0.6 : 1,
}}
>
{fxLoading ? C.input.loading : C.fx.convert}
</button>
</div>

{fxErr && <div style={{ marginTop: 10, color: "#f87171" }}>{fxErr}</div>}

{fxData && (
<div style={{ marginTop: 12, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>
<div>
Rate: <b>1 {fxData.from}</b> = <b>{fxData.rate}</b> {fxData.to}
</div>
<div>
Result: <b>{fxData.amount}</b> {fxData.from} ≈ <b>{fxData.converted}</b> {fxData.to}
</div>
<div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
{C.fx.providerLine}: {fxData.provider}
{fxData.date ? ` • ${C.fx.rateDate}: ${fxData.date}` : ""} • {C.fx.cachedLine}:{" "}
{String(!!fxData.cached)} (≤ {fxData.cacheSeconds}s)
</div>
</div>
)}
</div>
</div>
</main>
);
}