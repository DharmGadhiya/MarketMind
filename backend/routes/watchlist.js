import { Router } from "express";
import mongoose from "mongoose";
import Watchlist from "../models/watchlist.js";
import Stock from "../models/stock.js";

const router = Router();

/**
 * Standardize symbol to end with ".NS" if it doesn't already.
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
 * POST /api/watchlist
 * Add a stock to the user's watchlist or update its alert threshold.
 */
router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  const { symbol, alertThreshold } = req.body;

  if (!symbol || alertThreshold === undefined || alertThreshold === null) {
    return res.status(400).json({ success: false, msg: "Symbol and alertThreshold are required." });
  }

  const thresholdNum = parseFloat(alertThreshold);
  if (isNaN(thresholdNum) || thresholdNum < 0) {
    return res.status(400).json({ success: false, msg: "alertThreshold must be a non-negative number." });
  }

  try {
    const formattedSymbol = standardizeSymbol(symbol);

    // Upsert: update alertThreshold (and reset lastAlertedAt so they get new alerts) if it already exists, otherwise create it
    const watchlistEntry = await Watchlist.findOneAndUpdate(
      { userId: req.user._id, symbol: formattedSymbol },
      { alertThreshold: thresholdNum, lastAlertedAt: null },
      { returnDocument: "after", upsert: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Watchlist updated successfully",
      data: watchlistEntry,
    });
  } catch (error) {
    console.error("[Watchlist POST Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to update watchlist." });
  }
});

/**
 * DELETE /api/watchlist/:symbol
 * Remove a stock from the user's watchlist.
 */
router.delete("/:symbol", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ success: false, msg: "Symbol is required." });
  }

  try {
    const formattedSymbol = standardizeSymbol(symbol);

    const deletedEntry = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      symbol: formattedSymbol,
    });

    if (!deletedEntry) {
      return res.status(404).json({ success: false, msg: "Stock is not in your watchlist." });
    }

    return res.status(200).json({
      success: true,
      msg: "Stock removed from watchlist successfully",
    });
  } catch (error) {
    console.error("[Watchlist DELETE Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to remove from watchlist." });
  }
});

/**
 * GET /api/watchlist
 * Retrieve the user's watchlist, joined with the latest stock price data.
 */
router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated. Please log in." });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);

    const watchlist = await Watchlist.aggregate([
      { $match: { userId: userObjectId } },
      {
        $lookup: {
          from: "stocks",
          localField: "symbol",
          foreignField: "symbol",
          as: "stockDetails",
        },
      },
      {
        $unwind: {
          path: "$stockDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          symbol: 1,
          alertThreshold: 1,
          lastAlertedAt: 1,
          name: { $ifNull: ["$stockDetails.name", "$symbol"] },
          cmp: { $ifNull: ["$stockDetails.cmp", 0] },
          changePercent: { $ifNull: ["$stockDetails.changePercent", 0] },
          marketState: { $ifNull: ["$stockDetails.marketState", "CLOSED"] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    console.error("[Watchlist GET Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to retrieve watchlist." });
  }
});

export default router;
