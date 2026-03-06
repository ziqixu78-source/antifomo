export type Lang = "en" | "zh";

export const COPY = {
  en: {
    brand: {
      name: "AntiFOMO",
      tagline1: "When people are fearful, we prepare.",
      tagline2: "When people are greedy, we protect.",
    },

    input: {
      placeholder: "Try: SPY, QQQ, GLD, AAPL",
      check: "Check",
      loading: "Loading...",
      errorNoData: "No data returned.",
    },

    result: {
      index: "INDEX",
      score: "SCORE",
      peopleAre: "PEOPLE ARE",
      fearful: "FEARFUL",
      greedy: "GREEDY",
      neutral: "NEUTRAL",
      educationOnly: "Educational only. Not financial advice.",
      timeliness:
        "Timeliness: computed from Daily (end-of-day) market data. Results may be cached briefly to reduce API limits.",
      cachedBadge: "Cached",
    },

    advice: {
      fear:
        "The market shows signs of fear. Consider preparing gradually, sizing positions conservatively, and staying disciplined.",
      greed:
        "The market shows signs of greed. Consider protecting gains, reducing risk, and avoiding emotional chasing.",
      neutral:
        "Sentiment is neutral. Stick to your plan and avoid impulsive decisions.",
    },

    tooltip: {
      howTitle: "How is this Fear & Greed score calculated?",
      howBodyIntro:
        "This is a 0–100 educational sentiment proxy built from three weighted signals:",
      how1: "RSI(14): overbought/oversold",
      how2: "Trend: price vs MA200",
      how3: "Volatility: recent return volatility",
      intuition:
        "Intuition: higher RSI + stronger trend + lower volatility → more “greedy”; the opposite → more “fearful”.",
      timelinessBody:
        "Uses Daily (end-of-day) prices (not real-time tick data). Results may be cached briefly (e.g., up to 60s).",
    },

    fx: {
      title: "FX Converter",
      from: "From",
      to: "To",
      amount: "Amount",
      convert: "Convert",
      tipTitle: "FX timeliness",
      tipBody:
        "FX rates are not real-time tick data. Providers often update on business days. This tool caches results briefly (e.g., up to 5 minutes).",
      providerLine: "Provider",
      cachedLine: "Cached",
      rateDate: "Rate date",
    },

    lang: {
      zh: "中文",
      en: "EN",
    },
  },

  zh: {
    brand: {
      name: "AntiFOMO",
      tagline1: "当市场恐惧时，我们准备。",
      tagline2: "当市场贪婪时，我们保护。",
    },

    input: {
      placeholder: "例如：SPY、QQQ、GLD、AAPL",
      check: "查询",
      loading: "加载中…",
      errorNoData: "没有返回数据。",
    },

    result: {
      index: "标的",
      score: "分数",
      peopleAre: "市场情绪",
      fearful: "恐惧",
      greedy: "贪婪",
      neutral: "中性",
      educationOnly: "仅用于学习交流，不构成投资建议。",
      timeliness:
        "实时性：基于日线（收盘价）计算，并为减少接口限流可能做短暂缓存。",
      cachedBadge: "缓存命中",
    },

    advice: {
      fear:
        "当前市场偏恐惧：建议分批准备、控制仓位与风险敞口，保持纪律，避免情绪化操作。",
      greed:
        "当前市场偏贪婪：建议更重视保护收益与风险控制，避免追涨式决策。",
      neutral:
        "当前情绪中性：按计划执行，少折腾，不要被短期波动牵着走。",
    },

    tooltip: {
      howTitle: "Fear & Greed 分数怎么算？",
      howBodyIntro: "这是一个 0–100 的情绪代理指标，来自三项加权信号：",
      how1: "RSI(14)：超买/超卖",
      how2: "趋势：价格相对 200 日均线",
      how3: "波动率：近期收益波动",
      intuition:
        "直觉：RSI 更高 + 趋势更强 + 波动更低 → 更偏“贪婪”；反之更偏“恐惧”。",
      timelinessBody:
        "使用日线（收盘价）而非秒级行情。为减少限流，结果可能短暂缓存（例如最多 60 秒）。",
    },

    fx: {
      title: "汇率换算",
      from: "从",
      to: "到",
      amount: "金额",
      convert: "换算",
      tipTitle: "汇率实时性",
      tipBody:
        "汇率并非秒级实时行情，数据源通常工作日更新。本工具会短暂缓存（例如最多 5 分钟）以减少请求。",
      providerLine: "数据源",
      cachedLine: "缓存",
      rateDate: "汇率日期",
    },

    lang: {
      zh: "中文",
      en: "EN",
    },
  },
} as const;

export function t(lang: Lang) {
  return COPY[lang];
}