import express from "express";
import dotenv from "dotenv";
import CORS from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import checkForAuthenticationCookie from "./middlewares/auth.js";
import newsRouter from "./routes/news.js";
import stockRouter from "./routes/stockRoutes.js";
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
    console.log("DB connection failed");
  });

app.use(
  CORS({
    origin: "http://localhost:5173",
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
app.use("/stocks", stockRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
