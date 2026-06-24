import yahooFinance from "yahoo-finance2";
import Stock from "../models/stock.js";
import { STOCKS } from "../config/stocks.js";


/**
 * Fetch single stock safely with retry
 */
const fetchSingleStock = async (symbol, retries = 2) => {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      throw new Error(`No quote returned for ${symbol}`);
    }

    return {
      symbol,
      name: quote.shortName || quote.longName || symbol.replace(".NS", ""),
      cmp: quote.regularMarketPrice || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error(`[Yahoo Error] ${symbol}:`, error.message);

    // retry logic
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return fetchSingleStock(symbol, retries - 1);
    }

    return null;
  }
};

/**
 * Fetch all stocks (SAFE: sequential + delay)
 */
const fetchAllStocks = async () => {
  try {
    const results = [];

    for (const symbol of STOCKS) {
      const stock = await fetchSingleStock(symbol);

      if (stock) results.push(stock);

      // IMPORTANT: prevents Yahoo blocking
      await new Promise((r) => setTimeout(r, 700));
    }

    return results;
  } catch (error) {
    console.error("[Stock Fetch Error]", error.message);
    throw error;
  }
};

/**
 * Update MongoDB stock collection
 */
const updateStocks = async () => {
  try {
    console.log("Starting stock update:", new Date().toISOString());

    const stocks = await fetchAllStocks();

    if (!stocks.length) {
      throw new Error("No stock data received from Yahoo Finance");
    }

    const operations = stocks.map((stock) => ({
      updateOne: {
        filter: { symbol: stock.symbol },
        update: { $set: stock },
        upsert: true,
      },
    }));

    const result = await Stock.bulkWrite(operations);

    console.log(
      `Stock update completed. Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`,
    );

    return {
      success: true,
      totalStocks: stocks.length,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
    };
  } catch (error) {
    console.error("[Mongo Update Error]", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};

export { updateStocks, fetchAllStocks };
