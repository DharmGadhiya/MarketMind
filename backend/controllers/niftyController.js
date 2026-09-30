import YahooFinance from "yahoo-finance2";
import { STOCKS } from "../config/stocks.js";
import { getCache, setCache, getLastKnownCache } from "../utils/redisCache.js";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const CACHE_KEY = "nifty50_dashboard_data_v2";
const CACHE_DURATION = 300; // 5 minutes in seconds

const FALLBACK_SECTORS = {
  "ADANIENT.NS": "Industrials",
  "ADANIPORTS.NS": "Industrials",
  "APOLLOHOSP.NS": "Healthcare",
  "ASIANPAINT.NS": "Consumer Defensive",
  "AXISBANK.NS": "Financial Services",
  "BAJAJ-AUTO.NS": "Consumer Cyclical",
  "BAJFINANCE.NS": "Financial Services",
  "BAJAJFINSV.NS": "Financial Services",
  "BEL.NS": "Industrials",
  "BPCL.NS": "Energy",
  "BHARTIARTL.NS": "Communication Services",
  "BRITANNIA.NS": "Consumer Defensive",
  "CIPLA.NS": "Healthcare",
  "COALINDIA.NS": "Energy",
  "DRREDDY.NS": "Healthcare",
  "EICHERMOT.NS": "Consumer Cyclical",
  "GRASIM.NS": "Basic Materials",
  "HCLTECH.NS": "Technology",
  "HDFCBANK.NS": "Financial Services",
  "HDFCLIFE.NS": "Financial Services",
  "HEROMOTOCO.NS": "Consumer Cyclical",
  "HINDALCO.NS": "Basic Materials",
  "HINDUNILVR.NS": "Consumer Defensive",
  "ICICIBANK.NS": "Financial Services",
  "ITC.NS": "Consumer Defensive",
  "INDUSINDBK.NS": "Financial Services",
  "INFY.NS": "Technology",
  "JSWSTEEL.NS": "Basic Materials",
  "KOTAKBANK.NS": "Financial Services",
  "LT.NS": "Industrials",
  "M&M.NS": "Consumer Cyclical",
  "MARUTI.NS": "Consumer Cyclical",
  "NESTLEIND.NS": "Consumer Defensive",
  "NTPC.NS": "Utilities",
  "ONGC.NS": "Energy",
  "POWERGRID.NS": "Utilities",
  "RELIANCE.NS": "Energy",
  "SBILIFE.NS": "Financial Services",
  "SBIN.NS": "Financial Services",
  "SUNPHARMA.NS": "Healthcare",
  "TATACONSUM.NS": "Consumer Defensive",
  "TMPV.NS": "Consumer Cyclical",
  "TMCV.NS": "Consumer Cyclical",
  "TATASTEEL.NS": "Basic Materials",
  "TCS.NS": "Technology",
  "TECHM.NS": "Technology",
  "TITAN.NS": "Consumer Cyclical",
  "ULTRACEMCO.NS": "Basic Materials",
  "WIPRO.NS": "Technology",
  "TRENT.NS": "Consumer Cyclical",
  "AMRUTANJAN.NS": "Healthcare",
  "ETERNAL.NS": "Consumer Cyclical",
  "IDEA.NS": "Communication Services",
  "IDFCFIRSTB.NS": "Financial Services",
  "IRFC.NS": "Financial Services",
  "MOTHERSON.NS": "Consumer Cyclical",
  "BAJAJHFL.NS": "Financial Services",
  "ADVANCE.NS": "Basic Materials",
  "BANKBARODA.NS": "Financial Services",
  "JIOFIN.NS": "Financial Services",
  "TRIDENT.NS": "Consumer Cyclical",
};

/**
 * Get NIFTY 50 dashboard stock lists
 * 100% Live data from Yahoo Finance
 */
export const getNifty50Data = async (req, res) => {
  try {
    // 1. Check Cache (in-memory / Redis) to avoid hammering Yahoo Finance
    const cachedData = await getCache(CACHE_KEY);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      return res.status(200).json(cachedData);
    }

    console.log("[Cache Miss] Fetching live NIFTY 50 quotes from Yahoo Finance...");

    // 2. Fetch live quotes in bulk from Yahoo Finance
    let quotes = null;
    try {
      quotes = await yahooFinance.quote(STOCKS);
    } catch (yahooErr) {
      console.warn("[Yahoo Finance 429/Rate-Limit]:", yahooErr.message);
    }

    // 3. If Yahoo Finance temporarily rate-limits, serve last known real cached quotes
    if (!quotes || !Array.isArray(quotes) || quotes.length === 0) {
      const lastKnown = getLastKnownCache(CACHE_KEY);
      if (lastKnown && Array.isArray(lastKnown) && lastKnown.length > 0) {
        console.log("[Nifty50] Serving last real cached Yahoo Finance quotes during temporary rate-limit.");
        return res.status(200).json(lastKnown);
      }

      return res.status(503).json({
        success: false,
        error: "Yahoo Finance is temporarily rate-limiting requests. Please refresh in a moment.",
      });
    }

    // 4. Map 100% real live data fields directly from Yahoo Finance quote
    const stockList = quotes
      .filter((q) => q && q.symbol)
      .map((q) => {
        const symbol = q.symbol;
        const cleanSymbol = symbol.replace(".NS", "");
        const sector = FALLBACK_SECTORS[symbol] || "N/A";

        return {
          companyName: q.longName || q.shortName || cleanSymbol,
          symbol: cleanSymbol,
          sector,
          currentPrice: q.regularMarketPrice ?? "N/A",
          priceChange: q.regularMarketChange ?? "N/A",
          percentChange: q.regularMarketChangePercent ?? "N/A",
          marketCap: q.marketCap ?? "N/A",
          volume: q.regularMarketVolume ?? "N/A",
          dayHigh: q.regularMarketDayHigh ?? "N/A",
          dayLow: q.regularMarketDayLow ?? "N/A",
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? "N/A",
          fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? "N/A",
          sparkline: [],
        };
      });

    // 5. Cache the real live quotes for 5 minutes
    if (stockList.length > 0) {
      await setCache(CACHE_KEY, stockList, CACHE_DURATION);
      return res.status(200).json(stockList);
    }

    return res.status(500).json({
      success: false,
      error: "No stock quotes could be parsed from Yahoo Finance.",
    });
  } catch (error) {
    console.error("[getNifty50Data Error]:", error.message);
    const lastKnown = getLastKnownCache(CACHE_KEY);
    if (lastKnown) {
      return res.status(200).json(lastKnown);
    }
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
