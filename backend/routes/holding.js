import { Router } from "express";
import Holding from "../models/holding.js";
import Stock from "../models/stock.js";
import { addStockSymbol } from "../config/stocks.js";
import { fetchSingleStock } from "../services/stockService.js";

const router = Router();

/**
 * Standardize stock symbol to end with ".NS" if it doesn't already.
 * 
 * @param {string} symbol - Stock symbol (e.g. "RELIANCE" or "RELIANCE.NS")
 * @returns {string} Standardized stock symbol (e.g. "RELIANCE.NS")
 */
const standardizeSymbol = (symbol) => {
  if (!symbol) return "";
  const upper = symbol.trim().toUpperCase();
  return upper.endsWith(".NS") ? upper : `${upper}.NS`;
};

/**
 * POST /api/holdings
 * Add a new stock holding trade entry.
 */
router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  const { symbol, buyPrice, qty } = req.body;

  if (!symbol || buyPrice === undefined || qty === undefined) {
    return res.status(400).json({ success: false, msg: "symbol, buyPrice, and qty are required." });
  }

  const parsedBuyPrice = parseFloat(buyPrice);
  const parsedQty = parseFloat(qty);

  if (isNaN(parsedBuyPrice) || parsedBuyPrice <= 0) {
    return res.status(400).json({ success: false, msg: "buyPrice must be a positive number." });
  }

  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ success: false, msg: "qty must be a positive number." });
  }

  try {
    const formattedSymbol = standardizeSymbol(symbol);

    const holding = new Holding({
      userId: req.user._id,
      symbol: formattedSymbol,
      buyPrice: parsedBuyPrice,
      qty: parsedQty,
    });

    await holding.save();

    // Dynamically register the stock symbol for live updates if not already present
    addStockSymbol(formattedSymbol);

    // Fetch the single stock quote immediately and cache it in the Stock collection
    try {
      const stockQuote = await fetchSingleStock(formattedSymbol);
      if (stockQuote) {
        await Stock.updateOne(
          { symbol: formattedSymbol },
          { $set: stockQuote },
          { upsert: true }
        );
      }
    } catch (fetchErr) {
      console.warn(`[Holding Post] Immediate price fetch failed for ${formattedSymbol}:`, fetchErr.message);
    }

    return res.status(201).json({
      success: true,
      data: holding,
    });
  } catch (error) {
    console.error("[Holding POST Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to create holding." });
  }
});

/**
 * GET /api/holdings
 * Retrieve all holdings for the authenticated user joined with live price data.
 */
router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  try {
    const holdings = await Holding.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

    // Extract unique symbols to fetch from the Stock collection
    const symbols = [...new Set(holdings.map((h) => h.symbol))];
    const stocks = await Stock.find({ symbol: { $in: symbols } }).lean();

    // Map stocks by symbol for easy lookup
    const stockMap = new Map(stocks.map((s) => [s.symbol, s]));

    let totalInvested = 0;
    let totalCurrentValue = 0;

    const enrichedHoldings = holdings.map((h) => {
      const stock = stockMap.get(h.symbol);
      const cmp = stock && typeof stock.cmp === "number" ? stock.cmp : null;
      const name = stock && stock.name ? stock.name : h.symbol.replace(".NS", "");

      let pnl = null;
      let pnlPercent = null;
      const invested = h.buyPrice * h.qty;
      totalInvested += invested;

      if (cmp !== null) {
        pnl = (cmp - h.buyPrice) * h.qty;
        pnlPercent = ((cmp - h.buyPrice) / h.buyPrice) * 100;
        totalCurrentValue += cmp * h.qty;
      } else {
        // If live price is not available yet, treat the current value equal to invested cost
        // so overall totals don't show distorted gains or losses.
        totalCurrentValue += invested;
      }

      return {
        _id: h._id,
        symbol: h.symbol,
        name,
        buyPrice: h.buyPrice,
        qty: h.qty,
        cmp,
        pnl,
        pnlPercent,
        createdAt: h.createdAt,
      };
    });

    const totalPnl = totalCurrentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: enrichedHoldings,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalPnl,
        totalPnlPercent,
      },
    });
  } catch (error) {
    console.error("[Holding GET Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to retrieve holdings." });
  }
});

/**
 * PUT /api/holdings/:id
 * Edit an existing holding trade entry.
 */
router.put("/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  const { id } = req.params;
  const { buyPrice, qty } = req.body;

  if (buyPrice === undefined || qty === undefined) {
    return res.status(400).json({ success: false, msg: "buyPrice and qty are required." });
  }

  const parsedBuyPrice = parseFloat(buyPrice);
  const parsedQty = parseFloat(qty);

  if (isNaN(parsedBuyPrice) || parsedBuyPrice <= 0) {
    return res.status(400).json({ success: false, msg: "buyPrice must be a positive number." });
  }

  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ success: false, msg: "qty must be a positive number." });
  }

  try {
    const updatedHolding = await Holding.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { buyPrice: parsedBuyPrice, qty: parsedQty },
      { new: true }
    );

    if (!updatedHolding) {
      return res.status(404).json({ success: false, msg: "Holding not found or not owned by user." });
    }

    return res.status(200).json({
      success: true,
      data: updatedHolding,
    });
  } catch (error) {
    console.error("[Holding PUT Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to update holding." });
  }
});

/**
 * DELETE /api/holdings/:id
 * Remove a specific holding trade entry.
 */
router.delete("/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  const { id } = req.params;

  try {
    const deletedHolding = await Holding.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deletedHolding) {
      return res.status(404).json({ success: false, msg: "Holding not found or not owned by user." });
    }

    return res.status(200).json({
      success: true,
      msg: "Holding removed successfully.",
    });
  } catch (error) {
    console.error("[Holding DELETE Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to remove holding." });
  }
});

export default router;
