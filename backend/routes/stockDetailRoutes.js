import express from "express";
import { getStockDetails, getStockChart } from "../controllers/stockDetailController.js";

const router = express.Router();

// GET /api/stocks/:symbol
router.get("/:symbol", getStockDetails);

// GET /api/stocks/:symbol/chart
router.get("/:symbol/chart", getStockChart);

export default router;
