import YahooFinance from "yahoo-finance2";
import { getCache, setCache } from "../utils/redisCache.js";
import fs from "fs";
import path from "path";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

/**
 * Format symbols to have .NS for Indian stocks if they don't have any suffix.
 */
const formatSymbol = (symbol) => {
  if (!symbol) return "";
  const upperSymbol = symbol.toUpperCase();
  // If there's no dot (e.g. RELIANCE, TCS), append .NS for Indian markets
  if (!upperSymbol.includes(".")) {
    return `${upperSymbol}.NS`;
  }
  return upperSymbol;
};

/**
 * Get stock detailed information
 * GET /api/stocks/:symbol
 */
export const getStockDetails = async (req, res) => {
  try {
    const rawSymbol = req.params.symbol;
    if (!rawSymbol) {
      return res.status(400).json({ success: false, error: "Symbol is required" });
    }

    const formattedSymbol = formatSymbol(rawSymbol);
    const cacheKey = `stock:detail:${formattedSymbol}`;

    // Try to get from Redis cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Details for ${formattedSymbol}`);
      return res.status(200).json(cachedData);
    }

    console.log(`[Cache Miss] Fetching details for ${formattedSymbol} from Yahoo Finance`);
    
    // Fetch quote and quoteSummary in parallel
    const [quote, quoteSummary] = await Promise.all([
      yahooFinance.quote(formattedSymbol).catch((err) => {
        console.error(`[Yahoo Quote Error] for ${formattedSymbol}:`, err.message);
        return null;
      }),
      yahooFinance.quoteSummary(formattedSymbol, {
        modules: ["assetProfile", "financialData", "summaryDetail", "defaultKeyStatistics"]
      }).catch((err) => {
        console.error(`[Yahoo QuoteSummary Error] for ${formattedSymbol}:`, err.message);
        return null;
      })
    ]);

    if (!quote && !quoteSummary) {
      return res.status(404).json({
        success: false,
        error: `Could not retrieve data for symbol ${rawSymbol}`
      });
    }

    // Prepare response data with safe fallbacks to "N/A"
    const data = {
      companyName: quote?.longName || quote?.shortName || rawSymbol.toUpperCase(),
      symbol: rawSymbol.toUpperCase(), // return clean symbol as requested

      sector: quoteSummary?.assetProfile?.sector || "N/A",
      industry: quoteSummary?.assetProfile?.industry || "N/A",
      description: quoteSummary?.assetProfile?.longBusinessSummary || "N/A",

      currentPrice: quote?.regularMarketPrice ?? quoteSummary?.financialData?.currentPrice ?? "N/A",
      priceChange: quote?.regularMarketChange ?? "N/A",
      percentChange: quote?.regularMarketChangePercent ?? "N/A",

      previousClose: quote?.regularMarketPreviousClose ?? quoteSummary?.summaryDetail?.previousClose ?? "N/A",
      open: quote?.regularMarketOpen ?? quoteSummary?.summaryDetail?.open ?? "N/A",

      dayHigh: quote?.regularMarketDayHigh ?? quoteSummary?.summaryDetail?.dayHigh ?? "N/A",
      dayLow: quote?.regularMarketDayLow ?? quoteSummary?.summaryDetail?.dayLow ?? "N/A",

      fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh ?? quoteSummary?.summaryDetail?.fiftyTwoWeekHigh ?? "N/A",
      fiftyTwoWeekLow: quote?.fiftyTwoWeekLow ?? quoteSummary?.summaryDetail?.fiftyTwoWeekLow ?? "N/A",

      volume: quote?.regularMarketVolume ?? quoteSummary?.summaryDetail?.volume ?? "N/A",

      marketCap: quote?.marketCap ?? quoteSummary?.summaryDetail?.marketCap ?? "N/A",

      pe: quote?.trailingPE ?? quoteSummary?.summaryDetail?.trailingPE ?? "N/A",
      forwardPE: quote?.forwardPE ?? quoteSummary?.defaultKeyStatistics?.forwardPE ?? quoteSummary?.summaryDetail?.forwardPE ?? "N/A",

      pb: quote?.priceToBook ?? quoteSummary?.defaultKeyStatistics?.priceToBook ?? "N/A",

      peg: quoteSummary?.defaultKeyStatistics?.pegRatio ?? "N/A",

      eps: quote?.epsTrailingTwelveMonths ?? quoteSummary?.defaultKeyStatistics?.trailingEps ?? "N/A",
      forwardEPS: quote?.epsForward ?? quoteSummary?.defaultKeyStatistics?.forwardEps ?? "N/A",

      roe: quoteSummary?.financialData?.returnOnEquity ?? "N/A",
      roa: quoteSummary?.financialData?.returnOnAssets ?? "N/A",

      dividendYield: quote?.dividendYield ?? quoteSummary?.summaryDetail?.dividendYield ?? "N/A",

      bookValue: quote?.bookValue ?? quoteSummary?.defaultKeyStatistics?.bookValue ?? "N/A",

      revenue: quoteSummary?.financialData?.totalRevenue ?? "N/A",
      netIncome: quoteSummary?.defaultKeyStatistics?.netIncomeToCommon ?? "N/A"
    };

    // Cache the result in Redis for 5 minutes (300 seconds)
    await setCache(cacheKey, data, 300);

    return res.status(200).json(data);
  } catch (error) {
    console.error("[getStockDetails Error]:", error.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Get stock historical chart data
 * GET /api/stocks/:symbol/chart
 * Query Params: range (1d, 5d, 1mo, 3mo, 6mo, 1y, 3y, 5y)
 */
export const getStockChart = async (req, res) => {
  try {
    const rawSymbol = req.params.symbol;
    if (!rawSymbol) {
      return res.status(400).json({ success: false, error: "Symbol is required" });
    }

    const range = req.query.range || "1d";
    const formattedSymbol = formatSymbol(rawSymbol);
    const cacheKey = `stock:chart:${formattedSymbol}:${range}`;

    // Try to get from Redis cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Chart for ${formattedSymbol} [${range}]`);
      return res.status(200).json(cachedData);
    }

    console.log(`[Cache Miss] Fetching chart for ${formattedSymbol} [${range}] from Yahoo Finance`);

    // Determine interval and date range (period1, period2)
    const now = new Date();
    let period1;
    let interval = "1d";

    switch (range) {
      case "1d":
        // Last 2 days of 2-minute interval to ensure we cover the full current trading session
        period1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        interval = "2m";
        break;
      case "5d":
        // Last 7 days to cover weekends
        period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = "15m";
        break;
      case "1mo":
        period1 = new Date();
        period1.setMonth(now.getMonth() - 1);
        interval = "1d";
        break;
      case "3mo":
        period1 = new Date();
        period1.setMonth(now.getMonth() - 3);
        interval = "1d";
        break;
      case "6mo":
        period1 = new Date();
        period1.setMonth(now.getMonth() - 6);
        interval = "1d";
        break;
      case "1y":
        period1 = new Date();
        period1.setFullYear(now.getFullYear() - 1);
        interval = "1d";
        break;
      case "3y":
        period1 = new Date();
        period1.setFullYear(now.getFullYear() - 3);
        interval = "1d";
        break;
      case "5y":
        period1 = new Date();
        period1.setFullYear(now.getFullYear() - 5);
        interval = "1wk";
        break;
      default:
        period1 = new Date();
        period1.setMonth(now.getMonth() - 1);
        interval = "1d";
    }

    const chartRes = await yahooFinance.chart(formattedSymbol, {
      period1,
      period2: now,
      interval
    }).catch((err) => {
      console.error(`[Yahoo Chart Error] for ${formattedSymbol} [${range}]:`, err.message);
      return null;
    });

    if (!chartRes || !chartRes.quotes || chartRes.quotes.length === 0) {
      return res.status(200).json([]); // Return empty list as requested
    }

    // Filter out null/undefined values and map to the required structure
    const formattedQuotes = chartRes.quotes
      .filter((q) => q && q.open !== null && q.open !== undefined && q.close !== null && q.close !== undefined)
      .map((q) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000), // Unix timestamp in seconds
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume || 0,
      }));

    // Cache the result in Redis for 5 minutes (300 seconds)
    await setCache(cacheKey, formattedQuotes, 300);

    return res.status(200).json(formattedQuotes);
  } catch (error) {
    console.error("[getStockChart Error]:", error.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Search stocks from EQUITY_L.csv
 * GET /api/stocks/search
 */
export const searchStocks = async (req, res) => {
  const query = (req.query.query || "").trim().toLowerCase();
  if (!query) {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    const filePath = path.resolve("Logic Files", "EQUITY_L.csv");
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ success: false, error: "Stock database (EQUITY_L.csv) not found" });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
    
    const matches = [];
    
    // Custom CSV parser to handle quotes and commas in company names
    const parseCSVLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Start from line 1 to skip header
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length >= 2) {
        const symbol = parts[0].trim();
        const companyName = parts[1].trim();
        
        if (symbol.toLowerCase().includes(query) || companyName.toLowerCase().includes(query)) {
          matches.push({ symbol, name: companyName });
        }
        
        if (matches.length >= 10) {
          break; // Limit to 10 suggestions for performance
        }
      }
    }
    
    return res.status(200).json({ success: true, data: matches });
  } catch (err) {
    console.error("Error searching EQUITY_L.csv:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
