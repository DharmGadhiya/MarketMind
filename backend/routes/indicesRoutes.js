import { Router } from "express";
import YahooFinance from "yahoo-finance2";
import { getCache, setCache } from "../utils/redisCache.js";

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

router.get("/", async (req, res) => {
  const cacheKey = "all_indian_indices_v2";
  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    // Fetch quotes in bulk
    const quotes = await yahooFinance.quote(TICKER_KEYS);
    
    // Fetch 7 days of 15m data to capture the last complete active day's intraday trend
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const chartPromises = TICKER_KEYS.map(ticker => 
      yahooFinance.chart(ticker, {
        period1: Math.floor(sevenDaysAgo.getTime() / 1000),
        period2: Math.floor(now.getTime() / 1000),
        interval: "15m"
      }).catch(() => null)
    );
    
    const charts = await Promise.all(chartPromises);
    
    const enrichedIndices = quotes.map((q, index) => {
      if (!q) return null;
      
      const ticker = q.symbol;
      const name = INDICES_TICKERS[ticker] || q.shortName || ticker;
      
      const chartRes = charts[index];
      let history = [];
      if (chartRes && chartRes.quotes) {
        // Filter valid quotes and slice last 25 quotes (corresponds to ~6.25 trading hours of the last active day)
        const validQuotes = chartRes.quotes.filter(quote => quote && quote.close !== null && quote.close !== undefined);
        history = validQuotes.slice(-25).map(quote => ({
          time: Math.floor(new Date(quote.date).getTime() / 1000), // Unix timestamp in seconds
          close: quote.close
        }));
      }
      
      return {
        symbol: ticker,
        name: name,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        high: q.regularMarketDayHigh ?? 0,
        low: q.regularMarketDayLow ?? 0,
        history
      };
    }).filter(Boolean);
    
    await setCache(cacheKey, enrichedIndices, 120); // Cache for 2 minutes
    
    return res.status(200).json({ success: true, data: enrichedIndices });
  } catch (err) {
    console.error("Error fetching indices:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
