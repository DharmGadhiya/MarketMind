import { Router } from "express";
import YahooFinance from "yahoo-finance2";
import { getCache, setCache, getLastKnownCache } from "../utils/redisCache.js";

const router = Router();
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const INDICES_TICKERS = {
  "^NSEI": "Nifty 50",
  "^BSESN": "SENSEX",
  "^NSEBANK": "Nifty Bank",
  "^CNXIT": "Nifty IT",
  "^CNXPHARMA": "Nifty Pharma",
  "^CNXFMCG": "Nifty FMCG",
  "^CNXMETAL": "Nifty Metal",
  "^CNXAUTO": "Nifty Auto",
  "^CNXENERGY": "Nifty Energy",
  "^CNXINFRA": "Nifty Infra",
};

const TICKER_KEYS = Object.keys(INDICES_TICKERS);

/**
 * GET /api/indices
 * 100% Live indices quotes and intraday charts from Yahoo Finance
 */
router.get("/", async (req, res) => {
  const cacheKey = "all_indian_indices_v2";
  try {
    // 1. Check Cache first (in-memory / Redis)
    const cached = await getCache(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return res.status(200).json({ success: true, data: cached });
    }

    // 2. Fetch live quotes in bulk from Yahoo Finance
    let quotes = null;
    try {
      quotes = await yahooFinance.quote(TICKER_KEYS);
    } catch (yahooErr) {
      console.warn("[Indices] Yahoo Finance quote rate-limited/failed:", yahooErr.message);
    }

    if (!quotes || !Array.isArray(quotes) || quotes.length === 0) {
      // If temporarily rate-limited, serve the last real cached quotes
      const lastKnown = getLastKnownCache(cacheKey);
      if (lastKnown && Array.isArray(lastKnown) && lastKnown.length > 0) {
        console.log("[Indices] Serving last real cached Yahoo Finance quotes during temporary rate-limit.");
        return res.status(200).json({ success: true, data: lastKnown });
      }

      return res.status(503).json({
        success: false,
        error: "Indices data temporarily unavailable from Yahoo Finance. Please retry in a moment.",
      });
    }

    // 3. Fetch real intraday chart history safely with individual error handling
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const chartPromises = TICKER_KEYS.map((ticker) =>
      yahooFinance
        .chart(ticker, {
          period1: Math.floor(sevenDaysAgo.getTime() / 1000),
          period2: Math.floor(now.getTime() / 1000),
          interval: "15m",
        })
        .catch(() => null)
    );

    const charts = await Promise.all(chartPromises);

    // 4. Map 100% real live data fields directly from Yahoo Finance quotes & charts
    const enrichedIndices = quotes
      .map((q, index) => {
        if (!q) return null;

        const ticker = q.symbol;
        const name = INDICES_TICKERS[ticker] || q.shortName || ticker;
        const currentPrice = q.regularMarketPrice ?? 0;
        const change = q.regularMarketChange ?? 0;

        const chartRes = charts[index];
        let history = [];
        if (chartRes && chartRes.quotes) {
          const validQuotes = chartRes.quotes.filter(
            (quote) => quote && quote.close !== null && quote.close !== undefined
          );
          history = validQuotes.slice(-25).map((quote) => ({
            time: Math.floor(new Date(quote.date).getTime() / 1000),
            close: quote.close,
          }));
        }

        return {
          symbol: ticker,
          name,
          price: currentPrice,
          change,
          changePercent: q.regularMarketChangePercent ?? 0,
          high: q.regularMarketDayHigh ?? currentPrice,
          low: q.regularMarketDayLow ?? currentPrice,
          history,
        };
      })
      .filter(Boolean);

    if (enrichedIndices.length > 0) {
      await setCache(cacheKey, enrichedIndices, 300); // Cache for 5 minutes
      return res.status(200).json({ success: true, data: enrichedIndices });
    }

    return res.status(500).json({ success: false, error: "Failed to parse indices from Yahoo Finance." });
  } catch (err) {
    console.error("[Indices Error]:", err.message);
    const lastKnown = getLastKnownCache(cacheKey);
    if (lastKnown) {
      return res.status(200).json({ success: true, data: lastKnown });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
