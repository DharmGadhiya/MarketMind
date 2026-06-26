import dotenv from "dotenv";
import mongoose from "mongoose";
import AIAnalysis from "../models/AIAnalysis.js";
import { logger } from "./helpers.js";

dotenv.config();

const cleanupExistingData = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL not found in environment variables");
    }

    logger.info("Connecting to MongoDB for data cleanup...");
    await mongoose.connect(mongoUrl);
    logger.info("Database connected. Scanning AIAnalysis collection...");

    const analyses = await AIAnalysis.find({});
    logger.info(`Found ${analyses.length} total AIAnalysis records to scan.`);

    const keys = ["valuation", "profitability", "growth", "financialHealth", "overallInterpretation"];
    let updatedCount = 0;

    for (const record of analyses) {
      let isModified = false;

      if (record.analysis && record.analysis.fundamentalAnalysis) {
        keys.forEach((key) => {
          const val = record.analysis.fundamentalAnalysis[key];
          if (typeof val === "string") {
            const lowerVal = val.trim().toLowerCase();
            
            // Check if the value contains any indicator of missing data
            if (
              lowerVal.includes("data not available") ||
              lowerVal.includes("not available") ||
              lowerVal.includes("no data available") ||
              lowerVal.includes("not provided") ||
              lowerVal.includes("cannot be conducted") ||
              lowerVal.includes("cannot be assessed") ||
              lowerVal.includes("cannot be evaluated") ||
              lowerVal === ""
            ) {
              // If it's not already exactly "Data Not Available", update it!
              if (record.analysis.fundamentalAnalysis[key] !== "Data Not Available") {
                logger.info(`Cleaning [${key}] in record [${record.uuid}] from: "${val}" -> "Data Not Available"`);
                record.analysis.fundamentalAnalysis[key] = "Data Not Available";
                record.markModified("analysis");
                isModified = true;
              }
            }
          } else if (val === undefined || val === null) {
            record.analysis.fundamentalAnalysis[key] = "Data Not Available";
            record.markModified("analysis");
            isModified = true;
          }
        });
      }

      if (isModified) {
        await record.save();
        updatedCount++;
      }
    }

    logger.info(`Data cleanup completed. Successfully updated and cleaned ${updatedCount} records.`);
    await mongoose.disconnect();
    logger.info("Database disconnected.");
  } catch (err) {
    logger.error(`Database cleanup failed: ${err.message}`);
    process.exit(1);
  }
};

cleanupExistingData();
