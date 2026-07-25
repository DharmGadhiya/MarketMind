import express from "express";
import { getStockDetails, getStockChart, searchStocks } from "../controllers/stockDetailController.js";

const router = express.Router();

// GET /api/stocks/search (Must be defined before wildcard parameter)
router.get("/search", searchStocks);

// GET /api/stocks/:symbol
router.get("/:symbol", getStockDetails);

// GET /api/stocks/:symbol/chart
router.get("/:symbol/chart", getStockChart);

export default router;
