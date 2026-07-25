import express from "express";
import dotenv from "dotenv";
import CORS from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import checkForAuthenticationCookie from "./middlewares/auth.js";
import newsRouter from "./routes/news.js";
import stockRouter from "./routes/stockRoutes.js";
import stockDetailRouter from "./routes/stockDetailRoutes.js";
import userRouter from "./routes/user.js";
import { initAIAnalysisCron } from "./cron/aiAnalysis.cron.js";

const app = express();


const PORT = process.env.PORT || 8000;



mongoose
  .connect(process.env.MONGO_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("DB connected");
    initAIAnalysisCron(); // Initialize the background AI analysis scheduler
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
      
      // Check if origin matches any of the common local dev servers or localhost wildcards
      const isLocal = allowedOrigins.includes(origin) || 
                      origin.startsWith("http://localhost:") || 
                      origin.startsWith("http://127.0.0.1:");
                      
      if (isLocal) {
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
app.use("/api/stocks", stockDetailRouter);
app.use("/stocks", stockRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
