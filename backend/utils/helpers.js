/**
 * Robust JSON extraction and parsing utility.
 * Strips markdown code fences (e.g., ```json ... ```) and extracts
 * the raw JSON object string to ensure reliable parsing.
 * 
 * @param {string} rawText - The raw string returned by the LLM.
 * @returns {object} The parsed JSON object.
 */
export const cleanAndParseJSON = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if present (e.g., ```json or ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  cleaned = cleaned.trim();

  // Find the first opening brace and the last closing brace to isolate the JSON block
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
};

/**
 * Standardized logging utility with levels and ISO timestamps.
 */
export const logger = {
  info: (msg, ...args) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, ...args);
  }
};
