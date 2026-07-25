import { Router } from "express";
import { getNifty50Data } from "../controllers/niftyController.js";

const router = Router();

router.get("/", getNifty50Data);

export default router;
