import cron from "node-cron";
import { runAIAnalysisPipeline } from "../services/analysis.service.js";
import { logger } from "../utils/helpers.js";

let isRunning = false;

// Default to running every 1 minute. Can be overridden via process.env.CRON_SCHEDULE
const schedule = process.env.CRON_SCHEDULE || "* * * * *";

/**
 * Initializes the scheduled cron job for processing AI News Analysis.
 * Employs a local lock (isRunning) to prevent overlapping pipeline execution.
 */
export const initAIAnalysisCron = () => {
  logger.info(`Initializing AI News Analysis Cron Job with schedule: "${schedule}"`);

  cron.schedule(schedule, async () => {
    if (isRunning) {
      logger.warn("AI Analysis Pipeline is already running. Skipping this execution interval to prevent overlaps.");
      return;
    }

    isRunning = true;
    try {
      logger.info("Cron job triggered: starting AI news analysis pipeline run.");
      await runAIAnalysisPipeline();
    } catch (err) {
      logger.error(`Cron job execution encountered an unhandled error: ${err.message}`);
    } finally {
      isRunning = false;
    }
  });
};
