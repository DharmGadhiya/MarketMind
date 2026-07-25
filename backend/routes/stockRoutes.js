import express from "express";
import Stock from "../models/stock.js";
import { updateStocks } from "../services/stockService.js";
import { checkWatchlistAlerts } from "../services/watchlistAlert.service.js";
import cron from "node-cron";

const router = express.Router();

/**
 * Manual update trigger
 */
router.get("/update", async (req, res) => {
  try {
    const result = await updateStocks();

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get all stocks
 */
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find()
      .sort({ symbol: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Automatically update stock prices in the background every 2 minutes
cron.schedule("*/1 * * * *", async () => {
  try {
    console.log("[Scheduled Stock Update] Starting background update...");
    const result = await updateStocks();
    if (result && result.success) {
      await checkWatchlistAlerts();
    }
  } catch (error) {
    console.error("[Scheduled Stock Update Error] Failed:", error.message);
  }
});

export default router;