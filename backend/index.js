import express from "express";
import dotenv from "dotenv";
import CORS from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import checkForAuthenticationCookie from "./middlewares/auth.js";
import newsRouter from "./routes/news.js";
import stockRouter from "./routes/stockRoutes.js";



const app = express();


const PORT = 8000 || process.env.PORT;



mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
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

app.use("/api", newsRouter);
app.use("/stocks", stockRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
