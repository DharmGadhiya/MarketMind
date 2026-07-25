import express from "express";
import dotenv from "dotenv";
import CORS from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dns from "dns";
import { spawn } from "child_process";
import path from "path";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import checkForAuthenticationCookie from "./middlewares/auth.js";
import newsRouter from "./routes/news.js";
import stockRouter from "./routes/stockRoutes.js";
import stockDetailRouter from "./routes/stockDetailRoutes.js";
import userRouter from "./routes/user.js";
import watchlistRouter from "./routes/watchlist.js";
import notificationRouter from "./routes/notification.js";
import holdingRouter from "./routes/holding.js";
import ipoRouter from "./routes/ipoRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";
import niftyRouter from "./routes/niftyRoutes.js";
import indicesRouter from "./routes/indicesRoutes.js";
import { initAIAnalysisCron } from "./cron/aiAnalysis.cron.js";

const app = express();


const PORT = process.env.PORT || 8000;



mongoose
  .connect(process.env.MONGO_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log("DB connected");
    initAIAnalysisCron(); // Initialize the background AI analysis scheduler

    // Load custom stock symbols from database holdings/watchlists on startup
    try {
      const Holding = mongoose.model("Holding");
      const Watchlist = mongoose.model("Watchlist");
      const { addStockSymbol } = await import("./config/stocks.js");
      
      const [holdingSymbols, watchlistSymbols] = await Promise.all([
        Holding.distinct("symbol"),
        Watchlist.distinct("symbol")
      ]);
      
      const allDbSymbols = [...new Set([...holdingSymbols, ...watchlistSymbols])];
      let loadedCount = 0;
      allDbSymbols.forEach(symbol => {
        if (symbol) {
          addStockSymbol(symbol);
          loadedCount++;
        }
      });
      if (loadedCount > 0) {
        console.log(`[Startup] Loaded ${loadedCount} custom stock symbols from DB into active watchlists.`);
      }
    } catch (dbErr) {
      console.warn("[Startup] Failed to load custom stock symbols from database:", dbErr.message);
    }
  })
  .catch((err) => {
    console.log("DB connection failed: ", err);
  });

app.use(
  CORS({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
      ];
      
      // Check if origin matches any of the common local dev servers, vercel domains, or custom FRONTEND_URL env var
      const frontendUrl = process.env.FRONTEND_URL;
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.startsWith("http://localhost:") || 
                        origin.startsWith("http://127.0.0.1:") ||
                        origin.endsWith(".vercel.app") ||
                        origin.endsWith(".onrender.com") ||
                        (frontendUrl && origin === frontendUrl);
                      
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("Token"));

app.get("/", (req, res) => {
  res.status(200).send("MarketMind Server Active");
});

app.use("/api", newsRouter);
app.use("/api/user", userRouter);
app.use("/api/watchlist", watchlistRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/holdings", holdingRouter);
app.use("/api/stocks", stockDetailRouter);
app.use("/stocks", stockRouter);
app.use("/api", ipoRouter);
app.use("/api", announcementRouter);
app.use("/api/nifty50", niftyRouter);
app.use("/api/indices", indicesRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

  // Start the Python scrapers in the background only in local development
  if (process.env.NODE_ENV !== "production") {
    try {
      const scriptPath = path.resolve("Logic Files", "ipo_listing.py");
      console.log(`[Scraper] Spawning background IPO scraper at ${scriptPath}...`);
      const scraperProcess = spawn("python", [scriptPath], {
        detached: true,
        stdio: "ignore",
      });
      scraperProcess.unref();
      console.log("[Scraper] Background IPO scraper process spawned successfully.");
    } catch (err) {
      console.error("[Scraper] Failed to start background IPO scraper:", err);
    }

    // Start the Python Corporate Announcements scraper in the background
    try {
      const scriptPath = path.resolve("Logic Files", "corporate_announcements.py");
      console.log(`[Scraper] Spawning background Announcements scraper at ${scriptPath}...`);
      const scraperProcess = spawn("python", [scriptPath], {
        detached: true,
        stdio: "ignore",
      });
      scraperProcess.unref();
      console.log("[Scraper] Background Announcements scraper process spawned successfully.");
    } catch (err) {
      console.error("[Scraper] Failed to start background Announcements scraper:", err);
    }
  }
});
