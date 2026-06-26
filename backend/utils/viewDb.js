import dotenv from "dotenv";
import mongoose from "mongoose";
import AIAnalysis from "../models/AIAnalysis.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const analyses = await AIAnalysis.find().limit(5);
    console.log(JSON.stringify(analyses, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};
run();
