/**
 * Utility functions for formatting stock numbers in Indian style
 */

/**
 * Formats a number to Indian style commas (e.g. 29273015 -> 2,92,73,015)
 * @param {number|string} num 
 * @returns {string}
 */
export const formatVolume = (num) => {
  if (num === undefined || num === null || num === "N/A") return "N/A";
  const parsed = Number(num);
  if (isNaN(parsed)) return "N/A";
  return parsed.toLocaleString("en-IN");
};

/**
 * Formats market capitalization to Lakh Crores or Crores (e.g. 4094140000000 -> ₹4.09 L Cr)
 * @param {number|string} num 
 * @returns {string}
 */
export const formatMarketCap = (num) => {
  if (num === undefined || num === null || num === "N/A") return "N/A";
  const parsed = Number(num);
  if (isNaN(parsed)) return "N/A";

  const LAKH_CRORE = 1000000000000; // 10^12
  const CRORE = 10000000; // 10^7

  if (parsed >= LAKH_CRORE) {
    const value = parsed / LAKH_CRORE;
    return `₹${value.toFixed(2)} L Cr`;
  } else if (parsed >= CRORE) {
    const value = parsed / CRORE;
    return `₹${value.toFixed(2)} Cr`;
  } else {
    return `₹${parsed.toLocaleString("en-IN")}`;
  }
};

/**
 * Formats a percentage value to 2 decimal places (e.g. 1.2345 -> 1.23%)
 * @param {number|string} num 
 * @param {boolean} showSign Whether to prefix + for positive numbers
 * @returns {string}
 */
export const formatPercent = (num, showSign = false) => {
  if (num === undefined || num === null || num === "N/A") return "N/A";
  const parsed = Number(num);
  if (isNaN(parsed)) return "N/A";
  
  const sign = showSign && parsed > 0 ? "+" : "";
  return `${sign}${parsed.toFixed(2)}%`;
};

/**
 * Formats a price value to Rupees (e.g. 1278.8 -> ₹1,278.80)
 * @param {number|string} num 
 * @returns {string}
 */
export const formatPrice = (num) => {
  if (num === undefined || num === null || num === "N/A") return "N/A";
  const parsed = Number(num);
  if (isNaN(parsed)) return "N/A";

  return `₹${parsed.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats general numeric metrics (e.g. PE, PB, EPS) to 2 decimals
 * @param {number|string} num 
 * @returns {string}
 */
export const formatMetric = (num) => {
  if (num === undefined || num === null || num === "N/A") return "N/A";
  const parsed = Number(num);
  if (isNaN(parsed)) return "N/A";
  return parsed.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
