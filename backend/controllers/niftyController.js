import YahooFinance from "yahoo-finance2";
import { STOCKS } from "../config/stocks.js";
import { getCache, setCache } from "../utils/redisCache.js";

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
};

/**
 * Fetch 5-day daily close prices for sparklines safely
 */
const fetchSparklinePrices = async (symbol) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days of buffer

    const res = await yahooFinance.chart(symbol, {
      period1: Math.floor(oneWeekAgo.getTime() / 1000),
      period2: Math.floor(now.getTime() / 1000),
      interval: "1d",
    }).catch(() => null);

    if (res && res.quotes) {
      return res.quotes
        .filter((q) => q && q.close !== null && q.close !== undefined)
        .map((q) => q.close)
        .slice(-5); // Keep last 5 days
    }
    return [];
  } catch (error) {
    return [];
  }
};

/**
 * Get NIFTY 50 dashboard stock lists
 */
export const getNifty50Data = async (req, res) => {
  try {
    // 1. Try to read from Cache
    const cachedData = await getCache(CACHE_KEY);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    console.log("[Cache Miss] Fetching NIFTY 50 bulk metrics from Yahoo Finance...");

    // 2. Fetch bulk quotes for all 50 tickers in parallel
    const quotes = await yahooFinance.quote(STOCKS);
    if (!quotes || quotes.length === 0) {
      throw new Error("No quotes returned from Yahoo Finance");
    }

    // 3. Fetch sparkline daily closes for all tickers in parallel
    const sparklines = await Promise.all(
      STOCKS.map((symbol) => fetchSparklinePrices(symbol))
    );

    // Create a sparkline mapping
    const sparklineMap = {};
    STOCKS.forEach((symbol, index) => {
      sparklineMap[symbol] = sparklines[index] || [];
    });

    // 4. Construct enriched stock data
    const stockList = quotes
      .filter((q) => q && q.symbol)
      .map((q) => {
        const symbol = q.symbol;
        const cleanSymbol = symbol.replace(".NS", "");
        const sector = FALLBACK_SECTORS[symbol] || "N/A";
        const sparkline = sparklineMap[symbol] || [];

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
          sparkline, // Optional small sparkline data
        };
      });

    // 5. Store in Cache for 5 minutes
    await setCache(CACHE_KEY, stockList, CACHE_DURATION);

    return res.status(200).json(stockList);
  } catch (error) {
    console.error("[getNifty50Data Error]:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching Nifty 50 data",
    });
  }
};
