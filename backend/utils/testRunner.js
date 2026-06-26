import dotenv from "dotenv";
import mongoose from "mongoose";
import { runAIAnalysisPipeline } from "../services/analysis.service.js";
import { logger } from "./helpers.js";

// Load environment variables from the parent directory where the .env resides
dotenv.config();

const runTest = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL not found in environment variables");
    }

    logger.info("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    logger.info("Database connected. Starting AI news analysis pipeline manually...");
    
    // Execute the core analysis pipeline
    await runAIAnalysisPipeline();
    
    logger.info("Manual pipeline execution completed successfully. Disconnecting database...");
    await mongoose.disconnect();
    logger.info("Database disconnected.");
  } catch (err) {
    logger.error(`Manual test runner failed with error: ${err.message}`);
    process.exit(1);
  }
};

runTest();
