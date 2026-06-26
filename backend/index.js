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
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
    initAIAnalysisCron(); // Initialize the background AI analysis scheduler
  })
  .catch((err) => {
    console.log("DB connection failed");
  });

app.use(
  CORS({
    origin: "https://marketmind-zjuo.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("Token"));

app.use("/api", newsRouter);
app.use("/api/user", userRouter);
app.use("/stocks", stockRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
